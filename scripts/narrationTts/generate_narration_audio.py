"""Batch narration audio generation via Qwen3-TTS voice cloning.

Generates one audio file per narration segment from a provided reference voice,
for the story-module pipeline (docs/Workflows/STORY-MODULE-TEMPLATE/05-BUILD-UAT.md).
Based on the proven smoke script at C:/AI/qwen3-tts-smoke-output/.

Requires the Qwen3-TTS venv (default C:/AI/qwen3-tts-env) and the local model
(default C:/AI/Qwen3-TTS-12Hz-1.7B-Base). Run:

  C:/AI/qwen3-tts-env/Scripts/python.exe scripts/narrationTts/generate_narration_audio.py \
    --manifest segments.json --ref-audio voice.wav --ref-text "exact transcript of voice.wav" \
    --out-dir public/narration/gao-002

Manifest format: JSON array of {"id": "<narrationId>", "text": "<full script>",
"language": "English"?}. Output: <out-dir>/<sanitized-id>.<ext> per segment plus
a results JSON (default <out-dir>/generation-results.json) recording file,
duration, and any per-segment error — the pipeline's audio-verify step consumes it.

The reference audio should be a clean 5-15s WAV/MP3 with ref-text as its exact
transcript. (.m4a often works via soundfile/ffmpeg but WAV is the safe choice.)
MP3 output requires ffmpeg on PATH; default is WAV.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path


def sanitize(seg_id: str) -> str:
    return re.sub(r"[^a-z0-9._-]+", "-", seg_id.lower()).strip("-")


def main() -> int:
    ap = argparse.ArgumentParser(description="Batch Qwen3-TTS voice-clone narration generation")
    ap.add_argument("--manifest", required=True, help="JSON array of {id, text, language?}")
    ap.add_argument("--ref-audio", required=True, help="reference voice sample (wav preferred)")
    ap.add_argument("--ref-text", required=True, help="exact transcript of the reference sample")
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--model-path", default=r"C:/AI/Qwen3-TTS-12Hz-1.7B-Base")
    ap.add_argument("--language", default="English", help="default language when a segment has none")
    ap.add_argument("--ext", choices=["wav", "mp3"], default="wav", help="mp3 requires ffmpeg on PATH")
    ap.add_argument("--only", default="", help="comma-separated segment ids to (re)generate")
    ap.add_argument("--skip-existing", action="store_true")
    ap.add_argument("--results", default="", help="results JSON path (default <out-dir>/generation-results.json)")
    args = ap.parse_args()

    if args.ext == "mp3" and not shutil.which("ffmpeg"):
        print("ERROR: --ext mp3 requires ffmpeg on PATH (or use wav)", file=sys.stderr)
        return 2

    segments = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    only = {s.strip() for s in args.only.split(",") if s.strip()}
    if only:
        segments = [s for s in segments if s["id"] in only]
    if not segments:
        print("ERROR: no segments to generate", file=sys.stderr)
        return 2

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    results_path = Path(args.results) if args.results else out_dir / "generation-results.json"

    import soundfile as sf  # deferred: only available inside the TTS venv
    import torch
    from qwen_tts import Qwen3TTSModel

    print(f"cuda_available={torch.cuda.is_available()} model={args.model_path} segments={len(segments)}")
    t0 = time.time()
    tts = Qwen3TTSModel.from_pretrained(
        args.model_path,
        device_map="cuda:0" if torch.cuda.is_available() else "cpu",
        dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        attn_implementation="eager",
    )
    print(f"loaded_seconds={round(time.time() - t0, 2)}")

    results: list[dict] = []
    for i, seg in enumerate(segments, 1):
        seg_id, text = seg["id"], seg["text"].strip()
        wav_path = out_dir / f"{sanitize(seg_id)}.wav"
        final_path = out_dir / f"{sanitize(seg_id)}.{args.ext}"
        if args.skip_existing and final_path.exists() and final_path.stat().st_size > 0:
            results.append({"id": seg_id, "file": final_path.name, "skipped": True})
            print(f"[{i}/{len(segments)}] {seg_id} SKIP (exists)")
            continue
        try:
            t1 = time.time()
            wavs, sr = tts.generate_voice_clone(
                text=text,
                language=seg.get("language") or args.language,
                ref_audio=args.ref_audio,
                ref_text=args.ref_text,
                x_vector_only_mode=True,
                max_new_tokens=4096,
                do_sample=True,
                top_k=50,
                top_p=1.0,
                temperature=0.8,
                repetition_penalty=1.05,
                subtalker_dosample=True,
                subtalker_top_k=50,
                subtalker_top_p=1.0,
                subtalker_temperature=0.8,
            )
            if torch.cuda.is_available():
                torch.cuda.synchronize()
            sf.write(str(wav_path), wavs[0], sr)
            seconds = round(len(wavs[0]) / sr, 2)
            if args.ext == "mp3":
                subprocess.run(
                    ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-b:a", "128k", str(final_path)],
                    check=True,
                )
                wav_path.unlink(missing_ok=True)
            results.append({
                "id": seg_id, "file": final_path.name, "seconds": seconds, "sr": sr,
                "gen_seconds": round(time.time() - t1, 2), "words": len(text.split()),
            })
            print(f"[{i}/{len(segments)}] {seg_id} OK {seconds}s audio")
        except Exception as e:  # keep batching; verify step handles failures
            results.append({"id": seg_id, "error": str(e)})
            print(f"[{i}/{len(segments)}] {seg_id} FAILED: {e}", file=sys.stderr)

    results_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    failed = [r for r in results if r.get("error")]
    print(f"done generated={len(results) - len(failed)} failed={len(failed)} results={results_path}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())

import io
import json
import time
import uuid
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageStat

SERVER = "127.0.0.1:8188"
CLIENT_ID = str(uuid.uuid4())

PROMPT = {
    "1": {
        "class_type": "UNETLoader",
        "inputs": {"unet_name": "flux1-dev.safetensors", "weight_dtype": "default"},
    },
    "2": {
        "class_type": "DualCLIPLoader",
        "inputs": {
            "clip_name1": "clip_l.safetensors",
            "clip_name2": "t5xxl_fp16.safetensors",
            "type": "flux",
            "device": "default",
        },
    },
    "3": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
    "4": {
        "class_type": "CLIPTextEncodeFlux",
        "inputs": {
            "clip": ["2", 0],
            "clip_l": "ultra photorealistic documentary photo of a diverse home health clinical team assisting an elderly patient in a bright living room, authentic skin texture, realistic facial proportions, natural window lighting, subtle film grain, 35mm lens, shallow depth of field, editorial healthcare photography",
            "t5xxl": "ultra photorealistic documentary photo of a diverse home health clinical team assisting an elderly patient in a bright living room, authentic skin texture, realistic facial proportions, natural window lighting, subtle film grain, 35mm lens, shallow depth of field, editorial healthcare photography",
            "guidance": 3.5,
        },
    },
    "5": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["4", 0]}},
    "6": {
        "class_type": "EmptySD3LatentImage",
        "inputs": {"width": 1024, "height": 1536, "batch_size": 1},
    },
    "7": {
        "class_type": "ModelSamplingFlux",
        "inputs": {
            "model": ["1", 0],
            "max_shift": 1.15,
            "base_shift": 0.5,
            "width": 1024,
            "height": 1536,
        },
    },
    "8": {
        "class_type": "KSampler",
        "inputs": {
            "model": ["7", 0],
            "seed": 123456789,
            "steps": 28,
            "cfg": 1.0,
            "sampler_name": "euler",
            "scheduler": "simple",
            "denoise": 1.0,
            "positive": ["4", 0],
            "negative": ["5", 0],
            "latent_image": ["6", 0],
        },
    },
    "9": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["3", 0]}},
    "10": {
        "class_type": "SaveImage",
        "inputs": {"filename_prefix": "flux_photoreal_test", "images": ["9", 0]},
    },
}


def req(url: str, payload: dict | None = None) -> bytes:
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        req_obj = urllib.request.Request(
            url, data=data, headers={"Content-Type": "application/json"}
        )
    else:
        req_obj = urllib.request.Request(url)
    with urllib.request.urlopen(req_obj, timeout=120) as resp:
        return resp.read()


def main() -> None:
    prompt_id = str(uuid.uuid4())
    req(
        f"http://{SERVER}/prompt",
        {"prompt": PROMPT, "client_id": CLIENT_ID, "prompt_id": prompt_id},
    )

    start = time.time()
    while True:
        history = json.loads(req(f"http://{SERVER}/history/{prompt_id}"))
        if prompt_id in history:
            break
        if time.time() - start > 300:
            raise TimeoutError("Generation timeout after 300 seconds")
        time.sleep(1)

    entry = history[prompt_id]
    outputs = entry.get("outputs", {})
    img_meta = None
    for _node_id, node_out in outputs.items():
        if "images" in node_out and node_out["images"]:
            img_meta = node_out["images"][0]
            break
    if not img_meta:
        raise RuntimeError("No output image found")

    query = urllib.parse.urlencode(
        {
            "filename": img_meta["filename"],
            "subfolder": img_meta["subfolder"],
            "type": img_meta["type"],
        }
    )
    img_bytes = req(f"http://{SERVER}/view?{query}")
    image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    stat = ImageStat.Stat(image)
    detail_score = sum(stat.stddev) / 3.0

    out = Path(
        r"c:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\flux_photoreal_test_result.png"
    )
    out.write_bytes(img_bytes)
    print(f"saved={out}")
    print(f"size={image.size} detail_stddev={detail_score:.2f}")
    print(
        f"server_file={img_meta['filename']} subfolder={img_meta['subfolder']} type={img_meta['type']}"
    )


if __name__ == "__main__":
    main()

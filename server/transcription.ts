import { log } from './logger.js';
import { ApiError } from './errors.js';

/**
 * Provider-agnostic call-recording transcription.
 *
 *   STT_PROVIDER = 'local' (default, MVP)  →  a local ASR server (Qwen / Whisper /
 *                  faster-whisper / LocalAI, etc.) exposed over an OpenAI-compatible
 *                  /v1/audio/transcriptions multipart endpoint. No PHI leaves the box.
 *   STT_PROVIDER = 'vertex' (production)   →  Google Cloud Speech-to-Text (BAA-covered).
 *                  Seam only — wire in production on Vertex AI Studio.
 *
 * Env (local):
 *   STT_LOCAL_URL      full endpoint URL (default http://127.0.0.1:8000/v1/audio/transcriptions)
 *   STT_LOCAL_MODEL    model name to send (default 'whisper-1')
 *   STT_LOCAL_API_KEY  optional bearer token for the local server
 */
export interface TranscriptionResult { text: string; provider: string }

const PROVIDER = (process.env.STT_PROVIDER || 'local').toLowerCase();

export async function transcribeAudio(buffer: Buffer, filename: string, mimeType: string): Promise<TranscriptionResult> {
  if (PROVIDER === 'vertex') return transcribeVertex();
  return transcribeLocal(buffer, filename, mimeType);
}

async function transcribeLocal(buffer: Buffer, filename: string, mimeType: string): Promise<TranscriptionResult> {
  const url = process.env.STT_LOCAL_URL || 'http://127.0.0.1:8000/v1/audio/transcriptions';
  const model = process.env.STT_LOCAL_MODEL || 'whisper-1';
  const form = new FormData();
  // Node 18+ provides global FormData/Blob/fetch.
  form.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType || 'application/octet-stream' }), filename || 'recording.wav');
  form.append('model', model);
  const headers: Record<string, string> = {};
  if (process.env.STT_LOCAL_API_KEY) headers.Authorization = `Bearer ${process.env.STT_LOCAL_API_KEY}`;

  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', body: form, headers });
  } catch (e) {
    log.warn('transcribe.local.unreachable', { url, error: e instanceof Error ? e.message : String(e) });
    throw new ApiError('validation_error', `Local transcription server unreachable at ${url}. Start your local ASR server or set STT_LOCAL_URL.`, 503);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError('validation_error', `Local transcription failed (${res.status}). ${body.slice(0, 200)}`, 502);
  }
  // OpenAI-compatible servers return { text }; tolerate a plain-string body too.
  const ct = res.headers.get('content-type') || '';
  let text = '';
  if (ct.includes('application/json')) {
    const data = await res.json().catch(() => ({})) as { text?: string };
    text = typeof data.text === 'string' ? data.text : '';
  } else {
    text = await res.text().catch(() => '');
  }
  log.info('transcribe.local.ok', { url, model, chars: text.length });
  return { text, provider: 'local' };
}

function transcribeVertex(): never {
  throw new ApiError('validation_error', 'Vertex transcription is not configured. Use STT_PROVIDER=local for the MVP; wire Google Cloud Speech-to-Text in production.', 501);
}

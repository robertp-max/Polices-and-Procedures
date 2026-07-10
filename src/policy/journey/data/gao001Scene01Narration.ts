/**
 * Re-export Scene 1 narration catalog from the organized gao001/scene01 module.
 * Prefer importing from `./gao001/scene01/narration` for new code.
 */
export {
  GAO001_S01_AUDIO_BASE,
  GAO001_S01_CLIPS,
  GAO001_S01_OVERLAY_BY_HOTSPOT,
  GAO001_S01_SHELL_LOCATION,
  GAO001_S01_NARRATION_LABELS,
  GAO001_SCENE01_NARRATION_SRC,
  GAO001_SCENE01_NARRATION_TRANSCRIPT,
  GAO001_SCENE01_NARRATION,
  type Gao001S01ClipId,
  type Gao001S01NarrationClip,
} from './gao001/scene01/narration';

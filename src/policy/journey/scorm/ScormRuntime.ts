/* ═══════════════════════════════════════════════════════════════
   SCORM 1.2 RUNTIME (ADL SCORM 1.2 RTE v1.3.4)
   Exposes window.API so a SCORM 1.2 package running in a child
   iframe can read & write cmi.* values. The runtime hands data
   back to a callback for persistence into the journeyStore.

   Supported subset (sufficient for "passed/failed + suspend/resume"):
     • LMSInitialize("")          → "true"
     • LMSFinish("")              → "true"
     • LMSGetValue(element)
     • LMSSetValue(element, val)  → "true"/"false"
     • LMSCommit("")              → "true"
     • LMSGetLastError()
     • LMSGetErrorString(code)
     • LMSGetDiagnostic(code)

   Writable cmi elements:
     cmi.core.lesson_status, cmi.core.score.raw/min/max,
     cmi.core.lesson_location, cmi.core.exit,
     cmi.core.session_time, cmi.suspend_data
   ═══════════════════════════════════════════════════════════════ */

export type ScormLessonStatus =
  | 'not attempted'
  | 'browsed'
  | 'incomplete'
  | 'completed'
  | 'passed'
  | 'failed';

export interface ScormData {
  lesson_status: ScormLessonStatus;
  score_raw: string;
  score_min: string;
  score_max: string;
  lesson_location: string;
  suspend_data: string;
  session_time: string;    // HH:MM:SS.SS
  total_time: string;      // HH:MM:SS.SS
  exit: string;
  student_id: string;
  student_name: string;
  entry: 'ab-initio' | 'resume' | '';
}

const EMPTY: ScormData = {
  lesson_status: 'not attempted',
  score_raw: '',
  score_min: '0',
  score_max: '100',
  lesson_location: '',
  suspend_data: '',
  session_time: '00:00:00.00',
  total_time: '00:00:00.00',
  exit: '',
  student_id: '',
  student_name: '',
  entry: '',
};

export interface ScormRuntimeHandlers {
  onCommit: (data: ScormData) => void;
  onFinish: (data: ScormData) => void;
  getInitial: () => Partial<ScormData>;
}

/** Installs window.API with the runtime. Returns an uninstaller. */
export function installScorm12API(handlers: ScormRuntimeHandlers): () => void {
  const data: ScormData = { ...EMPTY, ...handlers.getInitial() };
  let initialized = false;
  let finished = false;
  let lastError = '0';

  const api = {
    LMSInitialize(_: string): string {
      if (initialized) { lastError = '101'; return 'false'; }
      initialized = true;
      lastError = '0';
      if (!data.entry) data.entry = data.suspend_data ? 'resume' : 'ab-initio';
      return 'true';
    },

    LMSFinish(_: string): string {
      if (!initialized || finished) { lastError = '301'; return 'false'; }
      finished = true;
      handlers.onFinish({ ...data });
      return 'true';
    },

    LMSGetValue(element: string): string {
      if (!initialized) { lastError = '301'; return ''; }
      lastError = '0';
      switch (element) {
        case 'cmi.core.lesson_status':   return data.lesson_status;
        case 'cmi.core.score.raw':       return data.score_raw;
        case 'cmi.core.score.min':       return data.score_min;
        case 'cmi.core.score.max':       return data.score_max;
        case 'cmi.core.lesson_location': return data.lesson_location;
        case 'cmi.suspend_data':         return data.suspend_data;
        case 'cmi.core.session_time':    return data.session_time;
        case 'cmi.core.total_time':      return data.total_time;
        case 'cmi.core.exit':            return data.exit;
        case 'cmi.core.student_id':      return data.student_id;
        case 'cmi.core.student_name':    return data.student_name;
        case 'cmi.core.entry':           return data.entry;
        default:
          lastError = '201';
          return '';
      }
    },

    LMSSetValue(element: string, value: string): string {
      if (!initialized) { lastError = '301'; return 'false'; }
      lastError = '0';
      switch (element) {
        case 'cmi.core.lesson_status':
          data.lesson_status = value as ScormLessonStatus;
          return 'true';
        case 'cmi.core.score.raw':       data.score_raw = value;       return 'true';
        case 'cmi.core.score.min':       data.score_min = value;       return 'true';
        case 'cmi.core.score.max':       data.score_max = value;       return 'true';
        case 'cmi.core.lesson_location': data.lesson_location = value; return 'true';
        case 'cmi.suspend_data':         data.suspend_data = value;    return 'true';
        case 'cmi.core.session_time':    data.session_time = value;    return 'true';
        case 'cmi.core.exit':            data.exit = value;            return 'true';
        default:
          lastError = '401';
          return 'false';
      }
    },

    LMSCommit(_: string): string {
      if (!initialized) { lastError = '301'; return 'false'; }
      handlers.onCommit({ ...data });
      return 'true';
    },

    LMSGetLastError(): string { return lastError; },
    LMSGetErrorString(code: string): string {
      return (
        {
          '0': 'No error',
          '101': 'General exception',
          '201': 'Invalid argument error',
          '301': 'Not initialized',
          '401': 'Not implemented error',
        } as Record<string, string>
      )[code] ?? 'Unknown error';
    },
    LMSGetDiagnostic(code: string): string { return this.LMSGetErrorString(code); },
  };

  (window as unknown as { API: unknown }).API = api;
  return () => {
    try {
      /**
       * On unmount, only finalize if the package explicitly flagged a
       * terminal status. Otherwise, commit whatever we have so suspend_data
       * and session_time are preserved for resume — NEVER force a finish
       * or the attempt would be prematurely locked with an incomplete score.
       */
      if (initialized && !finished) {
        if (data.lesson_status === 'passed' || data.lesson_status === 'failed' || data.lesson_status === 'completed') {
          handlers.onFinish({ ...data });
        } else {
          data.exit = data.exit || 'suspend';
          handlers.onCommit({ ...data });
        }
      }
    } finally {
      delete (window as unknown as { API?: unknown }).API;
    }
  };
}

/** Convert HH:MM:SS[.SS] → seconds. */
export function scormTimeToSeconds(t: string): number {
  if (!t) return 0;
  const [h = '0', m = '0', s = '0'] = t.split(':');
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/** Convert seconds → HH:MM:SS.SS. */
export function secondsToScormTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60).toFixed(2);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(5, '0')}`;
}

export const EMPTY_SCORM_DATA = EMPTY;

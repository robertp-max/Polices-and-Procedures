/**
 * scorm12-api.js — SCORM 1.2 Runtime Bridge for Moodle LMS
 * CareIndeed OASIS-E2 SOC Simulation Engine
 *
 * This file implements the window.SCORM interface that the app expects,
 * translating all calls into SCORM 1.2 API calls (LMSInitialize, LMSSetValue, etc.).
 *
 * Must be loaded BEFORE the app bundle in index.html.
 */
(function () {
  'use strict';

  // ─── SCORM 1.2 API Discovery ──────────────────────────────────────────────
  // The LMS provides an "API" object on a parent/opener window.
  // We search up the window hierarchy to find it.

  var _api = null;
  var _initialized = false;
  var _terminated = false;
  var _interactionCount = 0;
  var _objectiveCount = 0;
  var _sessionStartTime = null;
  var _debug = false;

  // Enable debug by adding ?scormdebug=1 to URL
  try {
    if (window.location.search.indexOf('scormdebug=1') !== -1) _debug = true;
  } catch (e) { /* ignore */ }

  function log() {
    if (!_debug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[SCORM12]');
    console.log.apply(console, args);
  }

  function warn() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[SCORM12]');
    console.warn.apply(console, args);
  }

  /**
   * Find the SCORM 1.2 API adapter object.
   * Moodle embeds SCOs in an iframe; the API object is on the parent.
   */
  function findAPI(win) {
    var attempts = 0;
    var maxAttempts = 500;
    while (win && !win.API && attempts < maxAttempts) {
      attempts++;
      if (win.parent && win.parent !== win) {
        win = win.parent;
      } else if (win.opener && win.opener !== win) {
        win = win.opener;
      } else {
        break;
      }
    }
    return win && win.API ? win.API : null;
  }

  function getAPI() {
    if (_api) return _api;
    // Search parent chain first, then opener
    _api = findAPI(window);
    if (!_api && window.opener) {
      _api = findAPI(window.opener);
    }
    if (_api) {
      log('API adapter found');
    } else {
      warn('No SCORM 1.2 API adapter found — running in standalone/offline mode');
    }
    return _api;
  }

  // ─── Low-level SCORM 1.2 calls ────────────────────────────────────────────

  function lmsInitialize() {
    var api = getAPI();
    if (!api) return false;
    var result = api.LMSInitialize('');
    log('LMSInitialize:', result);
    return result === 'true' || result === true;
  }

  function lmsFinish() {
    var api = getAPI();
    if (!api) return false;
    var result = api.LMSFinish('');
    log('LMSFinish:', result);
    return result === 'true' || result === true;
  }

  function lmsGetValue(key) {
    var api = getAPI();
    if (!api) return '';
    var val = api.LMSGetValue(key);
    log('LMSGetValue(' + key + '):', val);
    return val != null ? String(val) : '';
  }

  function lmsSetValue(key, val) {
    var api = getAPI();
    if (!api) return false;
    var result = api.LMSSetValue(key, String(val));
    log('LMSSetValue(' + key + ',', val, '):', result);
    return result === 'true' || result === true;
  }

  function lmsCommit() {
    var api = getAPI();
    if (!api) return false;
    var result = api.LMSCommit('');
    log('LMSCommit:', result);
    return result === 'true' || result === true;
  }

  function lmsGetLastError() {
    var api = getAPI();
    if (!api) return '0';
    return String(api.LMSGetLastError());
  }

  function lmsGetErrorString(code) {
    var api = getAPI();
    if (!api) return '';
    return String(api.LMSGetErrorString(code));
  }

  // ─── ISO 8601 duration for SCORM 1.2 (HH:MM:SS.ss) ───────────────────────

  function formatSessionTime(ms) {
    var totalSec = Math.floor(ms / 1000);
    var hours = Math.floor(totalSec / 3600);
    var minutes = Math.floor((totalSec % 3600) / 60);
    var seconds = totalSec % 60;
    var hundredths = Math.floor((ms % 1000) / 10);
    return (
      String(hours).padStart(2, '0') + ':' +
      String(minutes).padStart(2, '0') + ':' +
      String(seconds).padStart(2, '0') + '.' +
      String(hundredths).padStart(2, '0')
    );
  }

  // ─── SCORM 1.2 Interaction Type Mapping ────────────────────────────────────

  var INTERACTION_TYPES = {
    'choice': 'choice',
    'true-false': 'true-false',
    'fill-in': 'fill-in',
    'matching': 'matching',
    'performance': 'performance',
    'sequencing': 'sequencing',
    'likert': 'likert',
    'numeric': 'numeric',
  };

  // ─── window.SCORM Bridge ──────────────────────────────────────────────────
  // Implements the exact interface expected by scorm2004Service.ts

  window.SCORM = {

    /**
     * Initialize the SCORM 1.2 session.
     */
    init: function () {
      if (_initialized) {
        log('Already initialized, skipping');
        return;
      }
      var ok = lmsInitialize();
      if (ok) {
        _initialized = true;
        _terminated = false;
        _sessionStartTime = Date.now();

        // Read existing interaction count to avoid overwriting on resume
        var countStr = lmsGetValue('cmi.interactions._count');
        _interactionCount = parseInt(countStr, 10) || 0;

        // Read existing objective count
        var objCountStr = lmsGetValue('cmi.objectives._count');
        _objectiveCount = parseInt(objCountStr, 10) || 0;

        // Set initial status if this is a new attempt
        var status = lmsGetValue('cmi.core.lesson_status');
        if (!status || status === 'not attempted' || status === '') {
          lmsSetValue('cmi.core.lesson_status', 'incomplete');
          lmsCommit();
        }

        log('Session initialized. Status:', status, 'Interactions:', _interactionCount);
      } else {
        warn('LMSInitialize failed. Error:', lmsGetLastError());
      }
    },

    /**
     * Terminate the SCORM session (commit + finish).
     */
    terminate: function () {
      if (_terminated || !_initialized) return;
      _terminated = true;

      // Write session time
      if (_sessionStartTime) {
        var elapsed = Date.now() - _sessionStartTime;
        lmsSetValue('cmi.core.session_time', formatSessionTime(elapsed));
      }

      // Set exit to 'suspend' so learner can resume
      lmsSetValue('cmi.core.exit', 'suspend');
      lmsCommit();
      lmsFinish();
      _initialized = false;
      log('Session terminated');
    },

    /**
     * Finish the session (alias for terminate — used by completeFinalReview).
     */
    finish: function () {
      this.terminate();
    },

    /**
     * Set the learner's current location (bookmark).
     * SCORM 1.2: cmi.core.lesson_location (max 255 chars).
     */
    setLocation: function (loc) {
      if (!_initialized) return;
      var truncated = String(loc).substring(0, 255);
      lmsSetValue('cmi.core.lesson_location', truncated);
      lmsCommit();
    },

    /**
     * Get the learner's last location (bookmark).
     */
    getLocation: function () {
      return lmsGetValue('cmi.core.lesson_location');
    },

    /**
     * Get entry mode: 'ab-initio' (new) or 'resume'.
     * SCORM 1.2: cmi.core.entry
     */
    getEntry: function () {
      var entry = lmsGetValue('cmi.core.entry');
      // Moodle returns 'ab-initio' or 'resume' or ''
      return entry || 'ab-initio';
    },

    /**
     * Set progress measure.
     * SCORM 1.2 has no cmi.progress_measure — we store it in lesson_location prefix
     * and also set suspend_data metadata. The score updates handle grade visibility.
     */
    setProgress: function (done, total) {
      if (!_initialized) return;
      // No direct progress_measure in SCORM 1.2, but we commit to keep state fresh
      lmsCommit();
      log('Progress:', done, '/', total);
    },

    /**
     * Record an interaction (question/answer) for audit tracking.
     * SCORM 1.2: cmi.interactions.n.*
     */
    recordInteraction: function (opts) {
      if (!_initialized) return;

      var n = _interactionCount;
      var id = String(opts.id || 'q' + n).substring(0, 255);
      var type = INTERACTION_TYPES[opts.type || 'choice'] || 'choice';
      var response = String(opts.response != null ? opts.response : '').substring(0, 255);
      var result = opts.correct ? 'correct' : 'wrong';

      // SCORM 1.2 interaction fields
      lmsSetValue('cmi.interactions.' + n + '.id', id);
      lmsSetValue('cmi.interactions.' + n + '.type', type);
      lmsSetValue('cmi.interactions.' + n + '.student_response', response);
      lmsSetValue('cmi.interactions.' + n + '.result', result);

      // Timestamp (SCORM 1.2 format: HH:MM:SS)
      var now = new Date();
      var timeStamp = (
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0')
      );
      lmsSetValue('cmi.interactions.' + n + '.time', timeStamp);

      // Latency if provided
      if (opts.latency_ms != null) {
        lmsSetValue('cmi.interactions.' + n + '.latency', formatSessionTime(opts.latency_ms));
      }

      // Correct response pattern
      if (opts.correct_response != null) {
        lmsSetValue('cmi.interactions.' + n + '.correct_responses.0.pattern', String(opts.correct_response));
      }

      // Description stored as weighting (SCORM 1.2 has no description field for interactions)
      // We'll put a truncated description in the id if needed

      _interactionCount = n + 1;
      lmsCommit();
      log('Interaction #' + n + ':', id, '=', response, '(' + result + ')');
    },

    /**
     * Write an objective (section score) to cmi.objectives.n.*
     * SCORM 1.2: cmi.objectives.n.id, .score.raw, .score.max, .score.min, .status
     */
    objective: function (opts) {
      if (!_initialized) return;

      var n = opts.index;
      var id = String(opts.id || 'obj' + n).substring(0, 255);
      var scoreRaw = Math.round(Number(opts.scoreRaw) || 0);
      var maxScore = Math.round(Number(opts.maxScore) || 100);
      var status;

      if (!opts.completed) {
        status = 'incomplete';
      } else if (opts.passed) {
        status = 'passed';
      } else {
        status = 'failed';
      }

      lmsSetValue('cmi.objectives.' + n + '.id', id);
      lmsSetValue('cmi.objectives.' + n + '.score.raw', String(scoreRaw));
      lmsSetValue('cmi.objectives.' + n + '.score.max', String(maxScore));
      lmsSetValue('cmi.objectives.' + n + '.score.min', '0');
      lmsSetValue('cmi.objectives.' + n + '.status', status);

      // Track max objective index
      if (n >= _objectiveCount) {
        _objectiveCount = n + 1;
      }

      lmsCommit();
      log('Objective #' + n + ':', id, '= score', scoreRaw, '/', maxScore, status);
    },

    /**
     * Get a raw SCORM value (used by debug panel).
     * Maps SCORM 2004 keys to SCORM 1.2 equivalents transparently.
     */
    getValue: function (key) {
      if (!_initialized) return '';

      // Map 2004 keys → 1.2 keys for backward compatibility
      var keyMap = {
        'cmi.completion_status':  'cmi.core.lesson_status',
        'cmi.success_status':     'cmi.core.lesson_status',
        'cmi.progress_measure':   '',  // Not available in 1.2
        'cmi.score.raw':          'cmi.core.score.raw',
        'cmi.score.min':          'cmi.core.score.min',
        'cmi.score.max':          'cmi.core.score.max',
        'cmi.location':           'cmi.core.lesson_location',
        'cmi.session_time':       'cmi.core.session_time',
        'cmi.exit':               'cmi.core.exit',
        'cmi._version':           'cmi._version',
        'cmi.suspend_data':       'cmi.suspend_data',
        'cmi.core.exit':          'cmi.core.exit',
      };

      var mappedKey = keyMap[key] !== undefined ? keyMap[key] : key;
      if (mappedKey === '') return '';  // Not supported

      return lmsGetValue(mappedKey);
    },

    /**
     * Mark the course as complete with a final score.
     * SCORM 1.2: Set cmi.core.score.raw and cmi.core.lesson_status.
     */
    complete: function (scoreRaw) {
      if (!_initialized) return;

      var score = Math.round(Number(scoreRaw) || 0);
      var passed = score >= 80;

      lmsSetValue('cmi.core.score.raw', String(score));
      lmsSetValue('cmi.core.score.min', '0');
      lmsSetValue('cmi.core.score.max', '100');

      // SCORM 1.2: lesson_status = 'passed' or 'failed' (replaces both
      // completion_status and success_status from SCORM 2004)
      lmsSetValue('cmi.core.lesson_status', passed ? 'passed' : 'failed');

      // Set mastery score for Moodle grade passback
      // cmi.student_data.mastery_score is read-only in SCORM 1.2
      // but we ensure the score is committed properly
      lmsCommit();
      log('Course completed. Score:', score, 'Status:', passed ? 'PASSED' : 'FAILED');
    },

    /**
     * Save suspend_data (JSON-serialized learner state).
     * SCORM 1.2: cmi.suspend_data (max 4096 chars).
     */
    suspend: function (data) {
      if (!_initialized) return;
      try {
        var json = JSON.stringify(data);
        // SCORM 1.2 limit is 4096 chars for suspend_data
        if (json.length > 4096) {
          warn('suspend_data exceeds 4096 chars (' + json.length + '). Compressing...');
          json = compressSuspendData(data);
        }
        lmsSetValue('cmi.suspend_data', json);
        lmsCommit();
        log('Suspend data saved (' + json.length + ' chars)');
      } catch (e) {
        warn('Failed to save suspend_data:', e);
      }
    },

    /**
     * Restore suspend_data from a previous session.
     */
    restore: function () {
      var raw = lmsGetValue('cmi.suspend_data');
      if (!raw || raw === '') return null;
      try {
        var parsed = JSON.parse(raw);
        log('Suspend data restored:', Object.keys(parsed).length, 'keys');
        return parsed;
      } catch (e) {
        warn('Failed to parse suspend_data:', e);
        return null;
      }
    },

    /**
     * Check if the LMS API is available and session is active.
     */
    isLmsConnected: function () {
      return _initialized && getAPI() !== null;
    },
  };

  // ─── Suspend Data Compression ──────────────────────────────────────────────
  // Strips non-essential fields to fit within 4096 char SCORM 1.2 limit

  function compressSuspendData(data) {
    // Create a minimal copy
    var slim = {
      v: data.v || 2,
      cs: data.completedSections || [],
      ci: data.completedItems || [],
      s: data.currentSection || '',
      sa: {},  // submitted answers (compact)
      co: {},  // correct map (compact: 1/0)
      ss: {},  // section scores (compact)
      fs: data.finalScore,
      p: data.passed ? 1 : 0,
    };

    // Compact answers: only store code values
    if (data.submittedAnswers) {
      for (var key in data.submittedAnswers) {
        slim.sa[key] = data.submittedAnswers[key];
      }
    }

    // Compact correct map: use 1/0 instead of true/false
    if (data.correct) {
      for (var key2 in data.correct) {
        slim.co[key2] = data.correct[key2] ? 1 : 0;
      }
    }

    // Compact section scores
    if (data.sectionScores) {
      for (var key3 in data.sectionScores) {
        var sc = data.sectionScores[key3];
        slim.ss[key3] = [sc.raw, sc.passed ? 1 : 0];
      }
    }

    var result = JSON.stringify(slim);

    // If still too long, drop submitted answers (they're tracked in interactions)
    if (result.length > 4096) {
      delete slim.sa;
      result = JSON.stringify(slim);
    }

    // If STILL too long, drop correct map
    if (result.length > 4096) {
      delete slim.co;
      result = JSON.stringify(slim);
    }

    return result;
  }

  // ─── Auto-decompression on restore ─────────────────────────────────────────
  // Override restore to handle both compressed and full formats

  var _originalRestore = window.SCORM.restore;
  window.SCORM.restore = function () {
    var raw = _originalRestore.call(window.SCORM);
    if (!raw) return null;

    // If it's already full format (has 'completedSections'), return as-is
    if (raw.completedSections) return raw;

    // Decompress slim format
    if (raw.cs !== undefined) {
      var full = {
        v: raw.v || 2,
        completedSections: raw.cs || [],
        completedItems: raw.ci || [],
        currentSection: raw.s || 'Disclosure',
        currentItem: null,
        submittedAnswers: raw.sa || {},
        correct: {},
        sectionScores: {},
        finalScore: raw.fs != null ? raw.fs : null,
        passed: raw.p === 1,
      };

      // Decompress correct map
      if (raw.co) {
        for (var key in raw.co) {
          full.correct[key] = raw.co[key] === 1;
        }
      }

      // Decompress section scores
      if (raw.ss) {
        for (var key2 in raw.ss) {
          var arr = raw.ss[key2];
          full.sectionScores[key2] = { raw: arr[0], passed: arr[1] === 1 };
        }
      }

      return full;
    }

    return raw;
  };

  // ─── Graceful Unload ───────────────────────────────────────────────────────
  // Ensure session is properly closed on page unload

  window.addEventListener('beforeunload', function () {
    if (_initialized && !_terminated) {
      window.SCORM.terminate();
    }
  });

  // ─── Offline / Standalone Detection ────────────────────────────────────────
  // If no LMS is found, window.SCORM still works but does nothing harmful

  log('SCORM 1.2 API Bridge loaded. LMS API:', getAPI() ? 'detected' : 'not found (standalone mode)');

})();

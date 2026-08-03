# W2-QA02 — Static EHR Mirror QA (independent)

| Field | Value |
|-------|--------|
| **Agent** | Wave 2 QA Agent **W2-QA02** (Static EHR Mirror QA) |
| **Date** | 2026-08-03 |
| **Worktree** | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| **Verdict** | **PASS** |

---

## Scope

Independent verification of the vendored static EHR prototype mirror:

1. Recompute SHA256 inventory: Temp source vs `apps/ehr-prototype-static` (all files).
2. Confirm `index.html` title: **Care Indeed Home Health EHR Prototype**.
3. Confirm README isolation: no auth/API wiring into the policy app.
4. Confirm no Fable path in source provenance (Temp + apps only).
5. Optionally hit `http://127.0.0.1:5191/` and document server PID/cmdline; verify title and assets HTTP 200.

---

## Paths under test

| Role | Path |
|------|------|
| **Temp source** | `C:\Users\razer\AppData\Local\Temp\care-indeed-ehr-prototype-local` |
| **Repo mirror** | `...\merge-local-app-surfaces-2026-08-03\apps\ehr-prototype-static` |
| **Live URL** | `http://127.0.0.1:5191/` |

---

## 1. SHA256 inventory (recomputed)

**Method:** PowerShell `Get-ChildItem -Recurse -File` + `Get-FileHash -Algorithm SHA256` on both trees; relative paths normalized to `/`.

### Counts

| Tree | File count |
|------|------------|
| Temp source | **20** |
| `apps/ehr-prototype-static` | **21** |
| **Byte-identical matches** | **20 / 20** shared content files |
| Mismatches | **0** |
| Only Temp | **0** |
| Only app | **1** (`README.md` — intentional isolation/provenance docs) |

### Full inventory (shared content files — all MATCH)

| Rel path | Size | SHA256 |
|----------|------|--------|
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-001175b1.woff2` | 16540 | `58A6B173D5CA1DEC92166EA3C6CB1A84A4144556D10928AC14E8E6B40E4787BD` |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-52306abf.woff2` | 7968 | `F689F638F29FFF460A2D5749EDB5D5C38D7BEF0389F32032D871F23FC6EBB008` |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-875ccdd4.woff2` | 14900 | `6129FC8571C3E0CB0A4C41F5160C974A843B055009DC4AD8858BD808E18A2D86` |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-98bbbccb.woff2` | 29288 | `9B6F5FF45B278C744B5F379A2C4ECBAF858A842B8EAF82AC8D21B699CA16C608` |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-ff2310f5.woff2` | 7252 | `B7A545BBB08256BD809F11CFE66D88DA3E22D169EA4407737B1EF0EC1ED3D791` |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-013b2f2f.woff2` | 23108 | `5F3D6AD60F29D6CB708414EC6887163D63BF197377EF5417D2483FF31ACE6C3B` |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-0638449e.woff2` | 5892 | `D67E4A94BA498635F764DDCA7D1EC4271F5642F032EB24B426764480F66F8497` |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44745446.woff2` | 14712 | `745994B5CD950EC201B66526375F057D540847CCCFC70F4F24F5F571D26D3923` |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44e03052.woff2` | 12872 | `75B3BEDBEBC35F347C0AE3B416AA871941555357E7B0F83767EB5987875589ED` |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-971fb274.woff2` | 7728 | `16E1D48B6DD29EB240AEC5DB36184EB182933C082CD43DE7F35AF686D58087D2` |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-f6b33328.woff2` | 6204 | `E27F657E38D52887BAA3B6B2F812BEF93DFDD356F0810E40EDD4EE284CC7E9F6` |
| `assets/framework-CXnKph_e.js` | 189805 | `73B45B606448E4DC310FBE851D8089EE752F3EB081980B3A6FEC88988820EE12` |
| `assets/index-B6csGzFL.css` | 35631 | `68A75BCED92206693016F04DA3FBDBB26ADD7E9708D646F7F88B34F8021B66C0` |
| `assets/index-CcITSQVe.js` | 80894 | `DA4591C317A85B7866D16E690958F0F537F5BFE0E6B750A2A15F455F4F56C15F` |
| `assets/layout-segment-context-CXNA_Ckw.js` | 288 | `28B88FA653CFEB1538E226A2309BD4B250ED512550EF26FDE9060115EDCE1B67` |
| `assets/page-DYDiOo50.js` | 47913 | `EE00E0709E7C2AC727B189B431A123B1C01B9A396EAB41DBC6CDAEB89765F2B4` |
| `assets/query-D8Wk3mvj.js` | 1564 | `5E3ECC5FD4F80C9C8228CEF75D2D4A8BB5F8F95CA267E7A4E62923AAD52B5DB8` |
| `assets/rolldown-runtime-S-ySWqyJ.js` | 694 | `5DB5BA82EEF00D1DEE7E86E663098C9427D01183A88D357437DAFF295AEC3E75` |
| `favicon.svg` | 712 | `E6D2E59B7B5BBB0342E0FB496DFC262DECBFE4426BBB7B047AEC8D467D1DC6F7` |
| `index.html` | 40450 | `0C101E0804762664A7FAAE9933406131BF26379F3812F2AD5A03A87E1EF03F88` |

### App-only file (not in Temp)

| Rel path | Size | SHA256 | Notes |
|----------|------|--------|-------|
| `README.md` | 1117 | `2274355E2CD283300E2EABA99E3525486522B0962058ADB215E8D46CB1F2BCBA` | Isolation + provenance docs only; not part of prototype payload |

### Temp top-level (no README)

- `assets/`
- `favicon.svg`
- `index.html`

**Check 1 result: PASS** — all prototype assets are byte-identical between Temp and `apps/ehr-prototype-static`. Sole delta is the expected app-local README.

---

## 2. Title in `index.html`

| Location | `<title>` |
|----------|-----------|
| Temp `index.html` | **Care Indeed Home Health EHR Prototype** |
| App `index.html` | **Care Indeed Home Health EHR Prototype** |
| Live `http://127.0.0.1:5191/` | **Care Indeed Home Health EHR Prototype** |

Also confirmed in RSC payload embedded in the same file (`"children":"Care Indeed Home Health EHR Prototype"`).

**Check 2 result: PASS**

---

## 3. README isolation (no auth/API wiring into policy app)

### README statements (verified present)

From `apps/ehr-prototype-static/README.md`:

- Standalone **static** mirror.
- Source: Temp mirror at `%LOCALAPPDATA%\Temp\care-indeed-ehr-prototype-local` (pulled from deployed prototype — not from any policy-repo worktree).
- Isolation rules:
  - Do not wire into the policy app runtime.
  - **No backend integrations, auth wiring, API calls, or shared state with V6/compliance.**
  - Explicitly **not** Fable’s `EHR_Prototype` worktree.
- Serve: `npx --yes serve apps/ehr-prototype-static -l 5191` (or serve `.` on 5191).
- Reception launcher opens `http://127.0.0.1:5191/` as EHR handoff URL only.

### Policy-app coupling (spot check)

- Only in-app reference under `src/`:  
  `src/v6/screens/pageviews/ReceptionScreen.tsx` → external handoff:

```ts
{
  id: 'ehr-prototype',
  name: 'EHR Prototype',
  route: 'http://127.0.0.1:5191',
  external: true,
  // ...
}
```

- That is a **browser handoff URL** (`external: true`), not an import of static assets, not shared auth, not API proxy, not shared state.
- No package imports of `apps/ehr-prototype-static` into the Vite policy app surface.
- Bundled static JS is framework/RSC runtime only; no policy-app auth tokens, no V6 API base URLs, no shared env wiring documented or required by README.

**Check 3 result: PASS** — README isolation holds; policy app only deep-links externally to :5191.

---

## 4. No Fable path in source provenance (Temp + apps only)

| Search target | Result |
|---------------|--------|
| Temp tree file names | No `fable` hits |
| Temp tree text content (html/md/js/css/svg/json/…) | **No hits** |
| App tree file names | No `fable` hits |
| App tree content | **One hit only:** `README.md` prohibition text: *“Not Fable’s `EHR_Prototype` worktree … must never be used as a source”* |

Provenance documented and observed:

1. **Source of copy:** Temp local mirror (`care-indeed-ehr-prototype-local`).
2. **Destination:** `apps/ehr-prototype-static`.
3. **Not used as source:** `Policies_and_Procedures_V2_worktrees\EHR_Prototype` (Fable).

**Check 4 result: PASS** — no Fable path used as provenance; only a negative mention in isolation docs.

---

## 5. Live server optional probe (`http://127.0.0.1:5191/`)

### Listener / process

| Field | Value |
|-------|--------|
| **Listen** | `127.0.0.1:5191` LISTENING |
| **PID** | **33276** |
| **Process** | `python` (`C:\Python314\python.exe`) |
| **Command line** | `"C:\Python314\python.exe" -m http.server 5191 --bind 127.0.0.1` |
| **Parent PID** | 40088 (parent no longer running / orphaned) |
| **Start time** | 2026-08-03 12:15:52 |

**Serve-root inference:** `GET /README.md` → **404**. Temp tree has no README; app tree does. Combined with byte-identical `index.html` in both trees, the live process is consistent with serving the **Temp** tree (or any cwd that lacks README but contains the same payload). **Content verification still valid** because shared-file hashes match Temp ↔ app.

### HTTP status matrix

| URL | Status | Notes |
|-----|--------|-------|
| `http://127.0.0.1:5191/` | **200** | Title exact; body markers: CARE INDEED, Elena Martinez, SOC completion |
| `http://127.0.0.1:5191/index.html` | **200** | Same document |
| `http://127.0.0.1:5191/favicon.svg` | **200** | len 712 |
| `http://127.0.0.1:5191/assets/index-B6csGzFL.css` | **200** | len 35631 |
| `http://127.0.0.1:5191/assets/index-CcITSQVe.js` | **200** | len 80894 |
| `http://127.0.0.1:5191/assets/framework-CXnKph_e.js` | **200** | len 189805 |
| `http://127.0.0.1:5191/assets/page-DYDiOo50.js` | **200** | len 47913 |
| `http://127.0.0.1:5191/assets/query-D8Wk3mvj.js` | **200** | len 1564 |
| `http://127.0.0.1:5191/assets/layout-segment-context-CXNA_Ckw.js` | **200** | len 288 |
| `http://127.0.0.1:5191/assets/rolldown-runtime-S-ySWqyJ.js` | **200** | len 694 |
| `http://127.0.0.1:5191/assets/_vinext_fonts/geist-8ac0455e797f/geist-98bbbccb.woff2` | **200** | len 29288 |

### Live index integrity

| Check | Result |
|-------|--------|
| Served `index.html` SHA256 | `0C101E0804762664A7FAAE9933406131BF26379F3812F2AD5A03A87E1EF03F88` |
| Matches Temp + app on-disk | **Yes** |
| Title | **Care Indeed Home Health EHR Prototype** |

**Note (non-blocking):** Prototype HTML still references Cloudflare challenge script path `/cdn-cgi/challenge-platform/scripts/jsd/main.js` (inherited from deployed capture). That path is **not** part of the local mirror and will 404/abort under pure static serve — expected for a static offline copy; does not affect title, main CSS/JS/fonts, or hash integrity of vendored files.

**Check 5 result: PASS**

---

## Summary scorecard

| # | Check | Result |
|---|-------|--------|
| 1 | SHA256 inventory Temp ↔ `apps/ehr-prototype-static` | **PASS** (20/20 content match; README app-only) |
| 2 | Title = Care Indeed Home Health EHR Prototype | **PASS** |
| 3 | README isolation / no auth-API wiring into policy app | **PASS** |
| 4 | No Fable path as source provenance | **PASS** |
| 5 | Live :5191 title + assets 200; PID/cmdline documented | **PASS** |

---

## Overall verdict

# **PASS**

The static EHR mirror at `apps/ehr-prototype-static` is a faithful byte-for-byte copy of the Temp local prototype (plus isolation README), correctly titled, provenance-clean (Temp + apps; Fable excluded), isolated from policy-app auth/API runtime, and servable on `127.0.0.1:5191` with verified 200s for document and core assets.

---

*Independent recompute by W2-QA02 — no reliance on prior agent hash tables beyond re-verification.*

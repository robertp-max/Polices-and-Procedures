# EHR static hash inventory — Wave 1 evidence

| Field | Value |
| --- | --- |
| Agent | W1-A16 (Final Integrator) |
| Generated | 2026-08-03T13:32:07-07:00 |
| Algorithm | SHA-256 |
| Approved source (Temp) | `C:\Users\razer\AppData\Local\Temp\care-indeed-ehr-prototype-local` |
| Repo destination | `apps/ehr-prototype-static` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD at inventory | `60f17bb58bc7f14781dbf5557cc205be04624131` |

## Summary

| Metric | Count |
| --- | --- |
| Source files | 20 |
| Destination files | 21 |
| **MATCH** (byte-identical SHA-256) | **20** |
| HASH_MISMATCH | 0 |
| SRC_ONLY | 0 |
| DST_ONLY | 1 (`README.md` — intentional repo isolation doc, not in Temp mirror) |

**Verdict: PASS** — every file present in the approved Temp source is mirrored bit-for-bit under `apps/ehr-prototype-static`. The only destination-only file is the hand-authored `README.md` (isolation / serve notes; not Fable-sourced).

## File inventory

| Relative path | Status | SHA-256 (src = dst unless noted) | Size |
| --- | --- | --- | --- |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-001175b1.woff2` | MATCH | `58a6b173d5ca1dec92166ea3c6cb1a84a4144556d10928ac14e8e6b40e4787bd` | 16540 |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-52306abf.woff2` | MATCH | `f689f638f29fff460a2d5749edb5d5c38d7bef0389f32032d871f23fc6ebb008` | 7968 |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-875ccdd4.woff2` | MATCH | `6129fc8571c3e0cb0a4c41f5160c974a843b055009dc4ad8858bd808e18a2d86` | 14900 |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-98bbbccb.woff2` | MATCH | `9b6f5ff45b278c744b5f379a2c4ecbaf858a842b8eaf82ac8d21b699ca16c608` | 29288 |
| `assets/_vinext_fonts/geist-8ac0455e797f/geist-ff2310f5.woff2` | MATCH | `b7a545bbb08256bd809f11cfe66d88da3e22d169ea4407737b1ef0ec1ed3d791` | 7252 |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-013b2f2f.woff2` | MATCH | `5f3d6ad60f29d6cb708414ec6887163d63bf197377ef5417d2483ff31ace6c3b` | 23108 |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-0638449e.woff2` | MATCH | `d67e4a94ba498635f764ddca7d1ec4271f5642f032eb24b426764480f66f8497` | 5892 |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44745446.woff2` | MATCH | `745994b5cd950ec201b66526375f057d540847cccfc70f4f24f5f571d26d3923` | 14712 |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44e03052.woff2` | MATCH | `75b3bedbebc35f347c0ae3b416aa871941555357e7b0f83767eb5987875589ed` | 12872 |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-971fb274.woff2` | MATCH | `16e1d48b6dd29eb240aec5db36184eb182933c082cd43de7f35af686d58087d2` | 7728 |
| `assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-f6b33328.woff2` | MATCH | `e27f657e38d52887baa3b6b2f812bef93dfdd356f0810e40edd4ee284cc7e9f6` | 6204 |
| `assets/framework-CXnKph_e.js` | MATCH | `73b45b606448e4dc310fbe851d8089ee752f3eb081980b3a6fec88988820ee12` | 189805 |
| `assets/index-B6csGzFL.css` | MATCH | `68a75bced92206693016f04da3fbdbb26add7e9708d646f7f88b34f8021b66c0` | 35631 |
| `assets/index-CcITSQVe.js` | MATCH | `da4591c317a85b7866d16e690958f0f537f5bfe0e6b750a2a15f455f4f56c15f` | 80894 |
| `assets/layout-segment-context-CXNA_Ckw.js` | MATCH | `28b88fa653cfeb1538e226a2309bd4b250ed512550ef26fde9060115edce1b67` | 288 |
| `assets/page-DYDiOo50.js` | MATCH | `ee00e0709e7c2ac727b189b431a123b1c01b9a396eab41dbc6cdaeb89765f2b4` | 47913 |
| `assets/query-D8Wk3mvj.js` | MATCH | `5e3ecc5fd4f80c9c8228cef75d2d4a8bb5f8f95ca267e7a4e62923aad52b5db8` | 1564 |
| `assets/rolldown-runtime-S-ySWqyJ.js` | MATCH | `5db5ba82eef00d1dee7e86e663098c9427d01183a88d357437daff295aec3e75` | 694 |
| `favicon.svg` | MATCH | `e6d2e59b7b5bbb0342e0fb496dfc262decbfe4426bbb7b047aec8d467d1dc6f7` | 712 |
| `index.html` | MATCH | `0c101e0804762664a7faae9933406131bf26379f3812f2ad5a03a87e1ef03f88` | 40450 |
| `README.md` | DST_ONLY | dst `2274355e2cd283300e2eaba99e3525486522b0962058adb215e8d46cb1f2bcba` | 1117 |

## Notes

- Machine-readable twin: `ehr-static-hash-inventory.json` (same directory).
- Source path uses Windows Temp mirror; destination is the merge-worktree vendored tree introduced in commit `e0c678ed`.
- No HASH_MISMATCH and no SRC_ONLY implies a complete, faithful copy of the approved Temp static surface.

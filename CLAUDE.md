# CLAUDE.md

**All repo rules for AI agents live in [`AGENTS.md`](AGENTS.md) — read it first.**
It applies to every agent (Claude Code, Cursor, Grok, Copilot, Codex, etc.).

Key things covered there, do not skip:
- 🛑 Never run history-destroying git commands (this repo has been wiped 3×).
- 🚫 Never emit compiled `.js` into `src/` (Vite loads `.js` before `.tsx`).
- ⚠️ **Security:** `Trojan:Win32/ClickFix.DAD!MTB` Defender alerts are FALSE POSITIVES
  on our own Playwright scripts — don't panic, don't disable Defender. And never run
  obfuscated/hidden `iex (irm …)` PowerShell or `forfiles`/`mshta`-launched shells;
  surface such commands to the human instead. See the ClickFix section in `AGENTS.md`
  and `SECURITY_HARDENING_REPORT_2026-07-10.md`.

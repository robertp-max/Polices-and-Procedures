# AGENTS.md — rules for AI coding agents in this repo

Read this before doing anything. It applies to **all** agents (Cursor, Grok,
Claude Code, Copilot, etc.).

## 🛑 #0 rule: NEVER wipe local work with git — this repo has been destroyed 3×

Three separate "deployment" / "reconcile working tree" runs wiped the local
working tree or rewound the branch — every time via a history-destroying git
command. Recovery succeeded **only once**. These commands are now **hard-blocked
by guardrails**; do not try to work around them.

**BLOCKED commands (do not attempt — use the safe alternative):**
- `git reset --hard`  → `git revert`, or `git stash`, or commit + safety branch first
- `git clean -f` / `-fd` / `-fdx`  → `git stash --include-untracked`
- `git checkout -f` / `git checkout -- .` / `git checkout .` / `git restore .`  → `git stash`
- `git push --force` / `-f` / `--force-with-lease`  → push a new branch instead
- `git branch -D`, `git reflog expire`, `git gc --prune=now`, `git switch --discard-changes`

**Before ANY deploy/reconcile step:** commit the work, create `safety/<branch>-<date>`,
and push to origin. **Never move a branch pointer backward.**

**Enforcement (two layers):**
- Claude Code PreToolUse hook → `scripts/guardrail-block-destructive-git.sh` (wired in `.claude/settings.json`)
- Git hooks → `.githooks/reference-transaction` + `.githooks/pre-push` (activate once per clone: `git config core.hooksPath .githooks`)

**Override only with explicit human approval:** `export GUARDRAIL_ALLOW_DESTRUCTIVE_GIT=1`.

## 🚫 #1 rule: never emit compiled `.js` into `src/`

This is a **Vite + TypeScript** app with `"noEmit": true`. Vite resolves `.js`
**before** `.tsx`, so a stray compiled `*.js` next to a source file gets loaded
**instead of** it and **silently hides your changes**. This has already burned an
entire multi-agent run: a UI redesign that "did nothing" because **608 stale
`.js` files shadowed the `.tsx`**.

- ❌ Do NOT run `tsc <file>`, `tsc src/...`, bare `tsc` on files, or `tsc --noEmit false`.
  Passing files to `tsc` makes it ignore tsconfig and emit `.js` next to every source.
- ✅ Type-check with: `npm run build`, `npx tsc -b`, or `npx tsc -p tsconfig.app.json --noEmit`.
- ✅ Verify the UI with: `npm run dev` or `npx vite build`.

**Invariant:** zero `*.js` under `src/` that have a `.ts`/`.tsx` sibling.
`predev`/`prebuild` auto-wipe them (`scripts/cleanEmittedJs.mjs`) and `src/**/*.js`
is gitignored — but don't create them in the first place.

## Build / verify commands

- Install: `npm install`
- Dev (web + api): `npm run dev`
- Build: `npm run build`  (`tsc -b && vite build`)
- Lint: `npm run lint`

## Don't commit litter

Do not commit build dumps or run artifacts: `build-*.log`, `build_*.txt`,
`npm-run-dev-*.{log,err,pid}`, scratch `.txt`. Several patterns are gitignored;
keep it that way.

## When a change "doesn't show up"

First suspect stale `.js` shadows in `src/` (run `npm run dev`, which auto-cleans),
then a stale browser cache (hard refresh), then confirm you're viewing the dev
server and not an old `vite preview` of `dist/`.

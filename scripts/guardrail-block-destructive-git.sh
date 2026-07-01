#!/usr/bin/env bash
# =============================================================================
# ANTI-WIPE GUARDRAIL  —  Claude Code PreToolUse hook (Bash tool)
# -----------------------------------------------------------------------------
# Denies destructive git commands that can erase local / uncommitted work.
# This repo's working tree was wiped 3 times during "deployment" tasks (always
# via `git reset --hard`). Instructions alone did not stop it, so this blocks
# the commands at the harness level: the model cannot run them, period, unless
# a human explicitly lifts the guardrail.
#
# Mechanism: reads the PreToolUse hook JSON on stdin. If the Bash command about
# to run matches a destructive git pattern, it emits a PreToolUse "deny"
# decision and the tool call is refused. Otherwise it exits 0 (normal flow).
#
# TO LIFT (human, deliberate):
#   * one-off / session:  export GUARDRAIL_ALLOW_DESTRUCTIVE_GIT=1
#   * disable the hook:   run /hooks in Claude Code and toggle it off
#   * bypass entirely:    run the command in an external terminal
#
# SAFER ALTERNATIVES the model should prefer instead of the blocked command:
#   * commit + create a safety branch first, then operate
#   * `git revert` instead of `git reset --hard`
#   * `git stash` instead of `git checkout -- .` / `git clean -f`
# =============================================================================

# --- deliberate human override -------------------------------------------------
if [ "${GUARDRAIL_ALLOW_DESTRUCTIVE_GIT:-}" = "1" ]; then exit 0; fi

payload="$(cat)"

# Cheap fast-path: if the payload doesn't mention git at all, do nothing (and
# don't pay the cost of spawning node). Runs on EVERY Bash command by design,
# so `cd x && git reset --hard` is still caught (no prefix-only `if` filter).
case "$payload" in
  *git*) : ;;
  *) exit 0 ;;
esac

# Extract the actual Bash command from the hook JSON (node; jq isn't installed).
cmd="$(printf '%s' "$payload" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(String((j&&j.tool_input&&j.tool_input.command)||""))}catch(e){process.stdout.write("")}})' 2>/dev/null)"
[ -n "$cmd" ] || exit 0

# Collapse newlines/tabs/runs-of-spaces so multi-line commands still match.
norm="$(printf '%s' "$cmd" | tr '\n\t' '  ' | tr -s ' ')"
case "$norm" in *git*) : ;; *) exit 0 ;; esac

deny() {
  why="$1"
  reason="BLOCKED by the anti-wipe guardrail (scripts/guardrail-block-destructive-git.sh): \`$why\`. This git command can erase local/uncommitted work — it has wiped this repo 3 times during deploys, and only once was it recoverable. If this is truly intended, a HUMAN must lift the guardrail: export GUARDRAIL_ALLOW_DESTRUCTIVE_GIT=1, disable it via /hooks, or run it in an external terminal. Prefer a safe alternative first: commit + create a safety branch, or use git revert / git stash."
  reason_json="$(printf '%s' "$reason" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.stringify(s)))')"
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":%s}}\n' "$reason_json"
  exit 0
}

m() { printf '%s' "$norm" | grep -Eiq "$1"; }

# --- destructive patterns (fail-safe: over-block rather than under-block) ------
m '\bgit\b.*\breset\b.*--hard'                                        && deny 'git reset --hard'
m '\bgit\b.*\bclean\b.*(-[a-zA-Z]*f|--force)'                         && deny 'git clean -f'
m '\bgit\b.*\bcheckout\b.*(-f\b|--force)'                             && deny 'git checkout --force'
m '\bgit\b.*\bcheckout\b[[:space:]]+(--[[:space:]]+)?\.([[:space:]]|$)' && deny 'git checkout . (discards working tree)'
m '\bgit\b.*\brestore\b.*[[:space:]]\.([[:space:]]|$)'                && deny 'git restore . (discards working tree)'
m '\bgit\b.*\bpush\b.*(--force([^-a-zA-Z]|$)|--force-with-lease|[[:space:]]-f\b)' && deny 'git push --force'
m '\bgit\b.*\bbranch\b.*[[:space:]]-D\b'                              && deny 'git branch -D (force delete)'
m '\bgit\b.*\breflog\b.*\bexpire\b'                                   && deny 'git reflog expire'
m '\bgit\b.*\bgc\b.*--prune=(now|all)'                                && deny 'git gc --prune'
m '\bgit\b.*\bswitch\b.*(--discard-changes|-f\b|--force)'             && deny 'git switch --discard-changes/-f'

exit 0

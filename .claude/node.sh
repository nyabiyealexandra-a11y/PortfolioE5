#!/bin/sh
# Runs Node at the version written in .nvmrc, whichever Node comes first on PATH.
# Hooks and the MCP server start through this script: they need Node >= 22.18 to run .ts files.
#
#   .claude/node.sh <script.ts> [args…]   run a script
#   .claude/node.sh --env-file            Claude Code SessionStart: make the agent's shell use the same Node
#   .claude/node.sh --cursor-env          Cursor sessionStart: same, as the JSON Cursor expects

root=$(cd "$(dirname "$0")/.." && pwd)
want=$(cat "$root/.nvmrc")

case "$(node --version 2>/dev/null)" in
  v"$want".*) ;;
  *)
    for dir in "${NVM_DIR:-$HOME/.nvm}"/versions/node/v"$want".*/bin; do
      [ -x "$dir/node" ] && PATH="$dir:$PATH"
    done
    ;;
esac

if [ "$1" = "--env-file" ]; then
  [ -n "$CLAUDE_ENV_FILE" ] && echo "export PATH=\"$PATH\"" >> "$CLAUDE_ENV_FILE"
  exit 0
fi
if [ "$1" = "--cursor-env" ]; then
  printf '{"env":{"PATH":"%s"}}\n' "$PATH"
  exit 0
fi

exec node "$@"

/**
 * Stop hook: before the agent hands back, runs the full check (format, lint,
 * types, tests, build: what the CI runs) if code changed. On a failure, the
 * agent is sent back to work until the CI would be green: exit code 2 in
 * Claude Code, a `followup_message` in Cursor (which caps the loop with `loop_limit`).
 */
import { execFileSync } from "node:child_process";
import { report, root, runAll } from "../lib/checks.ts";
import { isCursor, readInput, tellAgent } from "../lib/hook.ts";

const input = readInput();
// Already continuing because of this hook: let the agent stop rather than loop forever.
if (input.stop_hook_active === true) process.exit(0);
// Cursor also calls stop when the user aborts or the agent errors: nothing to check then.
if (isCursor(input) && input.status !== "completed") process.exit(0);

const changed = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .map((line) => line.slice(3))
  .filter((path) => /\.(ts|js|css|json|md|ya?ml)$/.test(path) || path.startsWith("public/"));
if (changed.length === 0) process.exit(0);

const results = runAll();
if (results.some((r) => !r.ok)) {
  tellAgent(
    input,
    `The check fails; fix it before finishing (or say why it can't be fixed):\n${report(results)}`,
    (message) => ({ followup_message: message }),
  );
}

/**
 * After an edit: formats the file, then runs only the tests that cover it (see
 * `testsFor`). Silent when they pass; failing tests are sent back to the agent.
 *
 * Claude Code PostToolUse (Edit, Write, MultiEdit): format and test.
 * Cursor sends two events per edit: afterFileEdit always has the path but its
 * output is ignored, so it only formats; postToolUse (Write) runs the tests.
 */
import { relative } from "node:path";
import { format, root, runTests, testsFor } from "../lib/checks.ts";
import { editedFile, readInput, tellAgent } from "../lib/hook.ts";

const input = readInput();
const file = editedFile(input);
if (file === undefined || relative(root, file).startsWith("..")) process.exit(0);

if (input.hook_event_name !== "postToolUse") format([file]);
if (input.hook_event_name === "afterFileEdit") process.exit(0);

const tests = testsFor(file);
if (tests?.length === 0) process.exit(0);

const result = runTests(tests);
if (!result.ok) {
  tellAgent(input, `Tests failing after editing ${relative(root, file)}:\n${result.details}`, (message) => ({
    additional_context: message,
  }));
}

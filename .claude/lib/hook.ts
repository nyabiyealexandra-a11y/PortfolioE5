/**
 * The same hook scripts serve Claude Code (.claude/settings.json) and Cursor
 * (.cursor/hooks.json). Both send JSON on stdin; they differ in how a hook talks
 * back to the agent:
 *   - Claude Code reads stderr when the hook exits with code 2;
 *   - Cursor reads a JSON object on stdout (`agent_message`, `additional_context`,
 *     `followup_message` depending on the event), and adds `cursor_version` to the input.
 */
import { readFileSync } from "node:fs";

export type HookInput = {
  readonly cursor_version?: string;
  readonly hook_event_name?: string;
  /** Cursor afterFileEdit. */
  readonly file_path?: string;
  readonly tool_input?: { readonly file_path?: string; readonly path?: string };
  /** Claude Code Stop: true when the agent is already continuing because of a Stop hook. */
  readonly stop_hook_active?: boolean;
  /** Cursor stop: "completed", "aborted" or "error". */
  readonly status?: string;
};

export const readInput = (): HookInput => JSON.parse(readFileSync(0, "utf8")) as HookInput;

export const isCursor = (input: HookInput): boolean => input.cursor_version !== undefined;

export const editedFile = (input: HookInput): string | undefined =>
  input.file_path ?? input.tool_input?.file_path ?? input.tool_input?.path;

/**
 * Sends `message` to the agent and ends the hook. `cursorOutput` is the
 * Cursor response carrying it; Claude Code gets it on stderr with exit code 2,
 * which blocks the edit or the stop and shows the message to the agent.
 */
export const tellAgent = (input: HookInput, message: string, cursorOutput: (message: string) => object): never => {
  if (isCursor(input)) {
    console.log(JSON.stringify(cursorOutput(message)));
    process.exit(0);
  }
  console.error(message);
  process.exit(2);
};

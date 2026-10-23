/**
 * "portfolio" MCP server: the project's checks and a map of the content, with
 * short answers. One tool call replaces running `npm run check` and reading its
 * full output, or opening every content file to find a section.
 *
 * Zero dependencies: MCP over stdio is JSON-RPC 2.0, one message per line.
 * Started by Claude Code from .mcp.json through .claude/node.sh.
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { report, root, runAll, runBuild, runLint, runTests, runTypecheck, type Result } from "../lib/checks.ts";

type Tool = {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: object;
  readonly call: (args: Record<string, unknown>) => { text: string; isError: boolean };
};

const noArgs = { type: "object", properties: {} };
const files = (args: Record<string, unknown>): readonly string[] =>
  Array.isArray(args.files) ? args.files.filter((file): file is string => typeof file === "string") : [];

const fromResults = (results: readonly Result[]) => ({ text: report(results), isError: results.some((r) => !r.ok) });

const siteInfo = (mode: "outline" | "todos") => {
  const result = spawnSync(process.execPath, [join(import.meta.dirname, "site-info.ts"), mode], {
    cwd: root,
    encoding: "utf8",
  });
  return { text: `${result.stdout}${result.stderr}`.trim(), isError: result.status !== 0 };
};

const tools: readonly Tool[] = [
  {
    name: "check",
    description: "Run what CI runs (format, lint, typecheck, test, build). Returns ✓/✗ per step and only the errors.",
    inputSchema: noArgs,
    call: () => fromResults(runAll()),
  },
  {
    name: "test",
    description: "Run tests (all, or the given files, e.g. tests/render.test.ts). Returns only failing tests.",
    inputSchema: { type: "object", properties: { files: { type: "array", items: { type: "string" } } } },
    call: (args) => fromResults([runTests(files(args))]),
  },
  {
    name: "lint",
    description: "Run ESLint and tsc (all files, or the given ones for ESLint). One line per problem.",
    inputSchema: { type: "object", properties: { files: { type: "array", items: { type: "string" } } } },
    call: (args) => fromResults([runLint(files(args)), runTypecheck()]),
  },
  {
    name: "build",
    description: "Validate the content and build dist/. Returns the validation errors, or the number of todo left.",
    inputSchema: noArgs,
    call: () => {
      const result = runBuild();
      if (!result.ok) return fromResults([result]);
      // Only the count: the list is what the `todos` tool is for.
      const todos = siteInfo("todos");
      return { text: `✓ build, ${todos.text.split("\n")[0] ?? ""}`, isError: todos.isError };
    },
  },
  {
    name: "outline",
    description:
      "Map of the site: sections in page order with their #ids, cards and todo counts. Use before reading content files.",
    inputSchema: noArgs,
    call: () => siteInfo("outline"),
  },
  {
    name: "todos",
    description: 'Every todo("…") still on the page (missing E5 information), by section and card.',
    inputSchema: noArgs,
    call: () => siteInfo("todos"),
  },
];

type Request = { jsonrpc: "2.0"; id?: number | string; method: string; params?: Record<string, unknown> };

const handle = (request: Request): unknown => {
  switch (request.method) {
    case "initialize":
      return {
        protocolVersion: request.params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "portfolio", version: "1.0.0" },
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) };
    case "tools/call": {
      const tool = tools.find((t) => t.name === request.params?.name);
      if (tool === undefined) throw new Error(`Unknown tool ${String(request.params?.name)}`);
      const { text, isError } = tool.call((request.params?.arguments ?? {}) as Record<string, unknown>);
      return { content: [{ type: "text", text }], isError };
    }
    default:
      throw Object.assign(new Error(`Method not found: ${request.method}`), { code: -32601 });
  }
};

const send = (message: object): void => {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);
};

for await (const line of createInterface({ input: process.stdin })) {
  if (line.trim() === "") continue;
  const request = JSON.parse(line) as Request;
  // Notifications (no id) need no answer.
  if (request.id === undefined) continue;
  try {
    send({ id: request.id, result: handle(request) });
  } catch (error) {
    const { message, code } = error as Error & { code?: number };
    send({ id: request.id, error: { code: code ?? -32603, message } });
  }
}

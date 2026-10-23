/**
 * The project's checks (format, lint, types, tests, build), run with output an
 * agent can read cheaply: nothing on success, only the failures otherwise.
 *
 * Used by the hooks (.claude/hooks/) and the MCP server (.claude/mcp/).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

export const root = join(import.meta.dirname, "..", "..");

export type Result = { readonly name: string; readonly ok: boolean; readonly details: string };

/** Longest report returned for one check, in lines. Enough to fix the first errors, never a wall of text. */
const maxLines = 40;

const bin = (name: string): string => join(root, "node_modules", ".bin", name);

const run = (command: string, args: readonly string[]): { status: number; output: string } => {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", env: { ...process.env, FORCE_COLOR: "0" } });
  const output = `${result.stdout}${result.stderr}`;
  return { status: result.status ?? 1, output: result.error ? String(result.error) : output };
};

const shorten = (text: string): string => {
  const lines = text
    .replaceAll(`file://${root}/`, "")
    .replaceAll(`${root}/`, "")
    .split("\n")
    .filter((line) => line.trim() !== "");
  if (lines.length <= maxLines) return lines.join("\n");
  return [...lines.slice(0, maxLines), `… ${lines.length - maxLines} more line(s)`].join("\n");
};

const result = (name: string, ok: boolean, details = ""): Result => ({ name, ok, details: ok ? "" : shorten(details) });

/** Every test file, or the given ones. Keeps only the "failing tests" part of the report, without stack frames. */
export const runTests = (files: readonly string[] = []): Result => {
  const targets = files.length > 0 ? files : ["tests/**/*.test.ts"];
  const { status, output } = run(process.execPath, ["--test", ...targets]);
  if (status === 0) return result("test", true);
  const failing = output.split("✖ failing tests:")[1] ?? output;
  const noise = /^\s+(at |generatedMessage:|code: '|actual:|expected:|operator:|diff:|}$)/;
  return result(
    "test",
    false,
    failing
      .split("\n")
      .filter((line) => !noise.test(line))
      .join("\n"),
  );
};

type EslintReport = readonly {
  filePath: string;
  messages: readonly { line?: number; column?: number; ruleId: string | null; message: string }[];
}[];

/** ESLint on the whole project, or on the given files, as one `file:line:col message (rule)` line per problem. */
export const runLint = (files: readonly string[] = []): Result => {
  const { status, output } = run(bin("eslint"), ["--format", "json", ...(files.length > 0 ? files : ["."])]);
  if (status === 0) return result("lint", true);
  try {
    const report = JSON.parse(output) as EslintReport;
    const problems = report.flatMap((file) =>
      file.messages.map(
        (m) => `${relative(root, file.filePath)}:${m.line ?? 0}:${m.column ?? 0} ${m.message} (${m.ruleId ?? "fatal"})`,
      ),
    );
    return result("lint", false, problems.join("\n"));
  } catch {
    return result("lint", false, output);
  }
};

export const runTypecheck = (): Result => {
  const { status, output } = run(bin("tsc"), ["--pretty", "false"]);
  return result("typecheck", status === 0, output);
};

/** Lists badly formatted files; the fix is always `npm run format`. */
export const runFormatCheck = (): Result => {
  const { status, output } = run(bin("prettier"), ["--check", "--log-level", "warn", "."]);
  return result("format", status === 0, `${output}\nFix: npm run format`);
};

/** Formats files in place. Unknown file types are skipped silently. */
export const format = (files: readonly string[]): void => {
  run(bin("prettier"), ["--write", "--log-level", "silent", "--ignore-unknown", ...files]);
};

export const runBuild = (): Result => {
  const { status, output } = run(process.execPath, ["src/build.ts"]);
  return result("build", status === 0, output);
};

/** The same steps as `npm run check` (and the CI), in the same order, without stopping at the first failure. */
export const runAll = (): readonly Result[] => [runFormatCheck(), runLint(), runTypecheck(), runTests(), runBuild()];

/** `✓ format ✓ lint ✗ test` on the first line, then the details of each failure. */
export const report = (results: readonly Result[]): string =>
  [
    results.map((r) => `${r.ok ? "✓" : "✗"} ${r.name}`).join("  "),
    ...results.filter((r) => !r.ok).map((r) => `\n## ${r.name}\n${r.details}`),
  ].join("\n");

/**
 * The tests worth running after `file` changed: its own test file, plus the
 * content test when the DSL changes (the real site uses every block).
 * Returns `[]` when no test covers the file, `undefined` when every test should run.
 */
export const testsFor = (file: string): readonly string[] | undefined => {
  const path = relative(root, file);
  if (path === "tests/helpers.ts") return undefined;
  if (/^tests\/.+\.test\.ts$/.test(path)) return [path];
  if (path.startsWith("src/content/")) return ["tests/site.test.ts"];
  const dsl = /^src\/dsl\/(.+)\.ts$/.exec(path);
  if (dsl) {
    const own = `tests/${dsl[1] ?? ""}.test.ts`;
    return existsSync(join(root, own)) ? [own, "tests/site.test.ts"] : undefined;
  }
  return [];
};

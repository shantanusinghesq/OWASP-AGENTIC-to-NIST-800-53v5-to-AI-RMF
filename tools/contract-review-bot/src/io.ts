import { spawn, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { safeJoin } from "./checks.ts";
import type { Io } from "./types.ts";

const PASS_EXACT = new Set([
  "PATH",
  "HOME",
  "USER",
  "LOGNAME",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "LC_MESSAGES",
  "TMPDIR",
  "TEMP",
  "TMP",
  "SHELL",
  "TERM",
  "CI",
  "PNPM_HOME",
  "COREPACK_HOME",
  "XDG_CACHE_HOME",
  "XDG_CONFIG_HOME",
  "npm_config_cache",
  "http_proxy",
  "https_proxy",
  "no_proxy",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NO_PROXY",
]);

const SYSTEM_PATH = [
  "/usr/local/sbin",
  "/usr/local/bin",
  "/usr/sbin",
  "/usr/bin",
  "/sbin",
  "/bin",
];

/**
 * Environment for commands that execute pull-request code.
 * PATH is rebuilt. The caller's PATH is dropped so an install step cannot prepend a fake `node`.
 * Secrets are not copied. BASH_ENV is not copied.
 */
export function commandEnv(
  base: NodeJS.ProcessEnv = process.env,
  trustedNode?: string,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(base)) {
    if (value === undefined) continue;
    if (key === "PATH" || key === "BASH_ENV" || key === "ENV") continue;
    if (PASS_EXACT.has(key)) env[key] = value;
  }
  const nodeDir = trustedNode ? path.dirname(trustedNode) : "";
  const dirs = nodeDir ? [nodeDir, ...SYSTEM_PATH] : SYSTEM_PATH;
  env.PATH = dirs.join(":");
  return env;
}

/** Split a base-config command without invoking a shell. */
export function splitCommand(command: string): string[] {
  const parts: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(command)) !== null) {
    parts.push(match[1] ?? match[2] ?? match[3] ?? "");
  }
  if (parts.length === 0) throw new Error("empty command");
  return parts;
}

export interface TrustedBins {
  node?: string;
  pnpm?: string;
}

/**
 * Resolve argv for a direct exec. `pnpm` and `node` use the absolute binaries recorded
 * before install. Relative paths resolve inside the workspace. No shell.
 */
export function commandSpawn(
  command: string,
  cwd: string,
  trusted: TrustedBins = {},
): { file: string; args: string[]; shell: false } {
  const parts = splitCommand(command);
  let file = parts[0];
  if ((file === "pnpm" || file === "pnpm.cmd") && trusted.pnpm)
    file = trusted.pnpm;
  else if (file === "node" && trusted.node) file = trusted.node;
  else if (
    !path.isAbsolute(file) &&
    (file.includes("/") || file.includes("\\"))
  ) {
    file = path.resolve(cwd, file);
  }
  return { file, args: parts.slice(1), shell: false };
}

export function trustedBinsFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): TrustedBins {
  const node = env.CONTRACT_REVIEW_NODE;
  const pnpm = env.CONTRACT_REVIEW_PNPM;
  return {
    node: node && path.isAbsolute(node) ? node : undefined,
    pnpm: pnpm && path.isAbsolute(pnpm) ? pnpm : undefined,
  };
}

export function isSha(value: string): boolean {
  return /^[0-9a-f]{40}$/.test(value);
}

function git(workspace: string, args: string[]): string {
  const ran = spawnSync("git", ["-C", workspace, ...args], {
    encoding: "utf8",
  });
  if (ran.status !== 0) {
    throw new Error((ran.stderr || ran.stdout || "git failed").trim());
  }
  return ran.stdout;
}

function walkDir(
  root: string,
  dir: string,
  acc: { path: string; text: string }[],
  opts: {
    suffixes?: string[];
    exclude_suffixes?: string[];
    exclude_dir_names: string[];
  },
): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (opts.exclude_dir_names.includes(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      walkDir(root, abs, acc, opts);
      continue;
    }
    if (!entry.isFile()) continue;
    const rel = path.relative(root, abs).split(path.sep).join("/");
    if (opts.suffixes && !opts.suffixes.some((suffix) => rel.endsWith(suffix)))
      continue;
    if (opts.exclude_suffixes?.some((suffix) => rel.endsWith(suffix))) continue;
    try {
      const info = statSync(abs);
      if (info.size > 1_000_000) continue;
      acc.push({ path: rel, text: readFileSync(abs, "utf8") });
    } catch {
      continue;
    }
  }
}

export function createIo(workspace: string, baseSha: string): Io {
  if (!isSha(baseSha)) throw new Error("base SHA must be 40 hex characters");
  const root = path.resolve(workspace);
  const readAt = (rel: string, fromGit: boolean): string | null => {
    if (!safeJoin(root, rel)) return null;
    if (!fromGit) {
      const abs = safeJoin(root, rel);
      if (!abs) return null;
      try {
        return readFileSync(abs, "utf8");
      } catch {
        return null;
      }
    }
    const ran = spawnSync("git", ["-C", root, "show", `${baseSha}:${rel}`], {
      encoding: "utf8",
    });
    if (ran.status !== 0) return null;
    return ran.stdout;
  };
  return {
    read: (rel) => readAt(rel, false),
    readBase: (rel) => readAt(rel, true),
    walk: (opts) => {
      const acc: { path: string; text: string }[] = [];
      const exclude = opts.exclude_dir_names ?? [
        "node_modules",
        "dist",
        ".git",
      ];
      for (const rel of opts.roots) {
        const abs = safeJoin(root, rel);
        if (!abs) continue;
        walkDir(root, abs, acc, {
          suffixes: opts.suffixes,
          exclude_suffixes: opts.exclude_suffixes,
          exclude_dir_names: exclude,
        });
      }
      return acc;
    },
    diff: () => git(root, ["diff", "--unified=0", `${baseSha}...HEAD`]),
    names: () =>
      git(root, ["diff", "--name-only", `${baseSha}...HEAD`])
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    lsFiles: () =>
      git(root, ["ls-files"])
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    packageScripts: () => {
      try {
        const pkg = JSON.parse(
          readFileSync(path.join(root, "package.json"), "utf8"),
        ) as {
          scripts?: Record<string, string>;
        };
        return pkg.scripts ?? {};
      } catch {
        return {};
      }
    },
    command: (command, timeoutMs, stdin) =>
      runCommand(root, command, timeoutMs, stdin),
  };
}

export function workspaceHead(workspace: string): string {
  return git(workspace, ["rev-parse", "HEAD"]).trim();
}

export function runCommand(
  cwd: string,
  command: string,
  timeoutMs: number,
  stdin?: string,
): Promise<{ code: number; log: string }> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (code: number, extra = "") => {
      if (settled) return;
      settled = true;
      resolve({ code, log: `${log}${extra}` });
    };
    let log = "";
    const trusted = trustedBinsFromEnv();
    const spawned = commandSpawn(command, cwd, trusted);
    const child = spawn(spawned.file, spawned.args, {
      cwd,
      env: commandEnv(process.env, trusted.node),
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
      signal: AbortSignal.timeout(timeoutMs),
    });
    const take = (chunk: Buffer) => {
      if (log.length < 200_000) log += chunk.toString("utf8");
    };
    child.stdout.on("data", take);
    child.stderr.on("data", take);
    child.on("error", (error) =>
      finish(1, error.name === "AbortError" ? "\ntimed out" : error.message),
    );
    child.on("close", (code) => finish(code ?? 1));
    if (stdin !== undefined) child.stdin.end(stdin);
    else child.stdin.end();
  });
}

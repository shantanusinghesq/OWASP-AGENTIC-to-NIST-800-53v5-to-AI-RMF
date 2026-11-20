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

/** Environment for commands that execute pull-request code. Secrets are not copied. */
export function commandEnv(
  base: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(base)) {
    if (value === undefined) continue;
    if (PASS_EXACT.has(key)) env[key] = value;
  }
  return env;
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
    const child = spawn("bash", ["-lc", command], {
      cwd,
      env: commandEnv(),
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

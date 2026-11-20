import { spawnSync } from "node:child_process";
import { isSha } from "./io.ts";
import type { Snapshot } from "./recompute.ts";

function git(dir: string, args: string[]): string {
  const ran = spawnSync("git", ["-C", dir, ...args], {
    encoding: "utf8",
    maxBuffer: 20_000_000,
  });
  if (ran.status !== 0) {
    throw new Error((ran.stderr || ran.stdout || "git failed").trim());
  }
  return ran.stdout;
}

function show(dir: string, sha: string, rel: string): string | null {
  if (
    rel.includes("\0") ||
    rel.startsWith("/") ||
    rel.split("/").includes("..")
  )
    return null;
  const ran = spawnSync("git", ["-C", dir, "show", `${sha}:${rel}`], {
    encoding: "utf8",
    maxBuffer: 2_000_000,
  });
  if (ran.status !== 0) return null;
  if (ran.stdout.length > 1_000_000) return null;
  return ran.stdout;
}

/** Read blobs by SHA. Does not check out the pull request and does not run its code. */
export function loadGitSnapshot(
  dir: string,
  baseSha: string,
  headSha: string,
): Snapshot {
  if (!isSha(baseSha) || !isSha(headSha)) {
    throw new Error("snapshot SHAs must be 40 hex characters");
  }
  const changedFiles = git(dir, [
    "diff",
    "--name-only",
    `${baseSha}...${headSha}`,
  ])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const diff = git(dir, ["diff", "--unified=0", `${baseSha}...${headSha}`]);
  const list = git(dir, ["ls-tree", "-r", "--name-only", headSha])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    changedFiles,
    diff,
    read: (rel) => show(dir, headSha, rel),
    readBase: (rel) => show(dir, baseSha, rel),
    listFiles: () => list,
    filesUnder: (opts) => {
      const out: { path: string; text: string }[] = [];
      for (const rel of list) {
        const inRoot = opts.roots.some((root) => {
          const prefix = root.replace(/\/$/, "");
          return rel === prefix || rel.startsWith(`${prefix}/`);
        });
        if (!inRoot) continue;
        if (
          rel.includes("/node_modules/") ||
          rel.includes("/dist/") ||
          rel.includes("/.git/")
        )
          continue;
        if (
          opts.suffixes &&
          !opts.suffixes.some((suffix) => rel.endsWith(suffix))
        )
          continue;
        if (opts.exclude_suffixes?.some((suffix) => rel.endsWith(suffix)))
          continue;
        const text = show(dir, headSha, rel);
        if (text === null) continue;
        out.push({ path: rel, text });
      }
      return out;
    },
  };
}

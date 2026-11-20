import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { toolingFindings } from "../src/checks.ts";
import { commandSpawn } from "../src/io.ts";
import {
  bindCommandResults,
  failureCheckBody,
  findStickyComment,
} from "../src/publish.ts";
import { recomputeStructural, type Snapshot } from "../src/recompute.ts";
import { codeSpan, escapeText, fence, renderMarkdown } from "../src/render.ts";
import {
  MAX_ARTIFACT_BYTES,
  parsePrNumber,
  readTextCapped,
  validateReport,
  type ResultSchema,
} from "../src/schema.ts";
import { exampleConfig } from "./fixtures.ts";
import type { Report } from "../src/types.ts";

const sha = "a".repeat(40);

function report(overrides: Partial<Report> = {}): Report {
  return {
    version: 1,
    head_sha: sha,
    base_sha: "b".repeat(40),
    pr_number: 7,
    needs_owner_review: false,
    owner_review_paths: [],
    protected_paths: [],
    summarizer: "off",
    summary: null,
    results: [
      {
        gate_id: "gate-1-typecheck",
        gate: "1",
        area: "lint",
        title: "Typecheck",
        status: "pass",
        evidence: {
          command: "node_modules/.bin/tsc --noEmit",
          exit_code: 0,
          log_excerpt: "secret stdout that must not be published",
        },
        fix_hint: "",
      },
    ],
    ...overrides,
  };
}

function snap(partial: Partial<Snapshot> = {}): Snapshot {
  return {
    changedFiles: [],
    diff: "",
    read: () => '{"scripts":{"check":"tsc --noEmit"}}',
    readBase: () => '{"scripts":{"check":"tsc --noEmit"}}',
    listFiles: () => [],
    filesUnder: () => [],
    ...partial,
  };
}

describe("direct tool commands", () => {
  it("resolves pnpm and workspace binaries without a shell", () => {
    const spawned = commandSpawn("pnpm audit --audit-level high", "/work", {
      pnpm: "/opt/hosted/pnpm",
    });
    expect(spawned.shell).toBe(false);
    expect(spawned.file).toBe("/opt/hosted/pnpm");
    expect(spawned.args).toEqual(["audit", "--audit-level", "high"]);
    const tsc = commandSpawn("node_modules/.bin/tsc --noEmit", "/work");
    expect(tsc.file).toBe("/work/node_modules/.bin/tsc");
    expect(tsc.args).toEqual(["--noEmit"]);
    expect(tsc.file).not.toContain("bash");
  });
});

describe("script body changes", () => {
  it("fails and names the script when a referenced body changes, including the lockfile", () => {
    const findings = toolingFindings({
      scriptNames: ["check", "build", "test", "lint"],
      baseScripts: { check: "tsc --noEmit", test: "vitest run" },
      headScripts: { check: "exit 0", test: "vitest run" },
      changedFiles: ["pnpm-lock.yaml", "vite.config.ts", "README.md"],
    });
    expect(findings.some((line) => line.includes("script check changed"))).toBe(
      true,
    );
    expect(findings.some((line) => line.includes("exit 0"))).toBe(true);
    expect(
      findings.some((line) =>
        line.includes("lockfile changed: pnpm-lock.yaml"),
      ),
    ).toBe(true);
    expect(
      findings.some((line) =>
        line.includes("tool config changed: vite.config.ts"),
      ),
    ).toBe(true);
    expect(findings.some((line) => line.includes("README"))).toBe(false);
    const config = exampleConfig();
    const recomputed = recomputeStructural(
      config,
      snap({
        changedFiles: ["package.json"],
        read: () =>
          '{"scripts":{"check":"exit 0","build":"vite build","test":"vitest run"}}',
        readBase: () =>
          '{"scripts":{"check":"tsc --noEmit","build":"vite build","test":"vitest run"}}',
      }),
    );
    expect(recomputed.commandsBound).toBe(false);
    const tooling = recomputed.results.find(
      (item) => item.gate_id === "hard-tooling",
    );
    expect(tooling?.status).toBe("fail");
    expect(tooling?.evidence.log_excerpt).toContain("script check changed");
  });
});

describe("artifact validation", () => {
  const schema = JSON.parse(
    readTextCapped(
      path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        "../result.schema.json",
      ),
    ),
  ) as ResultSchema;

  it("rejects 1e21, missing fields, and files over the cap", () => {
    expect(() => parsePrNumber(1e21)).toThrow(/safe positive integer/);
    expect(() => parsePrNumber(JSON.parse("1e21") as unknown)).toThrow(
      /safe positive integer/,
    );
    expect(parsePrNumber(7)).toBe(7);
    expect(() =>
      validateReport({ ...report(), pr_number: 1e21 }, schema),
    ).toThrow(/pr_number/);
    const missing: Record<string, unknown> = { ...report() };
    delete missing.results;
    expect(() => validateReport(missing, schema)).toThrow(/results/);
    const dir = mkdtempSync(path.join(tmpdir(), "contract-review-"));
    const file = path.join(dir, "results.json");
    writeFileSync(file, "x".repeat(32));
    expect(() => readTextCapped(file, 8)).toThrow(/cap is 8/);
    expect(MAX_ARTIFACT_BYTES).toBe(1_000_000);
  });

  it("builds the same failing check used when the artifact is missing", () => {
    const body = failureCheckBody(
      sha,
      "results file is 2000000 bytes; cap is 1000000",
    );
    expect(body.name).toBe("contract-review");
    expect(body.conclusion).toBe("failure");
    expect(body.head_sha).toBe(sha);
    expect(body.output.summary).toContain("cap");
  });
});

describe("comment escaping", () => {
  it("escapes links, images, HTML, and mentions, and omits passing stdout", () => {
    const hostile =
      "see [click](http://evil.test) ![x](http://evil.test/a.png) <img src=x> @shanti `code`";
    const escaped = escapeText(hostile);
    expect(escaped).not.toContain("[click](");
    expect(escaped).not.toContain("![x](");
    expect(escaped).not.toContain("<img");
    expect(escaped).not.toContain("@shanti");
    expect(escaped).toContain("@\u200d");
    expect(codeSpan("a`b @user")).not.toContain("@user");
    const markdown = renderMarkdown(
      report({
        needs_owner_review: true,
        owner_review_paths: ["`[x](http://evil.test)` @owner"],
      }),
    );
    expect(markdown).not.toContain("[x](http://evil.test)");
    expect(markdown).not.toContain("@owner");
    expect(markdown).not.toContain("secret stdout");
    const fenced = fence("```\nkeep\n````");
    expect(fenced.startsWith("`````text\n")).toBe(true);
    expect(fenced).toContain("```");
  });
});

describe("sticky comment author", () => {
  it("ignores a planted marker and does not treat an unbound pass as success", () => {
    const comments = [
      {
        id: 9,
        body: "<!-- contract-review-bot -->\nplanted",
        authorLogin: "attacker",
        authorType: "User",
      },
      {
        id: 10,
        body: "<!-- contract-review-bot -->\nreal",
        authorLogin: "github-actions[bot]",
        authorType: "Bot",
      },
    ];
    expect(findStickyComment(comments, "<!-- contract-review-bot -->")).toBe(
      10,
    );
    const unbound = bindCommandResults(report(), {
      changedFiles: ["src/app.ts"],
      structural: [],
      commandsBound: false,
    });
    expect(unbound.results[0].status).toBe("fail");
    expect(unbound.results[0].evidence.log_excerpt).toContain("not bound");
  });
});

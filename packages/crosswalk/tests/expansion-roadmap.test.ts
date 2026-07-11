import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Tests run from the repo root (process.cwd() === repo root), so the doc is
// addressable relative to cwd. This guard keeps the WS8 expansion roadmap
// structurally honest: the six out-of-scope families stay enumerated with a
// valid status, the review anchors stay ISO-parseable, and no NIST control
// description prose is pasted in (which would create a third drifting copy).
const DOC_PATH = resolve(process.cwd(), "docs/EXPANSION_ROADMAP.md");

const FAMILY_IDS = ["AT", "MA", "PS", "PT", "MP", "PE"] as const;
const ALLOWED_STATUSES = ["Not Triggered", "Partially Triggered", "Fully Triggered"] as const;

const readDoc = (): string => readFileSync(DOC_PATH, "utf8");

/**
 * Slice the markdown into the body of a family's `## <ID> — ...` section, i.e.
 * everything from that heading up to (but not including) the next `## ` heading.
 */
const familySection = (doc: string, id: string): string | null => {
  const lines = doc.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${id}\\s+—`).test(l));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
};

describe("WS8 expansion roadmap guard", () => {
  it("the roadmap file exists", () => {
    expect(existsSync(DOC_PATH), `missing ${DOC_PATH}`).toBe(true);
  });

  it("all six out-of-scope family IDs appear as sections", () => {
    const doc = readDoc();
    const missing = FAMILY_IDS.filter((id) => familySection(doc, id) === null);
    expect(missing, `family sections missing: ${missing.join(", ")}`).toEqual([]);
  });

  it("each family section declares a status from the allowed enum", () => {
    const doc = readDoc();
    const bad: string[] = [];
    for (const id of FAMILY_IDS) {
      const section = familySection(doc, id);
      if (section === null) {
        bad.push(`${id}: no section`);
        continue;
      }
      const m = section.match(/\*\*Status:\*\*\s*(Not Triggered|Partially Triggered|Fully Triggered)/);
      if (!m) {
        bad.push(`${id}: no valid **Status:** line`);
        continue;
      }
      if (!ALLOWED_STATUSES.includes(m[1] as (typeof ALLOWED_STATUSES)[number])) {
        bad.push(`${id}: status "${m[1]}" not in enum`);
      }
    }
    expect(bad, `status problems: ${bad.join("; ")}`).toEqual([]);
  });

  it("AT is Partially Triggered (the acknowledged-but-held family)", () => {
    const doc = readDoc();
    const section = familySection(doc, "AT");
    expect(section).not.toBeNull();
    expect(section).toMatch(/\*\*Status:\*\*\s*Partially Triggered/);
  });

  it("lastReviewed and nextReviewDue are present and ISO-parseable (<= 6 months apart)", () => {
    const doc = readDoc();
    const last = doc.match(/lastReviewed:\s*(\d{4}-\d{2}-\d{2})/);
    const next = doc.match(/nextReviewDue:\s*(\d{4}-\d{2}-\d{2})/);
    expect(last, "lastReviewed header missing").not.toBeNull();
    expect(next, "nextReviewDue header missing").not.toBeNull();

    const lastMs = Date.parse(last![1]);
    const nextMs = Date.parse(next![1]);
    expect(Number.isNaN(lastMs), "lastReviewed not ISO-parseable").toBe(false);
    expect(Number.isNaN(nextMs), "nextReviewDue not ISO-parseable").toBe(false);

    // nextReviewDue must be after lastReviewed and no more than ~6 months ahead.
    const sixMonthsMs = 190 * 24 * 60 * 60 * 1000; // generous 6-month ceiling
    expect(nextMs).toBeGreaterThan(lastMs);
    expect(nextMs - lastMs).toBeLessThanOrEqual(sixMonthsMs);
  });

  it("does not paste NIST control description prose", () => {
    // Heuristic: "For agentic AI systems" is the signature opening of the
    // implementation prose in nist-control-descriptions.ts. Its presence here
    // would mean description text was copied into the roadmap.
    const doc = readDoc();
    expect(doc.includes("For agentic AI systems"), "roadmap contains NIST description-DB prose").toBe(false);
  });
});

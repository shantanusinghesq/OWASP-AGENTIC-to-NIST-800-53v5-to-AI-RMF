// Gate 1 item 2 — postmark-mcp evidence link.
// ASI04 cites a koi.ai write-up that now 301s to an unrelated Palo Alto
// Networks page. The entry must keep a source URL, and that URL (and every
// other evidence URL) must not be on KNOWN_REDIRECTED_OR_DEAD. The replacement
// is an editorial choice and is not specified here.

import { describe, expect, it } from "vitest";
import { CROSSWALK } from "../src";
import { KNOWN_REDIRECTED_OR_DEAD } from "./fixtures/known-redirected-or-dead";

/** Host + path + query, so a trailing slash or scheme swap of a dead URL still matches. */
function urlIdentity(raw: string): string {
  try {
    const url = new URL(raw);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.hostname.toLowerCase()}${pathname}${url.search}`;
  } catch {
    return raw.trim();
  }
}

const DENIED = new Set(KNOWN_REDIRECTED_OR_DEAD.map(urlIdentity));

function isDenied(raw: string): boolean {
  return DENIED.has(urlIdentity(raw));
}

describe("Gate 1 item 2: evidence URLs are not known-dead", () => {
  it("does not cite the redirected postmark-mcp URL or any other denylisted evidence URL", () => {
    const problems: string[] = [];
    let postmarkEntries = 0;

    for (const [asiId, entry] of Object.entries(CROSSWALK)) {
      for (const item of entry.evidence) {
        const mentionsPostmark =
          /postmark-mcp/i.test(item.title) ||
          /postmark-mcp/i.test(item.sourceUrl ?? "");
        if (mentionsPostmark) {
          postmarkEntries += 1;
          if (!item.sourceUrl || item.sourceUrl.trim().length === 0) {
            problems.push(
              `${asiId}: postmark-mcp evidence entry has no sourceUrl`,
            );
          } else if (isDenied(item.sourceUrl)) {
            problems.push(
              `${asiId}: postmark-mcp evidence sourceUrl is known redirected/dead (${item.sourceUrl})`,
            );
          }
        }
        if (item.sourceUrl && isDenied(item.sourceUrl) && !mentionsPostmark) {
          problems.push(
            `${asiId}: evidence sourceUrl is on KNOWN_REDIRECTED_OR_DEAD (${item.sourceUrl})`,
          );
        }
      }
      for (const ref of entry.evidenceReferences ?? []) {
        if (isDenied(ref.url)) {
          problems.push(
            `${asiId}: evidenceReference ${ref.id} is on KNOWN_REDIRECTED_OR_DEAD (${ref.url})`,
          );
        }
      }
    }

    if (postmarkEntries === 0) {
      problems.push("no evidence entry mentions postmark-mcp");
    }

    expect(problems, problems.join("\n")).toEqual([]);
  });
});

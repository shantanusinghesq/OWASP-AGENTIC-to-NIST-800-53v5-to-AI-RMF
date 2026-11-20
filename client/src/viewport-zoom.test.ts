// Gate 1 item 3 — viewport zoom (WCAG 1.4.4).
// client/index.html sets maximum-scale=1, which blocks pinch-zoom.
// The viewport content must not set maximum-scale below 5 and must not
// set user-scalable=no.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const INDEX_HTML = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../index.html",
);

function attr(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"),
  );
  return match ? match[2] : null;
}

function viewportContents(html: string): string[] {
  const contents: string[] = [];
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const raw = match[0];
    const name = attr(raw, "name");
    const content = attr(raw, "content");
    if (name?.trim().toLowerCase() === "viewport" && content !== null)
      contents.push(content);
  }
  return contents;
}

describe("Gate 1 item 3: viewport allows pinch-zoom", () => {
  it("does not cap maximum-scale below 5 or set user-scalable=no", () => {
    const contents = viewportContents(readFileSync(INDEX_HTML, "utf8"));
    const problems: string[] = [];

    for (const content of contents) {
      const maxScale = content.match(/maximum-scale\s*=\s*([0-9]*\.?[0-9]+)/i);
      if (maxScale && Number(maxScale[1]) < 5) {
        problems.push(
          `viewport maximum-scale=${maxScale[1]} is below 5 (content: ${content})`,
        );
      }
      if (/user-scalable\s*=\s*(no|0)\b/i.test(content)) {
        problems.push(`viewport sets user-scalable=no (content: ${content})`);
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
  });
});

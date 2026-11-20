// Gate 1 item 1 — social preview tags.
// client/index.html og:url, og:image, and twitter:image still point at
// haremantra.github.io, which 404s. Every og:* / twitter:* URL must be an
// absolute https URL on the live GitHub Pages host, and any image that
// resolves to a local asset must exist under client/public.

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const INDEX_HTML = path.join(REPO_ROOT, "client/index.html");
const PUBLIC_DIR = path.join(REPO_ROOT, "client/public");

/** Live project-site origin, including the repo base path and trailing slash. */
const PAGES_PREFIX =
  "https://shantanusinghesq.github.io/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/";
const PAGES_PATH = "/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/";

const REQUIRED_TAGS = [
  "og:title",
  "og:description",
  "og:url",
  "og:image",
  "twitter:card",
  "twitter:image",
];

/** Open Graph / Twitter keys whose content is a URL (not a title, card type, or alt). */
const URL_KEYS = new Set([
  "og:url",
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "og:audio",
  "og:audio:url",
  "og:audio:secure_url",
  "og:video",
  "og:video:url",
  "og:video:secure_url",
  "og:see_also",
  "twitter:image",
  "twitter:image:src",
  "twitter:url",
  "twitter:player",
  "twitter:player:stream",
]);

const IMAGE_KEYS = new Set([
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "twitter:image",
  "twitter:image:src",
]);

interface MetaTag {
  key: string;
  content: string;
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"),
  );
  return match ? match[2] : null;
}

function parseMeta(html: string): MetaTag[] {
  const tags: MetaTag[] = [];
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const raw = match[0];
    const key = (attr(raw, "property") ?? attr(raw, "name"))?.trim();
    const content = attr(raw, "content");
    if (!key || content === null) continue;
    tags.push({ key, content });
  }
  return tags;
}

function isSocial(tag: MetaTag): boolean {
  return tag.key.startsWith("og:") || tag.key.startsWith("twitter:");
}

function isUrlTag(tag: MetaTag): boolean {
  if (URL_KEYS.has(tag.key)) return true;
  return /^(https?:)?\/\//i.test(tag.content.trim());
}

/** Repo-relative public path when the URL names a file shipped with the site. */
function localPublicRel(content: string): string | null {
  let pathname: string;
  try {
    pathname = new URL(content).pathname;
  } catch {
    return null;
  }
  const idx = pathname.indexOf(PAGES_PATH);
  if (idx === -1) return null;
  const rel = decodeURIComponent(pathname.slice(idx + PAGES_PATH.length));
  if (!rel || rel.endsWith("/")) return null;
  return rel;
}

describe("Gate 1 item 1: social preview tags", () => {
  it("uses absolute GitHub Pages URLs and ships any local preview image", () => {
    const tags = parseMeta(readFileSync(INDEX_HTML, "utf8"));
    const social = tags.filter(isSocial);
    const problems: string[] = [];

    for (const key of REQUIRED_TAGS) {
      if (!social.some((tag) => tag.key === key))
        problems.push(`missing required tag ${key}`);
    }

    for (const tag of social) {
      if (/haremantra\.github\.io/i.test(tag.content)) {
        problems.push(
          `${tag.key} contains haremantra.github.io (${tag.content})`,
        );
      }
    }

    for (const tag of social.filter(isUrlTag)) {
      const content = tag.content.trim();
      if (!content.startsWith(PAGES_PREFIX)) {
        problems.push(
          `${tag.key} must be an absolute https URL starting with ${PAGES_PREFIX} (got ${content})`,
        );
      }
    }

    for (const tag of social.filter((candidate) =>
      IMAGE_KEYS.has(candidate.key),
    )) {
      const rel = localPublicRel(tag.content.trim());
      if (!rel) {
        problems.push(
          `${tag.key} does not reference a file under client/public (${tag.content})`,
        );
        continue;
      }
      const file = path.resolve(PUBLIC_DIR, rel);
      const insidePublic =
        file === PUBLIC_DIR || file.startsWith(PUBLIC_DIR + path.sep);
      if (!insidePublic || !existsSync(file) || !statSync(file).isFile()) {
        problems.push(
          `${tag.key} local asset is missing at client/public/${rel}`,
        );
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
  });
});

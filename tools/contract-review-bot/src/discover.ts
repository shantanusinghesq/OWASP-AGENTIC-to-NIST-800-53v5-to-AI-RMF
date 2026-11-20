import type {
  Config,
  DiscoveredItem,
  Discovery,
  ManualOverride,
} from "./types.ts";

export interface Section {
  title: string;
  body: string;
}

/** Split a markdown file on `## ` headings. The preamble is dropped. */
export function splitSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let title: string | null = null;
  let body: string[] = [];
  const flush = () => {
    if (title !== null) sections.push({ title, body: body.join("\n") });
  };
  for (const line of markdown.split(/\r?\n/)) {
    const heading = /^## (.+)$/.exec(line);
    if (heading) {
      flush();
      title = heading[1].trim();
      body = [];
    } else if (title !== null) {
      body.push(line);
    }
  }
  flush();
  return sections;
}

export function discoverGates(
  markdown: string,
): { number: string; title: string }[] {
  const gates: { number: string; title: string }[] = [];
  const re = /^## Gate (\d+)\s+[—–-]\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    gates.push({ number: match[1], title: match[2].trim() });
  }
  return gates;
}

export function hardRulesPresent(markdown: string): {
  tests: boolean;
  protectedPaths: boolean;
} {
  return {
    tests: /never weaken, skip, or delete/i.test(markdown),
    protectedPaths: /never edit `?\.github\/`?/i.test(markdown),
  };
}

function cleanTitle(title: string): string {
  return title
    .replace(/`?\[manual\]`?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assign(
  title: string,
  kind: "manual" | "na",
  overrides: ManualOverride[],
): { gate_id: string; anchors: string[] } {
  const clean = cleanTitle(title);
  const found = overrides.find((override) =>
    clean.toLowerCase().includes(override.title_includes.toLowerCase()),
  );
  if (found) return { gate_id: found.gate_id, anchors: found.anchors };
  return {
    gate_id: `${kind}-${slug(clean) || "item"}`,
    anchors: [clean.toLowerCase()],
  };
}

export function discoverItems(
  markdown: string,
  config: Pick<Config, "manual" | "na">,
): DiscoveredItem[] {
  const items: DiscoveredItem[] = [];
  for (const section of splitSections(markdown)) {
    const isManual = /\[manual\]/i.test(section.title);
    const isNa = /\*\*N\/A today\.?\*\*/i.test(section.body);
    if (!isManual && !isNa) continue;
    const kind = isManual ? "manual" : "na";
    const assigned = assign(
      section.title,
      kind,
      kind === "manual" ? config.manual : config.na,
    );
    items.push({
      gate_id: assigned.gate_id,
      title: cleanTitle(section.title),
      kind,
      anchors: assigned.anchors,
    });
  }
  return items;
}

export function discover(
  gatesMarkdown: string,
  constraintsMarkdown: string,
  config: Config,
): Discovery {
  const hard = hardRulesPresent(gatesMarkdown);
  return {
    gates: discoverGates(gatesMarkdown),
    hard_tests: hard.tests,
    hard_protected: hard.protectedPaths,
    items: discoverItems(constraintsMarkdown, config),
  };
}

const DISPOSITION = /\bsatisfied\b|\bn\/a\b|\bnot applicable\b/i;

/**
 * A line answers an item when it names an anchor and says satisfied or N/A.
 * The body is data. Nothing in it is executed.
 */
export function lineAnswers(body: string, item: DiscoveredItem): boolean {
  const anchors = [item.gate_id, ...item.anchors]
    .map((anchor) => anchor.toLowerCase())
    .filter((anchor) => anchor.length > 0);
  for (const line of body.split(/\r?\n/)) {
    const lower = line.toLowerCase();
    if (!DISPOSITION.test(lower)) continue;
    if (anchors.some((anchor) => lower.includes(anchor))) return true;
  }
  return false;
}

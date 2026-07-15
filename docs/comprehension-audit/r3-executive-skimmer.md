# R3 — The Executive Skimmer

**Role:** Chief of staff to a CISO, large enterprise. Non-operator. ~40 links/day. One decision each: forward / file / drop.
**Budget:** 90 seconds, 2 minutes at the outside.
**Source:** the live site only. Link arrived from an industry mailing list, no commentary.

---

## T0 — FLASH (first paint, 5 seconds)

**What I recall, unprompted:**

- Big title: **"Agentic AI Risks."** Above it, a small blue eyebrow: **"COMPLIANCE MIDDLEWARE."**
- A line with arrows in it — **"Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1."** That arrow chain is the single thing that landed. Three frameworks, one maps to the next.
- Four number tiles: **10 / 54 / 17 / 4.** I retained "10 risks" and "4 Critical."
- A red incident banner — **"EchoLeak (CVE-2025-32711)... Microsoft 365 Copilot."** A named, real-world CVE at a name-brand vendor. That is the highest-salience object on the screen after the title.
- A bar reading **"EVIDENCE CONFIDENCE — 80 MAPPINGS,"** and under it **"100% Editorial · 0% Reviewed · 0% Validated."** I clocked the "100% Editorial / 0% Validated" instantly and it changed my read of everything above it.

**What is this?** A reference map from a new agentic-AI threat list onto control frameworks my org already runs (800-53, AI-RMF). Interactive, browser-based.

**Who is it for?** Somebody who has to answer "which of our existing controls already cover AI agent risk?" — i.e., GRC / control owners. Not the CISO. Not me.

**Call at 5 seconds:** **File**, leaning forward-to-one-person. Not drop — the CVE banner and the framework chain make it concretely relevant to a live agenda item. Not a clean forward — "100% Editorial, 0% Validated" is sitting right there in the hero, and I am not forwarding an unvalidated mapping to a CISO without a caveat.

**Confidence:** 4/5. The header did its job. I knew what it was before I scrolled.

**Note on what the flash did NOT tell me:** who made it. No org logo, no OWASP badge, no vendor name. "COMPLIANCE MIDDLEWARE" is a category, not a publisher. That's the open question I carry into T1.

---

## T1 — THE SKIM (60 seconds)

Navigated. Scrolled once.

**Beat 1 — a modal ate the page.**
One PageDown in, a dialog fired over everything: **"Welcome to the Compliance Middleware."** Body: *"AI agents don't just generate text—they take action. This platform bridges the gap between emerging agentic threats (OWASP) and established enterprise security frameworks (NIST). Let's run a quick simulation to see how a single AI failure impacts your compliance posture."* Two buttons: **"Run First Simulation"** (primary) and **"Skip tutorial (I know my way around)."**

This is the closest the site came to losing me. I was reading. It interrupted me to offer a tutorial I did not ask for, on a product I have not yet decided is real. I pressed **Escape — it did not close.** I had to spend a click on "Skip tutorial" to get back to the page I was already looking at. For a link on a 90-second clock, a non-dismissible interstitial is a bounce trigger, and the only reason I didn't bounce is that T0 had already sold me on the header. **A colder reader dies here.**

(Grudging credit: the modal's body copy is the clearest one-sentence thesis on the entire site — "AI agents don't just generate text—they take action... bridges the gap between emerging agentic threats (OWASP) and established enterprise security frameworks (NIST)." That sentence belongs in the hero, not behind an interruption.)

**Beat 2 — the risk grid.**
Filter chips across the top: **All (10) / Critical (4) / High (5) / Medium-High (1).** Then a card grid, one per risk. Each card: an ID (**ASI01**), a severity chip (**CRITICAL** in red / **HIGH** in amber), a title, two lines of plain-English description, and — the part I actually care about — a count line: **"4 NIST families, 11 controls"** and **"4 AI-RMF functions, 8 categories."** Then **"Explore Mappings →."**

I read four of them and stopped: **ASI01 Agent Goal Hijack** ("Attackers redirect agent objectives through poisoned inputs"), **ASI03 Identity & Privilege Abuse**, **ASI08 Cascading Failures**, **ASI10 Rogue Agents**. Those are the four Criticals from the tile in the hero, and the grid is ordered so they're the first thing I hit. Good.

The count line is the tell. It means the answer to "how much of this do our existing 800-53 controls already touch" is a number, and the number is on the card. That is exactly the shape of thing a GRC lead can use.

**Beat 3 — the footer.**
Straight to the bottom. **"Licensed under AGPL-3.0."** **"Source Code."** **"Export data (v0.9.0): Download JSON / Download CSV."** A collapsed strip: **"PROVENANCE & LIMITATIONS — Show."** And the sources line: **"Sources: OWASP Top 10 for Agentic AI (ASI) 2026 | NIST SP 800-53 Rev 5 (OSCAL v1.5.0) | NIST AI Risk Management Framework AI 100-1, v1.0."** Copyright: **"© 2026 haremantra."**

Three things resolve here:
1. **It's open source, and the data exports.** JSON/CSV means my GRC people can actually take it somewhere. That converts it from "a website" to "an artifact."
2. **`v0.9.0`.** Pre-1.0. Sets expectations.
3. **It's a person, not an institution.** "haremantra" is a handle. There is no company, no OWASP endorsement, no named author with a title. Combined with the hero's "100% Editorial / 0% Validated," the credibility picture is complete: *this is one competent individual's mapping, published honestly, with the confidence level disclosed up front.*

That disclosure is the reason I don't drop it. Most things that cross my desk overclaim. This one under-claims in the hero, in a progress bar, unprompted. **The hero also says the severity ratings "are editorially assigned based on OWASP ordinal risk ranking and are not official OWASP severity classifications"** — that's a disclaimer that most vendors would have buried and this one put in the subhead. I trust a source that tells me where it's weak.

**Call at 60 seconds:** Decision made. I know what it is, who it's for, and what it's worth. **Forward, with a caveat, to one person.**

---

## T2 — THE LAST 30 SECONDS

**Skipping.** T1 settled it.

The one question I still have — *who is haremantra and why should I believe their control mappings* — is **not resolvable by another click on this site**, and I know that, because the site already answered it in the only way it can: it told me the mappings are 100% editorial and 0% validated, and it handed me the source code and the raw data so someone else can check. There is no "About the author" click that would change my decision. Spending clicks would be theater.

I did not open **PROVENANCE & LIMITATIONS**. Honest accounting: it's collapsed behind a "Show" toggle at the very bottom of a long page, and it's the single most decision-relevant control on the page for a credibility-triaging reader like me. **I never found out what's in it.** The one thing I most wanted was one click and one full-page scroll away from where I'd have looked. That is a placement failure, not a content failure — I have no idea whether the content is good, because the page never gave me a reason to click while I still had budget.

---

## T3 — THE DECISION

### **FORWARD.** One recipient. With a caveat in the note.

**To:** the Director of GRC / Risk (the person who owns our 800-53 control catalog and who has been asked to produce an "AI agent controls" position for the AI governance committee).
**Not** to the CISO — nothing here is at the altitude where he'd act, and the "0% Validated" bar means I'd be handing him something I'd then have to defend.
**Not** to the AppSec/red-team lead — this isn't a testing tool.

**The one-line note above the link:**

> *Independent (one-person, AGPL, v0.9) crosswalk mapping the new OWASP Agentic AI Top 10 onto our 800-53 Rev 5 families and AI-RMF — 80 mappings, exports to CSV, and it says plainly the mappings are editorial and unvalidated. Useful as a straw-man starting point for the agentic-controls gap analysis, not as an authority. Worth 20 minutes of someone's time to see if it saves us a month of ours.*

I could write that line **from the hero alone.** That's the test, and it passes.

**Where I nearly lost it:** the welcome modal. If it had appeared on first paint instead of after a scroll, this write-up would say "drop at second 8" and you'd never have gotten the rest.

---

## T4 — DEBRIEF (out of time pressure)

**What do I believe this tool IS?**
A free, open-source, browser-based **reference crosswalk**: it takes the 10 risks in OWASP's 2026 Top 10 for Agentic AI and maps each one onto specific NIST 800-53 Rev 5 control families/controls and NIST AI-RMF categories, with rationale and real-world incident evidence attached (the EchoLeak CVE banner is the showcase). 80 mappings total. It ships the data out as JSON/CSV, and it has a "Scenario Simulator" component I saw named in the tab bar but never opened.

**Who is it for?**
A GRC / compliance / control-owner audience inside an enterprise that (a) already runs an 800-53 control catalog and (b) has just been handed "figure out AI agents" by a board or a committee. Its whole value proposition is *reuse*: you already have controls; here's which ones already apply. It is **not** for a CISO, not for an engineer, not for a red-teamer.

**What job does it finish for them?**
It converts "we have no AI-agent control framework" into "here is a defensible first-draft mapping onto the framework we already have, with 80 candidate mappings and a gap list, exportable into whatever we track controls in." It finishes the *blank-page* problem. It does not finish the *assurance* problem.

**What does it explicitly NOT claim?**
This is the site's best feature and it says it out loud, twice, in the hero:
- The evidence-confidence bar: **100% Editorial, 0% Reviewed, 0% Validated.** It does not claim its mappings have been reviewed by anyone.
- The subhead: severity ratings **"are editorially assigned based on OWASP ordinal risk ranking and are not official OWASP severity classifications."** It does not claim to speak for OWASP.
- **v0.9.0** in the export line. It does not claim to be finished.

**What I never found out:**
- **Who made it.** "© 2026 haremantra" is a handle. No name, no title, no affiliation, no credential. For a credibility triager this is the biggest hole on the page — and the *only* reason it isn't fatal is that the tool pre-emptively told me not to trust it too much.
- **What's under PROVENANCE & LIMITATIONS.** Collapsed, bottom of page, never opened. I never found out.
- **What the Scenario Simulator actually does.** I saw the tab and I saw the modal offer to "run a quick simulation to see how a single AI failure impacts your compliance posture." I never ran it, and nothing outside the modal told me why I'd want to. It's the loudest thing on the page (it gets a blocking dialog!) and I still can't tell you what it produces.

**Confidence I understood its purpose: 4/5.**
Docked one point only because the tool has a whole second engine (the simulator) whose purpose I genuinely cannot state, and because the "COMPLIANCE MIDDLEWARE" label promises a *runtime* posture ("middleware" implies something sitting in a request path) that the rest of the page does not deliver — this is a static reference map, not middleware. That word cost the page a point of clarity.

---

## CLAIM AUDIT

Every substantive factual claim I made above, tagged.

| # | Claim | Tag |
|---|---|---|
| 1 | The tool bridges ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1 | `[SITE: hero subhead — "Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1. Interactive compliance mapping for agentic AI security risks across 10 threat categories."]` |
| 2 | It is positioned as "COMPLIANCE MIDDLEWARE" | `[SITE: blue eyebrow label above the "Agentic AI Risks" H1]` |
| 3 | 10 risks, 54 unique 800-53 controls, 17 unique AI-RMF categories, 4 Critical | `[SITE: the four stat tiles — "ASI RISKS 10", "UNIQUE 800-53 CONTROLS 54", "UNIQUE AI-RMF CATEGORIES 17", "CRITICAL RISKS 4 — ASI01, ASI03, ASI08, ASI10"]` |
| 4 | 89 control mappings across 10 risks / 62 category mappings | `[SITE: sub-text inside the 54 and 17 stat tiles]` |
| 5 | 80 mappings total, 100% Editorial / 0% Reviewed / 0% Validated | `[SITE: "EVIDENCE CONFIDENCE — 80 MAPPINGS" bar in hero, with the three legend dots beneath it]` |
| 6 | Severity ratings are editorial, not official OWASP classifications | `[SITE: hero subhead, final sentence — "Severity ratings (Critical, High, Medium-High) are editorially assigned based on OWASP ordinal risk ranking and are not official OWASP severity classifications."]` |
| 7 | It features EchoLeak / CVE-2025-32711, a zero-click prompt-injection data-exfil in Microsoft 365 Copilot, mapped to ASI01 Agent Goal Hijack | `[SITE: red "FEATURED INCIDENT · ASI01 AGENT GOAL HIJACK · CVE-2025-32711" banner in hero + its "See how it maps to NIST controls →" link]` |
| 8 | Four navigation surfaces: Overview, Heatmaps, Evidence Explorer, Scenario Simulator | `[SITE: tab bar beneath the hero]` |
| 9 | Risks are shown as cards with severity chips and per-risk mapping counts ("4 NIST families, 11 controls") | `[SITE: the ASI01–ASI10 card grid; e.g. the ASI01 Agent Goal Hijack card]` |
| 10 | Filters exist for All (10) / Critical (4) / High (5) / Medium-High (1) | `[SITE: filter chip row above the card grid]` |
| 11 | A blocking welcome modal appears, pitching a simulation, and does not close on Escape | `[SITE: "Welcome to the Compliance Middleware." dialog with "Run First Simulation" / "Skip tutorial (I know my way around)" — Escape keypress did not dismiss it; a click on "Skip tutorial" was required]` |
| 12 | The stated thesis "AI agents don't just generate text—they take action" | `[SITE: body copy of that welcome modal]` |
| 13 | AGPL-3.0 licensed, source code linked | `[SITE: footer — "Licensed under AGPL-3.0" chip + "Source Code" link]` |
| 14 | Data exports as JSON and CSV; version v0.9.0 | `[SITE: footer — "Export data (v0.9.0): Download JSON / Download CSV"]` |
| 15 | Sources are OWASP Top 10 for Agentic AI (ASI) 2026, NIST SP 800-53 Rev 5 (OSCAL v1.5.0), NIST AI-RMF AI 100-1 v1.0 | `[SITE: footer sources line]` |
| 16 | Authorship is a handle, not an organization | `[SITE: footer — "Copyright © 2026 haremantra. All rights reserved for the hosted service." — and the *absence* of any author/org/affiliation element anywhere I scrolled. Negative finding.]` |
| 17 | A "PROVENANCE & LIMITATIONS" section exists but is collapsed | `[SITE: footer strip with a "Show" toggle — contents never viewed]` |
| 18 | There is a "How mappings are validated" link | `[SITE: right side of the EVIDENCE CONFIDENCE bar — never clicked]` |
| 19 | That my org runs an 800-53 control catalog / that GRC owns it / that "middleware" implies a runtime request path | `[PRIOR KNOWLEDGE — not from the site. This is my own enterprise context and my own reading of the word "middleware." The site says nothing about who runs 800-53 or what it expects of them.]` |
| 20 | That OWASP's Agentic Top 10 is new/emerging and that a CVE at Microsoft carries weight with my leadership | `[PRIOR KNOWLEDGE — not from the site.]` |

**`[REACHED FOR EXTERNAL HELP]` events: none.** I felt the pull exactly once — at the footer, wanting to know who "haremantra" is. I did not act on it. Worth recording that the pull existed, because it means the page left a credibility question open that a real reader *would* have taken to Google, and once they're on Google they may not come back.

---

## DID THE TOP OF THE PAGE — BEFORE ANY CLICK — GIVE ME A THESIS I COULD FORWARD?

# Yes.

And this is not a close call. The hero is the best-performing part of this artifact by a distance.

**The words that did it:**

> **"Agentic AI Risks"**
> **"Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1. Interactive compliance mapping for agentic AI security risks across 10 threat categories."**

That is a complete forwardable thesis in one sentence: *what it maps* (agentic AI risks), *what it maps them to* (two frameworks I already own), *how many* (10), and *what form it takes* (interactive mapping). I wrote my entire forward note out of that sentence plus the confidence bar. I did not need a single click.

Three specific things earn it:

1. **The arrow chain does the work a paragraph would have failed to do.** `ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1` is legible in a peripheral glance. It is the whole product in nine characters of punctuation.
2. **The named CVE is the credibility anchor.** *"EchoLeak (CVE-2025-32711): zero-click prompt-injection data exfiltration in Microsoft 365 Copilot"* — a real incident, a real vendor, a real CVE number, tied to a specific risk (ASI01). That single banner is why I read past the hero. Abstract framework crosswalks are a dime a dozen; one that opens by pointing at a shipped exploit in Microsoft 365 is not.
3. **The confidence bar is a trust *builder*, not a trust cost.** `100% Editorial · 0% Reviewed · 0% Validated`, volunteered in the hero, unprompted, next to the word count of its own claims. It is very rare for a thing to tell me its own weakness before I find it. It cost the tool authority and bought it credibility, and for a triager that is a good trade — it is the reason this is a forward-with-caveat and not a drop.

**The words that did NOT do it, and cost the page:**

- **"COMPLIANCE MIDDLEWARE."** This is the first thing on the page and it is *wrong about its own product*. "Middleware" means something sitting in a runtime path, intercepting. This is a static reference map with a simulator attached. The label promises a product and delivers a document, and if I'd forwarded it on the eyebrow alone, my GRC lead would have opened it expecting to install something. **Fix this word.**
- **The thesis is stronger inside the modal than in the hero.** *"AI agents don't just generate text—they take action"* is the sentence that explains **why any of this exists**, and it is locked behind an interruption that a skimmer's first instinct is to kill. Move it into the hero; delete the modal.
- **No author, anywhere above the fold or below it.** Not a name, not an affiliation, not a one-line "who made this and why." For the audience most likely to *act* on this page — someone about to stake a committee deliverable on your mapping — this is the missing element. The tool honestly disclosed the confidence of its data and then omitted the confidence of its source.

**The single most damaging thing on the page is the welcome modal,** and it is damaging in inverse proportion to how good the hero is. The hero earns 90 seconds of my attention; the modal spends the first 15 of them fighting me, refuses Escape, and demands a click to undo an interaction I never initiated. The hero sold this link. The modal came close to un-selling it.

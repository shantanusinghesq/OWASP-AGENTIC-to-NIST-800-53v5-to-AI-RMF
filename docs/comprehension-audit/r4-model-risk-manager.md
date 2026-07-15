# R4 — The Second-Line Model-Risk Manager

Comprehension study transcript. Participant persona: second-line AI/model-risk manager, large
financial-services firm. Site-only; no repo, no README, no search.

Site under study: https://haremantra.github.io/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/
Session date: 2026-07-14. Crosswalk data version shown on site: **v0.9.0**.

---

## T0 — FLASH (first paint, five seconds)

**What is this?** A reference/mapping page. Something takes an agentic-AI threat list and lines it up
against NIST. I can see three framework names in one sentence and a row of counters. It reads like a
crosswalk, not a product.

**Who is it for?** Someone who has to justify a control set. The counters (10 / 54 / 17 / 4) are the
tell — that is a coverage-statistics vocabulary, and coverage statistics exist to be shown to
somebody. Not an engineer's tool; an engineer doesn't need "4 Critical risks" in 48-point type.

**Is it for me?** Provisionally yes, and that surprised me. Two things did it. First, "Bridging ASI
2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1" — that is exactly the sentence I would have to write
myself. Second, and much more important: **"100% Editorial · 0% Reviewed · 0% Validated."** A bar,
on the hero, telling me the content is unreviewed. I have never seen a compliance artifact volunteer
that on first paint. Either this is very honest or it is very naive. Either way I kept reading, and I
would not have kept reading a page that claimed "validated."

**Confidence it's for me: 3/5.** Interested, not persuaded. I do not yet know whether it *does*
anything or is just a poster.

**What I recall, unprompted:** "Agentic AI Risks"; "Compliance Middleware" over the title; the three
frameworks in an arrow chain; a red incident band saying EchoLeak and a CVE number; four counters;
the Editorial/Reviewed/Validated bar; and a sentence saying severity ratings are "editorially
assigned … not official OWASP severity classifications." The disclaimer is *in the hero paragraph*,
not in a footnote. Noted.

---

## T1 — SCAN, NO CLICKING

A modal I did not see in the flash: **"Welcome to the Compliance Middleware."** — "Let's run a quick
simulation to see how a single AI failure impacts your compliance posture," with **"Run First
Simulation"** and **"Skip tutorial (I know my way around)."** So the author's intended front door is
a *simulation*. That is not the door I want. I want the mapping. First small mismatch between what
the tool thinks its job is and what I think its job is.

Below it: four tabs — **Overview / Heatmaps / Evidence Explorer / Scenario Simulator**. Then "10
Agentic AI Risks", severity filters "All (10) / Critical (4) / High (5) / Medium-High (1)", and ten
risk cards. Each card carries a line like **"4 NIST families, 11 controls"** and **"4 AI-RMF
functions, 8 categories"** and a button **"Explore Mappings."** Footer has **"Export data (v0.9.0):
Download JSON / Download CSV"** and a collapsed **"Provenance & Limitations."**

**What it's for, in my words:** It is a pre-built, opinionated crosswalk. Somebody has already done
the mapping exercise I have been putting off — take the OWASP agentic top-ten, and for each one name
the 800-53 controls and the AI-RMF categories that bear on it, with a reason. It is a starting
control set for agents, with citations.

**What I'm meant to do first:** The page says run a simulation. I think I'm meant to click a risk and
read the mapping. I'll do mine.

**Unanswered after 60 seconds:** Who authored it. What "Editorial" costs me. Whether I can get the
mapping *out* in a form Archer will eat. Whether I can record my own firm's view on any of it.

---

## T2 — FREE EXPLORATION (click path, thinking aloud)

Click path:
`Skip tutorial` → footer `Provenance & Limitations` → ASI01 `Explore Mappings` → control chip `AC-6
Least Privilege` → `Export brief` (new tab) → back → `Heatmaps` → `800-53 Heatmap` → `Evidence
Explorer` → search box: typed `AU-12` → `Scenario Simulator` → `Guided` → `Generate Scenario` →
back to Overview → `Heatmaps` → footer `Download CSV` → footer `Download JSON`.

**Provenance & Limitations — I went here first, deliberately.** This is the section that decides
whether the rest is worth my time, and it is genuinely good. It gives me "PINNED UPSTREAM EDITIONS"
with a *verified date* on each (OWASP ASI 2026, NIST SP 800-53 Rev 5 (OSCAL v1.5.0), AI-RMF AI 100-1
v1.0 — all "verified 2026-07-11"). Then "KNOWN LIMITATIONS", and it says the quiet parts out loud:

- "Severity ratings are editorial: … this project's editorial judgement, not an official OWASP
  classification."
- "Control coverage: 54 distinct NIST 800-53 controls are mapped across 14 of the 16 in-scope
  families; Media Protection (MP) and Physical & Environmental (PE) are currently unmapped."
- "**Single-author provenance:** Mappings and rationales reflect a single-author editorial process;
  they have not undergone independent multi-reviewer validation."
- "Evidence backfill in progress: … some mappings cite illustrative incidents rather than an
  exhaustive evidence base."

A named, dated, self-declared scope-and-limitations statement. That is a *model documentation*
instinct, and whoever wrote it has been on the receiving end of a challenge before. I relaxed
slightly. I also now know exactly how to caveat anything I take from here — the tool wrote my caveat
for me.

**ASI01 detail.** Better than I expected. The risk carries a line I did not expect to see on a
security site: **"Governance: treat as a Tier-1 model risk — board/CRO reporting, independent
validation, and continuous monitoring under SR 11-7; escalate before deployment."** SR 11-7. On the
page. Somebody has thought about my reader, not just the engineer's.

Then a **"GOVERNANCE FRAMEWORK BRIDGE"** panel, badged **"EDITORIAL V1 · VERIFY BEFORE USE"**,
mapping the risk out to **ISO/IEC 42001** (A.6.2.4, A.5.2), **EU AI Act** (Art. 15, Art. 14), and an
**SR 11-7 lifecycle** stage ("Ongoing Monitoring"). This is the single most commercially interesting
thing on the site for me and it is buried three clicks down. It is also the thing I trust least, and
the site knows it — "VERIFY BEFORE USE" is doing a lot of work there.

Then **"MAPPING VALIDATION STATUS"**, which defines its three states in plain words:
- EDITORIAL — "Authored from public evidence + authoritative guidance; not yet externally reviewed."
- REVIEWED — "An external practitioner has signed off on the mapping."
- VALIDATED — "Corroborated by observed incident / exploitation evidence."
And a filter: **All (8) / Editorial (8) / Reviewed (0) / Validated (0)**. Every mapping on this site
is Editorial. The site says so four separate times in four places. I cannot claim I wasn't told.

The mappings themselves are family-grouped with a rationale each — e.g. AU-2/AU-6/AU-12 with
"Comprehensive logging of goal state, tool sequences, and behavioral baselines enables detection of
unauthorized goal drift." That is a sound sentence. Clicking **AC-6** expands to a description plus
**agentic-specific implementation guidance** ("limiting agent tool access to only necessary
functions … time-bound or task-bound privilege elevation") and a "Related ASI: ASI01, ASI03"
back-reference. The implementation guidance is the part I could not have written myself, and it is
the part I'd actually lift.

**"Export brief"** opened a print-ready page titled **"Agentic AI risk — committee brief"** —
"ASI01 risk brief · generated 2026-07-14T20:32:57Z", with a "Print / Save as PDF" button, the full
control list, every rationale, "VALIDATION STATUS: EDITORIAL" stamped under each block, the three
incident citations *with live URLs*, a PROVENANCE block, and "Crosswalk data version 0.9.0". Someone
has actually thought about the artifact leaving the building. It is timestamped, versioned, and
self-caveating. I would put that in a committee pack tomorrow — as an *appendix*, and with my own
cover note.

**Heatmap.** A 10×16 control-density matrix, ASI rows by severity, family columns, cell = number of
mapped controls, plus an "Exposure" total per row. Highest is ASI01 at 11. It also tells me its own
scope in prose: "16 of the 20 NIST 800-53 Rev 5 families are in scope; 14 carry mapped controls (MP
and PE are defined but currently unmapped)" and "Excluded families (AT, MA, PS, PT) have lower
relevance to agentic AI threat vectors." **I disagree with excluding AT (Awareness & Training) and
PS (Personnel Security)** for an agentic deployment — ASI09 is literally *Human-Agent Trust
Exploitation*, and the control for humans over-trusting an agent is training. That is a substantive
editorial call I would challenge. But it is *disclosed*, which is the only reason I can challenge it.

**Evidence Explorer.** Not what the name promised — it is the same crosswalk detail view with a risk
picker. But it has a search box, and the search does the thing I actually want: I typed **`AU-12`**
and got **"3 results found"** — AU-12 mapped into ASI01, ASI02, ASI10. That is the *reverse* lookup:
given a control my firm already operates, which agentic risks does it touch. That is a real query and
it works. It is also completely undiscoverable — the search box is not in the tab, it's in the header.

**Scenario Simulator** ("Risk Engineering Platform"). Guided → Generate Scenario gives me a fact
pattern ("Erroneous × Single Architecture with Standard Governance"), a narrative, "KEY QUESTIONS", a
cascade-failure topology diagram, a dynamic heatmap, and a scorecard: **"BROKEN CONTROLS 15 / 5
families affected"**, **"ACTIVE CONTROLS 7 / 67 irrelevant"**, and implicated risks with **weights —
ASI08 90%, ASI09 80%, ASI06 70%**.

This is where I stop being a customer and start being a reviewer. Those are quantitative outputs. A
number like "90%" in a risk artifact will be read as a probability by everyone downstream of me, and
I cannot see anywhere on this screen what it is a percentage *of*, what data it was fitted on, or
who set it. There is no "EDITORIAL" badge on the simulator — the badges live on the crosswalk. The
Architecture Analyzer also volunteers "**AI vision analysis is unavailable in this deployment**",
which is honest but means the flagship input is a manual pattern-picker. **If I put this simulator's
output in front of an examiner I would be handing them a model with no documented methodology, and
they would ask me to validate it, and I could not.** The crosswalk is a citation. The simulator is an
unvalidated model. They are in the same product with the same visual weight, and only one of them is
labelled.

---

## T3 — SELF-DIRECTED TASK

**My task, stated before attempting it:** *"Assemble a defensible starting control set for the
Markets agentic copilot. Pick the agentic risks that actually apply to it, get the consolidated NIST
800-53 control list with rationale, and produce something I can (a) put in front of the AI committee
and (b) load into the model inventory — with provenance attached."*

For a Markets read/write copilot I'd scope to five: **ASI01** (goal hijack), **ASI02** (tool misuse),
**ASI03** (identity & privilege abuse), **ASI06** (memory/context poisoning), **ASI09** (human-agent
trust). Excluding rogue-agent/swarm risks at MVP because we're deploying single-agent.

**What I could do:**
- Read each of the five mappings, with rationale and agentic implementation guidance. Yes.
- Export a per-risk committee brief, print-ready, timestamped, versioned, with citations. Yes —
  **one risk at a time**, via `Export brief` on each detail page.
- Export the whole crosswalk as CSV and JSON from the footer. Yes.

**Where I got stuck — three places, in ascending order of seriousness:**

**1. There is no scoping.** I could not find any way to say "these five, not those ten." No checkbox,
no multi-select, no basket, no "add to assessment." I checked the Overview cards, the heatmap rows,
and the detail view. `Export brief` is single-risk. The CSV/JSON are all-ten. So my scoped brief is a
manual assembly job: five separate PDF exports, stapled, plus my own cover page. That is fine — but
it is *my* work, not the tool's. The tool got me to the raw material, not the deliverable.

> **Anomaly I must flag honestly:** a browser tab titled *"AI Committee - agentic control scoping —
> committee brief"* was already open in my browser when the session began (about:blank, not
> navigable). That title implies a **named, scoped, multi-risk brief** feature exists. I could not
> find a route to it from any screen. I am recording it as a tab title I observed, **not** as a
> feature the site showed me — because from the UI, I never found the door.

**2. The CSV silently drops the caveat. This is the real finding.** The CSV columns are:
`asiId, asiName, severity, family, familyName, controlId, controlTitle, rationale, evidence`.
There is **no validation-status column**, no AI-RMF column, no data-version column, no date, no
source. The JSON *does* carry it — `"validationStatus": "editorial"` on every mapping, plus an
`upstreamVersions` block with `lastVerified: "2026-07-11"` per framework.

So: the machine-readable export preserves provenance; **the export a human will actually open in
Excel and paste into a control library strips it.** The single most important governance fact about
this data — that it is one person's unreviewed editorial judgement — survives in the format my
engineers read and dies in the format my analysts read. If a junior analyst loads that CSV into
Archer, the firm now has 89 agent control mappings with rationale text sitting in the GRC platform
and **no marker anywhere that says "unreviewed."** Six months later nobody remembers where it came
from and it has become policy by sedimentation. I have seen precisely this happen with a vendor
spreadsheet, and it cost us an MRA. **A `validationStatus` column in the CSV is a one-line fix and it
is the difference between an honest tool and a liability.**

**3. Nowhere to record our own judgement.** See below.

**Did I reach a finished, hand-overable output?** Partially. The per-risk committee brief is the
closest thing, and it is genuinely good: versioned, timestamped, cited, self-caveating. **Would it
survive contact with an examiner?** Not on its own, and it doesn't pretend it would. As an *appendix*
to my own assessment — "here is the industry crosswalk we used as a starting point, here is its
stated provenance, here is where we challenged it, here is our own control decision and who owns it"
— yes, comfortably. As *the* assessment, no. Standing alone it fails the first question every
examiner asks, which is not "what does it say" but "**who at your firm reviewed this, and how do you
know it's right?**" The tool has no answer to that question and, to its credit, does not pretend to.

---

## T4 — THE NOTE TO MY PEER

> Thanks for the link — I spent an hour in it, which is fifty-five minutes more than I give most of
> these.
>
> It's not a platform, whatever the header says. It's a **crosswalk**: somebody has taken the OWASP
> agentic top-ten and, for each one, named the 800-53 controls and the AI-RMF categories that bear on
> it, with a written rationale and real incident citations — EchoLeak, the Gemini calendar-invite
> injection, AgentFlayer. Ten risks, 54 distinct controls, 89 mappings. The per-control notes have
> genuine agentic-specific implementation guidance ("time-bound or task-bound privilege elevation")
> that I could not have drafted myself, and it's the only place I've seen the agentic risks mapped
> back to SR 11-7 lifecycle stages and ISO 42001 in the same view.
>
> The reason I trust it is the reason most people will bounce off it: it tells you it's unreviewed.
> Front page, in numbers — "100% Editorial, 0% Reviewed, 0% Validated" — and a limitations block that
> says in terms "single-author provenance … not undergone independent multi-reviewer validation."
> Every mapping carries an EDITORIAL badge. That's not a weakness, that's the most professional thing
> on the site, and it's why I'd let it near a committee pack.
>
> The job it actually finishes: **it kills the blank page.** It gets you from "we have no control set
> for agents" to a defensible first draft with citations, in an afternoon instead of a fortnight. The
> reverse lookup is the sleeper feature — type a control you already own, see which agentic risks it
> touches. And there's a per-risk "Export brief" that prints a timestamped, versioned, cited
> committee appendix.
>
> What I'd never use it for: the "Scenario Simulator." It emits percentages and broken-control counts
> with no visible methodology, and an unvalidated model dressed as an assessment is exactly the thing
> we get written up for. Also — one landmine — **the CSV export drops the validation-status column
> that the JSON keeps.** Don't let anyone load that CSV straight into Archer; the "unreviewed" flag
> doesn't travel with it and in six months it'll be policy and nobody will know why.
>
> Use it as a starting draft and a source of citations, put your own name and review date on the
> front, and challenge its scope calls (it excludes Awareness & Training entirely, which for
> human-agent trust exploitation is just wrong). Worth your hour.

---

## CLAIM AUDIT

Every substantive factual claim above, tagged.

| # | Claim | Tag |
|---|---|---|
| 1 | Bridges OWASP ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1 | [SITE: hero paragraph, "Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1"] |
| 2 | Severity ratings are editorial, not official OWASP | [SITE: hero paragraph, "Severity ratings … are editorially assigned … and are not official OWASP severity classifications"] |
| 3 | 10 risks / 54 unique 800-53 controls / 89 total control mappings / 17 AI-RMF categories / 62 category mappings / 4 Critical | [SITE: the four hero stat cards — "ASI Risks 10", "Unique 800-53 Controls 54 / 89 total control mappings", "Unique AI-RMF Categories 17 / 62 total category mappings", "Critical Risks 4 — ASI01, ASI03, ASI08, ASI10"] |
| 4 | All mappings are unreviewed: 100% Editorial, 0% Reviewed, 0% Validated (80 mappings) | [SITE: hero bar, "EVIDENCE CONFIDENCE — 80 MAPPINGS · 100% Editorial · 0% Reviewed · 0% Validated"] |
| 5 | Three validation states are defined: Editorial / Reviewed / Validated | [SITE: detail view, "MAPPING VALIDATION STATUS" panel — "EDITORIAL: Authored from public evidence + authoritative guidance; not yet externally reviewed." / "REVIEWED: An external practitioner has signed off on the mapping." / "VALIDATED: Corroborated by observed incident / exploitation evidence."] |
| 6 | Every one of ASI01's 8 mappings is Editorial; zero Reviewed, zero Validated | [SITE: detail-view filter row, "All (8) / Editorial (8) / Reviewed (0) / Validated (0)"] |
| 7 | Single-author provenance, not independently validated | [SITE: footer "Provenance & Limitations" → "KNOWN LIMITATIONS" → "Single-author provenance: Mappings and rationales reflect a single-author editorial process; they have not undergone independent multi-reviewer validation."] |
| 8 | MP and PE families are unmapped; 54 controls across 14 of 16 in-scope families | [SITE: same limitations block, "Control coverage: 54 distinct NIST 800-53 controls are mapped across 14 of the 16 in-scope families; Media Protection (MP) and Physical & Environmental (PE) are currently unmapped."] |
| 9 | AT, MA, PS, PT are excluded from scope as "lower relevance" | [SITE: Heatmaps tab, scope bullet — "Excluded families (AT, MA, PS, PT) have lower relevance to agentic AI threat vectors"] |
| 10 | Upstream editions are pinned and dated (verified 2026-07-11) | [SITE: footer "PINNED UPSTREAM EDITIONS" — OWASP ASI 2026 / NIST SP 800-53 Rev 5 (OSCAL v1.5.0) / AI-RMF AI 100-1 v1.0, each "verified 2026-07-11"] |
| 11 | ASI01 carries an SR 11-7 governance instruction | [SITE: ASI01 detail — "Governance: treat as a Tier-1 model risk — board/CRO reporting, independent validation, and continuous monitoring under SR 11-7; escalate before deployment."] |
| 12 | A governance bridge maps risks to ISO 42001, EU AI Act, and SR 11-7 lifecycle | [SITE: ASI01 detail, "GOVERNANCE FRAMEWORK BRIDGE" panel — ISO/IEC 42001 A.6.2.4 / A.5.2; EU AI Act Art. 15 / Art. 14; SR 11-7 lifecycle "Ongoing Monitoring"] |
| 13 | That bridge is badged as unverified | [SITE: badge on that panel — "EDITORIAL V1 · VERIFY BEFORE USE"] |
| 14 | Controls expand to a description + agentic implementation guidance + related-ASI backlinks | [SITE: clicked "AC-6 Least Privilege" → "…limiting agent tool access to only necessary functions, restricting agent execution context permissions, and implementing time-bound or task-bound privilege elevation." + "Related ASI: ASI01, ASI03"] |
| 15 | ASI01 has the highest control exposure at 11 controls | [SITE: Heatmaps tab — "Highest control exposure: ASI01 Agent Goal Hijack — 11 mapped controls"; heatmap Exposure column reads 11] |
| 16 | Search does reverse control lookup: AU-12 → ASI01, ASI02, ASI10 | [SITE: header search box "Search for specific controls or standards…", typed AU-12 → "3 results found" → three result cards naming ASI01 / ASI02 / ASI10] |
| 17 | "Export brief" produces a timestamped, versioned, print-ready committee brief with per-block validation status and live citation URLs | [SITE: new tab "ASI01 risk brief — committee brief"; contains "Print / Save as PDF", "ASI01 risk brief · generated 2026-07-14T20:32:57.187Z", "VALIDATION STATUS: EDITORIAL" under each block, incident URLs, "PROVENANCE", "Crosswalk data version 0.9.0"] |
| 18 | Incident evidence includes EchoLeak CVE-2025-32711, Gemini calendar-invite injection (SafeBreach), AgentFlayer (Zenity Labs) | [SITE: hero "FEATURED INCIDENT" band + ASI01 "REAL-WORLD EVIDENCE" section] |
| 19 | The CSV export omits validation status, AI-RMF, data version, and date | [SITE: footer "Download CSV" → `agentic-crosswalk-v0.9.0.csv`, header row is exactly `asiId,asiName,severity,family,familyName,controlId,controlTitle,rationale,evidence`] |
| 20 | The JSON export *does* carry per-mapping validation status and dated upstream versions | [SITE: footer "Download JSON" → `agentic-crosswalk-v0.9.0.json`, contains `"validationStatus": "editorial"` per mapping and an `upstreamVersions` block with `"lastVerified": "2026-07-11"`] |
| 21 | The simulator emits weighted, quantitative outputs — 90%/80%/70% weights, "BROKEN CONTROLS 15", "ACTIVE CONTROLS 7 / 67 irrelevant" | [SITE: Scenario Simulator, Guided → "Generate Scenario" → scorecard + "Implicated ASI Risks (3)" with "Weight: 90%" (ASI08), "Weight: 80%" (ASI09), "Weight: 70%" (ASI06)] |
| 22 | The simulator carries no validation/editorial badge and no methodology statement | [SITE: absence — I read the full simulator panel text; the EDITORIAL badges and the validation-status legend appear only on the crosswalk detail view, not on any simulator output] |
| 23 | The simulator's AI vision feature is disabled in this deployment | [SITE: Architecture Analyzer — "AI vision analysis is unavailable in this deployment. Your image stays in the browser — select the patterns you see in your diagram manually below."] |
| 24 | The intended first action is a simulation, not the crosswalk | [SITE: onboarding modal — "Welcome to the Compliance Middleware." / "Let's run a quick simulation…" / buttons "Run First Simulation" and "Skip tutorial (I know my way around)"] |
| 25 | There is no multi-risk scoping or selection anywhere | [SITE: absence — no checkboxes or multi-select on Overview cards, heatmap rows, or detail view; `Export brief` is single-risk; CSV/JSON are all-ten] |
| 26 | The entire site accepts only three kinds of user input: a search string, an image upload, and a 3-way governance-posture radio | [SITE: absence — the only editable elements I found across all four tabs were the header search box ("Search for specific controls or standards…"), the Architecture Analyzer file upload ("Drag & drop an architecture diagram here"), and the Minimal/Standard/Full posture radios] |
| 27 | Data version is v0.9.0 | [SITE: footer "Export data (v0.9.0)"; brief footer "Crosswalk data version 0.9.0"] |
| 28 | Licensed AGPL-3.0; "All rights reserved for the hosted service" | [SITE: footer — "Licensed under AGPL-3.0"; "Copyright © 2026 haremantra. All rights reserved for the hosted service."] |
| — | SR 11-7 / OCC 2011-12 require independent validation, effective challenge, and a documented owner before a model is used; an unvalidated quantitative model in a risk pack is an examiner finding | **[PRIOR KNOWLEDGE — not from the site]** The site references SR 11-7 by name but never states what it requires. My judgement that the simulator would fail validation, and that a mapping needs a named reviewer to survive an exam, is entirely mine. |
| — | Excluding Awareness & Training (AT) and Personnel Security (PS) is the wrong call for ASI09 human-agent trust exploitation | **[PRIOR KNOWLEDGE — not from the site]** The site discloses the exclusion and its reason ("lower relevance"); the disagreement is mine. The site never says AT covers human over-trust. |
| — | Vendor spreadsheets loaded into GRC platforms become de-facto policy and this pattern draws MRAs | **[PRIOR KNOWLEDGE — not from the site]** Entirely from my own experience. The site says nothing about GRC platforms, Archer, or downstream use. |
| — | "MP-1 / MP-5" under the AI-RMF MAP function collide with 800-53's Media Protection family abbreviation | [SITE: ASI01 detail — the AI-RMF MAP block lists "MP-1 Context Establishment" and "MP-5 Impact Characterization", while the 800-53 heatmap column set includes an "MP" family] — **observation is from the site; my read that this is a collision risk when the two are exported side by side is [PRIOR KNOWLEDGE]** |
| — | A browser tab titled "AI Committee - agentic control scoping — committee brief" implies a named scoped-brief feature | **[NOT A SITE PIXEL]** — observed as a pre-existing browser tab title, about:blank, present before I navigated. I could not reach any such feature from the UI. Recorded as an anomaly, not as a finding about the site. |

---

## CONFIDENCE & GAPS

**Confidence I understood the tool's purpose: 4/5.** I am confident about what the *crosswalk* is for.
I am genuinely unsure what the *simulator* is for, and I don't think the site knows either — it is
branded "Scenario Simulator" in the nav, "Risk Engineering Platform" in its own heading, and it opens
with an "Architecture Analyzer" whose headline capability is switched off. Three names, one panel.

**When did the job-to-be-done become clear:** **T2.** Specifically, the moment I opened the ASI01
detail view and saw a rationale sentence attached to a control family ("Comprehensive logging of goal
state, tool sequences, and behavioral baselines enables detection of unauthorized goal drift") with
an EDITORIAL badge and three cited incidents underneath. That is when it went from "poster" to "this
is a first-draft control set with citations and an honest provenance label." T0 and T1 told me the
*topic*; T2 told me the *job*. T3 told me the job's limits.

Not T0 — the hero sells three numbers and a CVE, which reads like marketing. Not T1 — the tab labels
("Heatmaps", "Evidence Explorer", "Scenario Simulator") describe *mechanisms*, not outcomes, and the
onboarding modal actively points away from the thing that turns out to be the product.

**Still unsure of:**
- Who "haremantra" is, and what standing the author has. The site tells me the process was
  single-author and unreviewed; it never tells me *whose* judgement I'm reading.
- Whether the crosswalk is maintained. The upstream pinning is dated 2026-07-11 (three days before I
  looked), which is encouraging, but nothing tells me the cadence or what happens when OWASP revises
  the ASI list.
- What the simulator's weights and control-counts are derived from. No methodology is stated anywhere
  I could find.
- Whether "Reviewed" and "Validated" are aspirational states with a real pipeline behind them, or
  just empty buckets. The counters read 0 and 0.

---

## THE TWO EXTRA QUESTIONS

### 1. Is there any way to record MY institution's judgement — owner, reviewer, concur/challenge, sign-off?

**No. None. The only status shown is the site's own, and it is read-only.**

This is the finding I'd lead with. Across all four tabs, the *entire* site accepts exactly three
kinds of input: a **search box** ("Search for specific controls or standards…"), an **image upload**
("Drag & drop an architecture diagram here"), and a **three-way radio** (Minimal / Standard / Full
governance posture). There is not a single free-text field, name field, date field, checkbox, or
approve/reject control anywhere on the site.

The validation states *exist as a vocabulary* — the detail view defines EDITORIAL, REVIEWED,
VALIDATED, and offers a filter reading "All (8) / Editorial (8) / **Reviewed (0) / Validated (0)**".
But those are **counters, not controls.** "REVIEWED" is defined as "An external practitioner has
signed off on the mapping" — and there is no button on this site by which an external practitioner
could sign off. The states are the *author's* record of the author's own process. They are not a
workflow I can participate in.

Concretely: the "Export brief" committee PDF stamps "VALIDATION STATUS: EDITORIAL" under every single
control block, and has **no line for an owner, a reviewer, a challenge, a review date, or a firm
name**. It is generated, timestamped, and signed by nobody. So the artifact this tool hands me for my
committee is one that structurally cannot carry the one thing my committee exists to record.

That is the gap between this being a *reference* and this being a *tool*. Right now it is a reference.
For it to enter my workflow, three fields and a "concur / challenge / not-applicable" toggle per
mapping — persisted, exportable, and printed on the brief — would do it. That is the difference
between something I read and something I *use*.

### 2. What did I take "Editorial" to mean, and where did the site tell me?

The site told me, unusually clearly, in **four** places, and I want to give it credit for that because
almost nothing in this market does:

1. **Hero paragraph:** "Severity ratings … are editorially assigned based on OWASP ordinal risk
   ranking and are not official OWASP severity classifications."
2. **Hero confidence bar:** "EVIDENCE CONFIDENCE — 80 MAPPINGS · **100% Editorial** · 0% Reviewed ·
   0% Validated."
3. **Detail view, "MAPPING VALIDATION STATUS":** "**EDITORIAL** — Authored from public evidence +
   authoritative guidance; not yet externally reviewed." Contrasted explicitly against REVIEWED ("An
   external practitioner has signed off") and VALIDATED ("Corroborated by observed incident /
   exploitation evidence").
4. **Footer limitations:** "**Single-author provenance:** Mappings and rationales reflect a
   single-author editorial process; they have not undergone independent multi-reviewer validation."

**What I took it to mean, precisely:** *one informed person's reasoned opinion, sourced from public
material, that nobody else has checked.* Not wrong — the rationales are competent and the citations
are real. But it has **zero institutional weight**. In my language: it is **unvalidated**, it has had
**no effective challenge**, and it has **no accountable owner**. Under SR 11-7 that means it cannot
be a control, cannot be a conclusion, and cannot be a validation. It can only be an *input*.

**Would I put anything from this tool in front of an examiner? Yes — one thing, under one caveat.**

I would put the **crosswalk** in front of an examiner, as a **cited appendix to our own assessment**,
under this caveat, and I would say it out loud before they asked:

> "This is a published third-party crosswalk between the OWASP agentic-AI risk taxonomy and NIST
> 800-53 Rev 5. We used it as a **starting reference** to ensure we had not overlooked a control
> family. It is a single-author editorial mapping, which the publisher discloses on its face and
> which we have not relied upon as validation. **Every control in our agent control set was
> independently reviewed and signed off by [named owner] on [date]**; the crosswalk's own status for
> all mappings is 'Editorial,' meaning unreviewed, and we treat it accordingly. Where we departed
> from it — for example, we retained Awareness & Training, which the source excludes — the departure
> is documented."

Framed that way it *helps* me: it shows the examiner we surveyed the field and didn't invent our
control set in a vacuum. Unframed, it is a liability.

**What I would never put in front of an examiner: the Scenario Simulator output.** It produces
percentages (90% / 80% / 70%) and control counts ("15 broken, 7 active, 67 irrelevant") with no
stated methodology, no data lineage, no author, and — unlike the crosswalk — **no editorial badge at
all**. That is an unvalidated quantitative model wearing the same skin as the cited reference. If it
entered a risk pack, the exam question would be "validate this model," and I would have nothing to
hand over. **It should carry the same EDITORIAL badge the crosswalk mappings carry, and it does
not.** That inconsistency is, to me, the most serious design flaw on the site — the honest labelling
stops exactly where the numbers start.

---

## [REACHED FOR EXTERNAL HELP] EVENTS

**One, resisted.**

- **Trigger:** The hero bar's link "**How mappings are validated**", and the detail view's "**Read the
  validation model**", both point to `VALIDATION.md` on GitHub — *off the site*. I wanted that
  document badly: it is the methodology statement, and methodology is the whole question for me.
  Under the rules I did not follow it, and site-only I therefore never learned *how* a mapping gets
  from Editorial → Reviewed → Validated, or who would do it. **This is a real finding, not just a
  study artifact:** the tool's own account of its validation model lives outside the tool, on a
  developer platform my committee will not visit. The audience that most needs the methodology
  (second line, audit, examiners) is the audience least likely to click through to a GitHub markdown
  file. That belongs on the page.

No other external lookups. No repo, no search, no README. The CSV and JSON I inspected were artifacts
the site itself served me via its own "Download CSV" / "Download JSON" buttons.

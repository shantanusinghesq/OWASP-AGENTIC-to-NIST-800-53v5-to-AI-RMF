# R1 — The Inheriting Reviewer

**Participant profile:** Newly-hired GRC lead, mid-size regulated firm, six weeks in. Fluent in control frameworks, audit evidence, three-lines-of-defense, Archer/ServiceNow IRM, and the general concept of a crosswalk. Genuinely new to agentic AI — has heard "AI agents" in meetings, does not know OWASP's agentic list, does not know what prompt injection is.

**Prompt from director:** "Someone on the AI committee sent me this. Tell me what it is and whether we should be using it."

**Constraint:** the site is the only source. Every claim cites the on-screen element that produced it.

---

## T0 — FLASH (first paint, ~5 seconds)

**What is this?**
A reference/mapping site. There is a kicker above the title that says `COMPLIANCE MIDDLEWARE`, and the H1 is `Agentic AI Risks`. The subhead says it bridges `ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1`. So: something that translates a new AI risk list into the control frameworks I already use.

**Who is it for?**
Someone like me. It's speaking compliance, not engineering. "800-53 Rev 5" and "AI-RMF" are on the marquee — those are my words, not a developer's. Four stat tiles across the middle: `ASI RISKS 10`, `UNIQUE 800-53 CONTROLS 54`, `UNIQUE AI-RMF CATEGORIES 17`, `CRITICAL RISKS 4`. That's a coverage summary. That framing is aimed at a control owner or an assessor.

**Confidence: 4/5** that I know roughly what it is. Not 5, because I don't yet know whether it *does* anything or just displays something.

**What do I actually recall seeing?**
- Big title `Agentic AI Risks`, kicker `COMPLIANCE MIDDLEWARE`.
- Two buttons: `See the 4 Critical risks →` and `Explore the evidence`.
- A red-outlined box labelled `FEATURED INCIDENT · ASI01 AGENT GOAL HIJACK · CVE-2025-32711` about "EchoLeak … zero-click prompt-injection data exfiltration in Microsoft 365 Copilot", with a link `See how it maps to NIST controls →`.
- The four counter tiles.
- A bar labelled `EVIDENCE CONFIDENCE — 80 MAPPINGS` reading `100% Editorial · 0% Reviewed · 0% Validated`, with a link `How mappings are validated`.
- Tabs: `Overview | Heatmaps | Evidence Explorer | Scenario Simulator`.
- A sentence in the subhead I noticed and flagged mentally: severity ratings "are editorially assigned … and are not official OWASP severity classifications."

**Two things landed hard in five seconds, both in a good way.** First, `100% Editorial · 0% Reviewed · 0% Validated` — a tool that leads with its own weakness on the front page is doing something most vendors don't. I trusted it more, not less. Second, the disclaimer that severity is the author's judgement and not OWASP's. Whoever built this has been on the receiving end of an audit question.

**One thing I could not parse:** "Compliance Middleware." Middleware between *what and what*? I read it as marketing. [PRIOR KNOWLEDGE — not from the site: in my head "middleware" is a software integration layer, which set the wrong expectation — I briefly expected a connector product that plugs into a GRC platform. It isn't that, as far as I ever saw.]

---

## T1 — SCAN, NO CLICKING (60 seconds)

I loaded the URL. The first thing that happened was **not** the page in the T0 image. A modal took the screen:

> `Welcome to the Compliance Middleware.` — "AI agents don't just generate text—they take action. This platform bridges the gap between emerging agentic threats (OWASP) and established enterprise security frameworks (NIST). Let's run a quick simulation to see how a single AI failure impacts your compliance posture."
> Buttons: `Run First Simulation` / `Skip tutorial (I know my way around)`

Under the no-clicking rule I sat with it. Observations while stuck behind it:

- The modal's one-line thesis — "AI agents don't just generate text — they take action" — is, honestly, **the single most useful sentence on the entire site for someone in my position.** That is the whole reason my job changes. It's in a modal I'm being invited to dismiss.
- The second button, `Skip tutorial (I know my way around)`, presents a false choice. I *do* know my way around — around 800-53. I don't know my way around agentic AI. The label tempts exactly the wrong person (a confident GRC person) to skip the one screen that explains the premise.
- Behind the modal I could read the same hero as T0, plus the tab strip and, scrolling, the Overview list: `10 Agentic AI Risks`, "Ranked by severity," severity filter chips `All (10) / Critical (4) / High (5) / Medium-High (1)`, and ten cards. ASI01 `Agent Goal Hijack` (Critical), ASI03 `Identity & Privilege Abuse`, ASI08 `Cascading Failures`, ASI10 `Rogue Agents`, then ASI02 `Tool Misuse & Exploitation`, ASI04 `Supply Chain Vulnerabilities`, ASI05 `Unexpected Code Execution`, ASI06 `Memory & Context Poisoning`, ASI09 `Human-Agent Trust Exploitation`, ASI07 `Insecure Inter-Agent Comms`.
- Each card carries a count line: e.g. ASI01 `4 NIST families, 11 controls` and `4 AI-RMF functions, 8 categories`, plus an `Explore Mappings` button.
- Footer: `Licensed under AGPL-3.0`, `Terms of Service`, `Source Code`, `Export data (v0.9.0): Download JSON / Download CSV`, a collapsed accordion `Provenance & Limitations [Show]`, and a `Sources:` line pinning OWASP ASI 2026, NIST SP 800-53 Rev 5 (OSCAL v1.5.0), and NIST AI-RMF AI 100-1 v1.0.

**Restating the tool in my own words, after 60 seconds:**
It's a lookup table with a UI. Somebody took a new top-ten list of ways AI agents fail (called ASI, ten entries, from OWASP) and, for each one, wrote down which NIST 800-53 control families and which AI-RMF categories apply, plus why, plus real incidents. The site lets you browse that table four ways.

**What do I think I'm supposed to do first?** Honestly — not the simulation. My instinct is `Explore Mappings` on the Critical risks, because that's the artifact I'd be graded on. The site's instinct is that I should run a simulation. Those are different and the site wins, because it put its instinct in a modal in front of mine.

**Questions the page has not answered at 60 seconds:**
1. Who wrote these mappings, and what happens when OWASP changes the list? (`v0.9.0` in the footer tells me this is pre-1.0 and will move.)
2. `100% Editorial` — is that "not reviewed yet" or "will never be reviewed"? Reviewed *by whom* would make it count?
3. Is there an output I can hand to a committee, or is this a browsing toy?
4. What is `ASI`? The site uses the acronym constantly and never once expands it on any screen I saw. (`OWASP Top 10 for Agentic AI (ASI) 2026` in the footer is as close as it gets, and that still doesn't tell me what the three letters stand for.)
5. Nothing on screen says whether this covers *our* systems or is generic. I assume generic.

---

## T2 — FREE EXPLORATION (thinking aloud)

**Click path:** `Run First Simulation` → `Generate Scenario` → coach `Continue` → coach `Explore the Platform` → `Skip to end` (cascade timeline) → heatmap cell `ASI06 × SI (Broken)` → `Overview` tab → `Explore Mappings` on ASI01.

**Why I clicked `Run First Simulation`:** against my instinct. My director asked "what is it," and the modal promised to show me the point of the thing. If a product tells me where to start, I start there once. I can always leave.

**What happened:** it threw me into the `Scenario Simulator` tab, headed `Risk Engineering Platform` — "Generate scenarios, observe cascade failures, and analyze causal control relationships across the OWASP-NIST crosswalk." A coach mark appeared: `START HERE / Set the Parameters` — *"We've pre-selected a standard scenario: an Erroneous risk occurring in a Sequential agent chain. This is a common hallucination pattern."* Click Generate Scenario to proceed.

**First annoyance.** I clicked `Generate Scenario` and got **`Scenario #1 — Biased × Swarm`**. Risk Category `Biased`, Archetype `Swarm Architecture`. That is not the Erroneous-in-a-Sequential-chain the coach mark told me two seconds earlier had been "pre-selected" for me. The toggle above it says `Random | Guided` with Random active — so the tutorial is narrating a scripted scenario while the button rolls dice. Small thing. But my whole job is noticing when the label and the artifact disagree, and this is the first thing the product showed me. It cost real trust, this early.

**What the scenario gave me:** four tiles — `Risk Category: Biased (2 ASI risks implicated)`, `Archetype: Swarm Architecture (100 actions/hr ⚠ Exceeded)`, `Broken Controls: 9 (4 families affected)`, `Active Controls: 5 (75 irrelevant)`. A red banner: `SECURITY GAPS DETECTED — Security gaps detected in the following NIST families: SI, AU, PM, PL. These gaps could lead to biased incidents.` Then a `Cascade Failure Topology` node graph (Coordinator + Agents A–F), a `Dynamic Heatmap — Biased` (10 ASI rows × 16 family columns), and a right-hand `Control State` panel listing seven plain-English controls — `Agent Limits`, `Identity Management`, `Oversight Design`, `Dev Controls`, `Testing`, `Phased Deployment`, `Monitoring` — each tagged with the NIST families it stands for (`Monitoring → AU, IR, SI`), plus `Impact Profile` (Domain Error Tolerance: Low; Data Sensitivity: TradeSecret; Reversibility: Irreversible) and `Likelihood Profile` (Autonomy: Low; Task Complexity: Complex; External Exposure: High).

That `Control State` panel is the cleverest thing on the site and nobody told me it was there. Seven controls a non-engineer can actually reason about, each pinned to real 800-53 families. If somebody had led with *that* I'd have understood this product in ten seconds.

**Second annoyance, worse.** Coach step 3 of 3: `Track the Contagion` — *"You can see how an error originating in Agent A cascaded to compromise the security controls of Agent B and C."* I could not see that. The timeline underneath read `Step 0/6` and **every node in the diagram was blue, legend `Healthy`**. Nothing had cascaded. The tutorial was describing a state the screen was not in. I had to find `Skip to end` myself, and only then did the nodes turn red and say `FAILED`. A tutorial that asserts something the screen contradicts is worse than no tutorial — for sixty seconds I thought I was misreading the diagram.

**What made me sit up.** I clicked the red cell `ASI06 × SI` in the dynamic heatmap. A panel opened: `RISK CONTEXT — Memory & Context Poisoning`, then `WHY THIS FAILED — SWARM ARCHITECTURE` with a written narrative ("peer-to-peer communication bypassed the coordinator's System & Info Integrity enforcement. Agent B received a poisoned state from Agent A … creating multi-directional failure propagation that violated SI across the entire swarm topology"), then `BROKEN CONTROLS (2)`: **SI-4** and **SI-7**.

And here is the thing I noticed, because it is literally my job to notice it: **SI-4 and SI-7 are printed with word-for-word identical description text** — "Content scanning of memory writes, anomalous update frequency detection, and provenance verification." Two different control IDs, one rationale, copy-pasted. I parked that. It turned out to be the tell for something bigger (see T3).

**Where my instincts actually pulled me.** After about four minutes in the simulator I left it, and I want to be precise about why, because it's the finding. The simulator is *impressive*. It is also generating **random fact patterns about an imaginary company**. `Random | Guided`. `Scenario #1`. It is not looking at my firm, my agents, or my controls. As a GRC lead with a memo due, a randomised what-if about a fictional swarm of six agents is not evidence, it's a teaching aid — and I cannot put a teaching aid in front of a committee. So I went to `Overview` and clicked `Explore Mappings` on ASI01, which is where I should have started, and which is what the four tiles on the hero were pointing at the whole time.

**A note on what I didn't understand and the site never explained.** I still don't know what "prompt injection" *is*, mechanically, and the site says it constantly — the featured incident, the ASI01 rationale, the ASI02 description all use it as a known term. I inferred from ASI01's own card text — "Agents cannot reliably distinguish instructions from data" — that it means an attacker hides commands inside content the agent reads. That one sentence did more for me than anything else on the site, and it's a caption on a card, not an explainer. Nothing anywhere defined it outright.

---

## T3 — SELF-DIRECTED TASK

**My task, stated before attempting it:**
> "Produce a defensible one-pager I could hand to the AI committee: for the risks this thing rates Critical, which NIST 800-53 controls are in scope, what's the stated reason for each, is there any real-world evidence behind it, and how much do I trust the mapping? If I can't get that out of this in ten minutes, it's a bookmark, not a tool."

That is a scoping memo. It is exactly what my director actually wants under the words she used.

**Attempt.** On `Explore Mappings` for ASI01 I got the real product. Left column `NIST 800-53 Rev 5 Controls`, four family cards: `AC — Access Control` (AC-3 Access Enforcement, AC-4 Information Flow, AC-6 Least Privilege), `SI — System & Info Integrity` (SI-3, SI-5, SI-10), `AU — Audit & Accountability` (AU-2, AU-6, AU-12), `CM — Configuration Management` (CM-3, CM-5). Each family card carries a rationale line — e.g. `↳Input validation (SI-10) prevents prompt injection payloads from reaching goal-selection logic. SI-3 detects malicious instruction patterns.` Right column `NIST AI-RMF 100-1 Categories`: GOVERN (GV-1, GV-4), MAP (MP-1, MP-5), MEASURE (MS-1, MS-3), MANAGE (MG-1, MG-3), each with its own rationale. Every card carries an `Editorial` badge, and there's a filter `All (8) / Editorial (8) / Reviewed (0) / Validated (0)`.

Three things here that a compliance person notices immediately and values:

1. A `GOVERNANCE FRAMEWORK BRIDGE` strip: `ISO/IEC 42001 → A.6.2.4 Operation & monitoring, A.5.2 AI system impact assessment`; `EU AI Act → Art. 15 Accuracy, robustness & cybersecurity, Art. 14 Human oversight`; `SR 11-7 lifecycle → Ongoing Monitoring`. Stamped `Editorial v1 · verify before use`. That strip is worth more to me than the simulator, and it is a thin horizontal band I nearly scrolled past.
2. An ASI01 line I'd missed on the card: `Governance: treat as a Tier-1 model risk — board/CRO reporting, independent validation, and continuous monitoring under SR 11-7; escalate before deployment.` That is written in my language, by someone who has met a model risk committee.
3. `Real-World Evidence` — three live links: EchoLeak (CVE-2025-32711) at thehackernews.com, "Invitation Is All You Need" Gemini calendar-invite injection (SafeBreach), AgentFlayer ChatGPT Connectors 0-click (Zenity Labs). Named sources I can go read. That converts "some consultant thinks agents are risky" into "here are three things that already happened."

**Then I found the actual deliverable, by accident.** Each family card has a checkbox — `Include ASI01 AC in assessment`. I ticked AC and SI, and a tray slid up from the bottom: `2 selected · 6 controls · 2 families · 0 functions · 0 cats`, a name field, and two buttons: **`Committee brief`** and **`OSCAL (scoped)`**. Expanding it revealed per-row `Annotate` (fields: `OWNER`, `RACI`, `STATUS`, `NOTE`), `New / Clear / Save`, `Export JSON / Import JSON`, and a `COVERAGE GAPS PER SELECTED RISK` readout: `ASI01 — 25% covered (2/8 mapped areas). MISSING: 800-53 AU, 800-53 CM, AI-RMF GOVERN, AI-RMF MAP, AI-RMF MEASURE, AI-RMF MANAGE`.

I set Owner = "Platform Security", named the assessment, and hit `Committee brief`.

**It worked.** A clean print view opened in a new tab: `Agentic AI risk — committee brief`, my assessment name and a generation timestamp, `ASI01 Agent Goal Hijack [SEVERITY: CRITICAL]`, both control families with their individual controls, the rationale, `VALIDATION STATUS: EDITORIAL` printed on every card, my `Owner: Platform Security` annotation carried through, the three evidence links, and a `PROVENANCE` block pinning `OWASP Top 10 for Agentic AI (ASI) — 2026 (verified 2026-07-11)`, `NIST SP 800-53 — Rev 5 (OSCAL v1.5.0) (verified 2026-07-11)`, `NIST AI RMF — AI 100-1, v1.0 (verified 2026-07-11)`, plus `Crosswalk data version 0.9.0`. A `Print / Save as PDF` button top-right.

**Task: completed.** In under ten minutes I produced a document with a control list, a stated rationale, named evidence, an owner, a version stamp, a provenance block, and an honest confidence label printed on its face. **That is a finished output.** I have paid consultants five figures for less well-provenanced paper than this.

**Where I got stuck / what I checked next, because I'm suspicious by trade:**

**The OSCAL export.** I hit `OSCAL (scoped)`. It downloaded `assessment-…-oscal-v0.9.0.json`. The very first key in the file is:
```
"$schema-note": "OSCAL-aligned mapping (not a formal OSCAL model)"
```
Good — the file confesses. Read the button, though: `OSCAL (scoped)`, sitting next to a `Committee brief` button that produces a genuinely committee-ready artifact. A GRC lead in a hurry reads that button as "export to OSCAL," walks it to the platform team, and only then finds out it isn't an OSCAL model. The disclosure is honest and the label is not, and the label is what people act on.

The same file, though, contains the strongest trust signal on the whole site: each control carries `"catalogTitle"` (e.g. `AC-4 → "Information Flow Enforcement"`) and `"withdrawn": false`, against a pinned `oscalCatalog` `v1.5.0` retrieved `2026-07-11`. So the control IDs have been checked against the actual NIST catalog and flagged for withdrawal. Nobody ever told me that on screen — it's an internal field in a downloaded file. **That is the most audit-relevant fact the site produced and it is invisible in the UI.**

**And there's the catch I'd been circling.** In that JSON, `AC-3`, `AC-4`, and `AC-6` all carry the *same* rationale string — the one that only argues for AC-3 and AC-6. `AC-4 Information Flow Enforcement` gets a justification that never mentions it. Same for `SI-3 / SI-5 / SI-10`. So: **the rationale is written per-family, not per-control**, and then stamped onto every control in that family. That's the same defect I spotted in the simulator with SI-4/SI-7's identical text — one cause, two symptoms. It matters, and it matters in exactly one way: the hero tile boasts `89 total control mappings`, but the *reasoning* behind them is roughly 30-odd family-level arguments. An auditor who asks me "why is AC-4 in scope for goal hijack?" will not accept a paragraph about AC-3 and AC-6. That is the difference between this being a scoping input and being an assessment.

**Last stop — the footer accordion `Provenance & Limitations`,** which I nearly didn't open (and initially *couldn't*: the sticky assessment tray sits over the footer and swallowed my click until I collapsed it — with a saved assessment active, the tool physically blocks access to its own limitations disclosure). Inside is the best-written thing on the site, `KNOWN LIMITATIONS`, verbatim:
- `Severity ratings are editorial:` ASI severity ratings are this project's editorial judgement, not an official OWASP classification.
- `Control coverage:` 54 distinct NIST 800-53 controls are mapped across 14 of the 16 in-scope families; Media Protection (MP) and Physical & Environmental (PE) are currently unmapped.
- `AI-RMF coverage:` 17 of 19 AI-RMF subcategories are referenced; GV-3 (Workforce Diversity) and MS-4 (Measurement Effectiveness) are tracked but not yet mapped.
- `Single-author provenance:` Mappings and rationales reflect a single-author editorial process; they have not undergone independent multi-reviewer validation.
- `Evidence backfill in progress:` Evidence citations are being backfilled; some mappings cite illustrative incidents rather than an exhaustive evidence base.

Five bullets. Every question I wrote down at T1 is answered there. It is collapsed by default, at the bottom, behind a `Show` toggle, underneath a tray that intercepts the click. The single most credibility-building panel on the site is the hardest thing on the site to reach.

---

## T4 — THE MEMO

*(to my director, ~280 words)*

It's a crosswalk. Someone has taken OWASP's new top-ten list of ways AI agents fail — ten items, ASI01 to ASI10, things like "Agent Goal Hijack" and "Rogue Agents" — and mapped each one onto the NIST 800-53 Rev 5 control families and the NIST AI-RMF categories we already speak. 54 distinct 800-53 controls across 89 mappings. Each mapping has a written rationale, and most carry links to incidents that actually happened — the headline one is a zero-click data-exfiltration flaw in Microsoft 365 Copilot, CVE-2025-32711.

It's built for us, not for engineers. It even bridges to ISO 42001, the EU AI Act, and SR 11-7, and it will produce a print-ready committee brief with owner, rationale, evidence links, source provenance and a version stamp. I made one in ten minutes cold. That's the job it finishes: it turns "the AI committee is worried about agents" into a scoped, sourced control list you can put in front of people.

What it isn't: an assessment of us. It knows nothing about our systems. Every mapping is labelled "Editorial" — 0% reviewed, 0% validated — and the site's own limitations note says it's single-author work with no independent review. The rationales are also written per control *family*, then reused across every control in it, so the argument for AC-4 is really the argument for AC-3. Fine for scoping. Not defensible line-by-line under audit.

I'd use it to draft our agentic-AI risk taxonomy and to seed the control set for a first assessment — a week of work for an afternoon. I would never cite it as authority to a regulator, never import it into Archer as if it were validated, and never let its severity ratings stand in for our own. It's a very good starting point that is honest about being a starting point. Worth the bookmark. Not worth a budget line.

---

## CLAIM AUDIT

| # | Claim in memo | Source |
|---|---|---|
| 1 | It's a crosswalk between OWASP's agentic list, NIST 800-53 Rev 5, and NIST AI-RMF | `[SITE: hero subhead "Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1"]` |
| 2 | Ten items, ASI01–ASI10 | `[SITE: Overview heading "10 Agentic AI Risks"; ten cards ASI01…ASI10; tile "ASI RISKS 10"]` |
| 3 | OWASP is the origin of the list | `[SITE: footer "Sources: OWASP Top 10 for Agentic AI (ASI) 2026"]` |
| 4 | Includes "Agent Goal Hijack" and "Rogue Agents" | `[SITE: ASI01 and ASI10 card headings]` |
| 5 | 54 distinct 800-53 controls | `[SITE: hero tile "UNIQUE 800-53 CONTROLS 54"; footer Known Limitations "54 distinct NIST 800-53 controls are mapped"]` |
| 6 | 89 mappings | `[SITE: hero tile subtext "89 total control mappings across 10 ASI risks"]` |
| 7 | Each mapping has a written rationale | `[SITE: ASI01 detail, e.g. "↳Input validation (SI-10) prevents prompt injection payloads from reaching goal-selection logic."]` |
| 8 | Links to real incidents | `[SITE: "Real-World Evidence" list on ASI01 — EchoLeak/thehackernews, SafeBreach Gemini, Zenity AgentFlayer]` |
| 9 | Headline incident is a zero-click exfiltration in M365 Copilot, CVE-2025-32711 | `[SITE: "FEATURED INCIDENT · ASI01 AGENT GOAL HIJACK · CVE-2025-32711 — EchoLeak (CVE-2025-32711): zero-click prompt-injection data exfiltration in Microsoft 365 Copilot"]` — I have **not** verified this CVE independently; I am repeating the site |
| 10 | Bridges to ISO 42001, EU AI Act, SR 11-7 | `[SITE: "GOVERNANCE FRAMEWORK BRIDGE" strip on ASI01 detail — ISO/IEC 42001 A.6.2.4 & A.5.2; EU AI Act Art. 15 & Art. 14; SR 11-7 lifecycle: Ongoing Monitoring]` |
| 11 | Produces a print-ready committee brief with owner, rationale, evidence, provenance, version | `[SITE: `Committee brief` button in assessment tray → rendered brief with "Owner: Platform Security", "VALIDATION STATUS: EDITORIAL", evidence links, "PROVENANCE" block, "Crosswalk data version 0.9.0", "Print / Save as PDF"]` |
| 12 | I made one in ten minutes | `[SITE: performed in T3 — click path: Explore Mappings → 2 checkboxes → name field → Committee brief]` |
| 13 | Knows nothing about our systems | `[SITE: absence — no input for our environment anywhere; simulator inputs are `Random`/`Guided` generated fact patterns labelled "Scenario #1"]` |
| 14 | Every mapping labelled Editorial, 0% reviewed / 0% validated | `[SITE: hero bar "EVIDENCE CONFIDENCE — 80 MAPPINGS · 100% Editorial · 0% Reviewed · 0% Validated"; ASI01 filter "Editorial (8) / Reviewed (0) / Validated (0)"]` |
| 15 | Single-author, no independent review | `[SITE: footer Known Limitations — "Single-author provenance: Mappings and rationales reflect a single-author editorial process; they have not undergone independent multi-reviewer validation."]` |
| 16 | Rationales are per-family and reused across controls in that family | `[SITE: downloaded `OSCAL (scoped)` JSON — AC-3, AC-4, AC-6 carry byte-identical `rationale` strings; SI-3/SI-5/SI-10 likewise. Corroborated on-screen by the simulator's causal panel printing identical text for SI-4 and SI-7.]` |
| 17 | Severity ratings are the author's, not OWASP's | `[SITE: hero subhead "Severity ratings … are editorially assigned based on OWASP ordinal risk ranking and are not official OWASP severity classifications"; footer Known Limitations bullet 1]` |
| 18 | Two 800-53 families (MP, PE) are unmapped | `[SITE: footer Known Limitations — "14 of the 16 in-scope families; Media Protection (MP) and Physical & Environmental (PE) are currently unmapped"]` |
| 19 | The OSCAL export is not a formal OSCAL model | `[SITE: downloaded JSON, first key: "$schema-note": "OSCAL-aligned mapping (not a formal OSCAL model)"]` |
| 20 | Control IDs are checked against the pinned NIST OSCAL catalog v1.5.0 | `[SITE: downloaded JSON — `oscalCatalog.tag: v1.5.0`, `retrieved: 2026-07-11`, per-control `catalogTitle` and `withdrawn: false`]` |
| 21 | Pre-1.0 / will move | `[SITE: footer "Export data (v0.9.0)"; brief footer "Crosswalk data version 0.9.0"]` |
| 22 | Agents "take action," which is why this is different from ordinary AI risk | `[SITE: welcome modal — "AI agents don't just generate text—they take action."]` |
| — | What "prompt injection" means mechanically | `[PRIOR KNOWLEDGE — not from the site: the site never defines it. My working understanding came from ASI01's card text, "Agents cannot reliably distinguish instructions from data," which I extrapolated. I did not assert a definition in the memo.]` |
| — | What "ASI" stands for | `[NOT ON SITE — used as an unexpanded acronym everywhere; I still don't know.]` |
| — | That SI-4 and SI-7 are substantively different controls | `[PRIOR KNOWLEDGE — not from the site. What the SITE told me is narrower and is what I relied on: two distinct control IDs are printed with byte-identical description text, which is a defect regardless of what the controls are.]` |
| — | "Middleware" implies an integration layer | `[PRIOR KNOWLEDGE — misled me at T0; the site never claims to integrate with anything.]` |
| — | Archer / regulator / audit-defensibility framing in the memo | `[PRIOR KNOWLEDGE — my own professional judgement, not a site claim. The site does not tell you what not to use it for.]` |

---

## CONFIDENCE & GAPS

**Confidence I understood the tool's purpose: 4 / 5.**
I'm confident it's a crosswalk with a brief-generator bolted on, and I'm confident about what it will and won't stand up to. The missing point is that I still cannot tell you what the *Scenario Simulator* is for, in the sense of who commissions it and what decision it changes. It's the tab the product pushes hardest — the welcome modal routes you there before anything else — and it's the one I'd cut from my memo entirely. Either it's load-bearing and the site failed to tell me why, or it isn't and it's front-and-centre anyway. I'd want to ask the author which.

**Still unsure of:**
- Whether "Editorial" is a stage the project intends to leave (`Reviewed (0)`, `Validated (0)` are shown as *empty buckets*, which implies a roadmap the site never states) or a permanent condition. This decides whether we revisit in six months.
- Who the author is. `Copyright © 2026 shantanusinghesq` is the only name on the site, and "single-author editorial process" is a limitation I'd need to put a human being's credentials behind before I cite this to anyone.
- Whether the mappings are complete enough to survive a real audit challenge on *any* single control, given the per-family rationale issue.
- What happens to my saved assessment. It has `Save`, `Export JSON`, `Import JSON` and no sign of a server — I assume browser-local, and I would not trust my only copy of a committee input to a browser cache. The site never says where it lives.

**The penny drop: T3, and it dropped twice.**

The *first* drop was the moment the assessment tray slid up after I ticked two checkboxes — `2 selected · 6 controls · 2 families`, `Committee brief`, `OSCAL (scoped)`. Until that instant I had this filed as a reference site: something you *read*. That tray reframed the whole product as something you *use to produce a thing*, and every element I'd already walked past — the checkboxes on every family card, the `Export brief` and `Copy link` buttons in the ASI01 header — snapped into place as one coherent workflow I had been looking straight through for fifteen minutes. Nothing invited me into it. I found the product's actual purpose by idly clicking a checkbox.

The *second* drop was reading the downloaded OSCAL JSON and seeing the same rationale string repeated across AC-3, AC-4 and AC-6 — which retroactively explained the duplicate SI-4/SI-7 text I'd shrugged at back in T2. That's when I stopped thinking of this as "a crosswalk with 89 mappings" and started thinking of it as "a crosswalk with ~30 arguments, applied at family resolution." That single reframing is the difference between the memo I wrote and a much more enthusiastic one — and I only got there because I opened a downloaded file. A reviewer who stayed in the UI would not have found it.

**Both drops came late, and both came from things the site does not surface.** The order the site *offered* me — modal → simulator → cascade animation — is close to the reverse of the order that produced understanding. The order that worked was: Overview → Explore Mappings → tick a box → committee brief → footer limitations. The best material on the site (the `Control State` seven-control panel, the governance-bridge strip, the `KNOWN LIMITATIONS` block, the catalog-verified control titles) is either buried, collapsed, or invisible.

**Would I have bounced?** Close. If I'd hit `Skip tutorial`, landed on the Overview, skimmed ten cards and a heatmap, I'd have filed it as "nice reference, no output" and closed the tab in four minutes — and my memo would have been two sentences and wrong. The thing that saved it was a checkbox I clicked out of idleness. That's too much load-bearing weight on an accident.

**Bluntest thing I can say to the author:** the site earned my trust twice — once with `100% Editorial · 0% Reviewed` in the hero, once with the five-bullet `KNOWN LIMITATIONS` block — and both times it was through *admitting a weakness*. Then it spent that trust on a tutorial that told me it had pre-selected a scenario it hadn't, and described a cascade that hadn't happened yet. Fix the tutorial's two lies before you build anything new. In my line of work, a tool that misdescribes its own screen is a tool I have to check twice, and one I have to check twice is one I don't use.

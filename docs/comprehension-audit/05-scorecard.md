---
status: scored
scored_at: 2026-07-14
scorer: blind to the live site; worked only from 00-sealed-key.md + r1–r4 transcripts
target: live GitHub Pages build, crosswalk data v0.9.0
---

# 05 — SCORECARD · Comprehension Audit

**Scorer's declaration.** I have not visited the site and did not look at the application source
beyond what the sealed key quotes. Every adjudication below is made from the sealed key and the four
transcripts. Where the key and a transcript disagree about what exists on screen, I say which I
believe and why.

**Scoring rule applied without exception:** *only site-sourced claims earn points.* A reader who
"understood" something from knowledge they walked in with earns nothing for the site. I re-tagged
claims where I judged the evaluator's own tagging to be wrong; those re-tags are in §5.

---

## 1. SCORECARD

**Scale:** 0 = absent · 1 = wrong · 2 = partial · 3 = matches the key.

### Summary

| Role | D1 Cat | D2 Use | D3 **JTBD** | D4 User | D5 Diff | D6 Bound | D7 Trust | D8 First | **Total** |
|---|---|---|---|---|---|---|---|---|---|
| **R1** Inheriting reviewer — T2 | 2 | 2 | 2 | 2 | 2 | 2 | 3 | 2 | **17/24** |
| **R1** — T4 | 3 | 3 | **3** | 3 | 3 | 3 | 3 | 3 | **24/24** |
| **R2** Agentic engineer — T2 | 2 | 3 | 2 | 2 | 1 | 2 | 3 | 2 | **17/24** |
| **R2** — T4 | 2 | 3 | **3** | 2 | 2 | 2 | 3 | 3 | **20/24** |
| **R3** Executive skimmer — T2 (=90s) | 3 | 3 | 2 | 3 | 3 | 2 | 3 | 2 | **21/24** |
| **R3** — T4 | 3 | 3 | **2** | 3 | 3 | 2 | 3 | 2 | **21/24** |
| **R4** Model-risk manager — T2 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | 2 | **22/24** |
| **R4** — T4 | 3 | 3 | **1** ↓ | 3 | 3 | 3 | 3 | 2 | **21/24** |

**The shape to look at is not the totals. It is the D3 column and the R4 row.**
R4 is the *highest-scoring reader at T2* and the *only reader whose score falls*, and it falls on the
one dimension the product was rebuilt to serve. R1 starts lowest and finishes at 24/24 — because R1
idly clicked a checkbox.

---

### R1 — The Inheriting Reviewer (new GRC lead, agentic-naive)

| D | T2 | T4 | Justification (quoted) |
|---|---|---|---|
| **D1 Category** | 2 | 3 | **T2:** *"It's a lookup table with a UI… The site lets you browse that table four ways."* Correct genre, but R1 does not yet know it *does* anything (T0: *"Not 5, because I don't yet know whether it does anything or just displays something."*). Category word failed outright: *"'Compliance Middleware.' Middleware between what and what? I read it as marketing."* **T4:** *"It's a crosswalk… it will produce a print-ready committee brief"* + AGPL + *"What it isn't: an assessment of us."* Matches K1 incl. the not-a-scanner boundary. |
| **D2 Use case** | 2 | 3 | **T2:** *"Explore Mappings on the Critical risks, because that's the artifact I'd be graded on"* — right domain, unelaborated. **T4:** *"it turns 'the AI committee is worried about agents' into a scoped, sourced control list you can put in front of people"* + *"I'd use it to draft our agentic-AI risk taxonomy and to seed the control set for a first assessment — a week of work for an afternoon."* That is K2's core claim verbatim in the reader's own words. |
| **D3 JTBD** | 2 | **3** | **T2:** PARTIAL — R1's own words: *"Until that instant I had this filed as a reference site: something you read."* At T1 the JTBD is an open question: *"Is there an output I can hand to a committee, or is this a browsing toy?"* **T4:** full K3. R1 reached **all five jobs**: selection (*"Each family card has a checkbox — 'Include ASI01 AC in assessment'"*), annotation (*"per-row Annotate (fields: OWNER, RACI, STATUS, NOTE)"*), committee brief (*"my Owner: Platform Security annotation carried through"*), gap analysis (*"ASI01 — 25% covered (2/8 mapped areas). MISSING: …"*), GRC feed (*"OSCAL (scoped) … downloaded"*). **Only reader in the study to complete the whole loop.** |
| **D4 User** | 2 | 3 | **T2:** *"Someone like me. It's speaking compliance, not engineering. '800-53 Rev 5' and 'AI-RMF' are on the marquee — those are my words, not a developer's."* Site-sourced (marquee + coverage tiles). **T4:** *"It's built for us, not for engineers. It even bridges to ISO 42001, the EU AI Act, and SR 11-7"* — lands the sharp K4 persona from on-screen pixels (governance bridge, SR 11-7 line). |
| **D5 Differentiator** | 2 | 3 | **T2:** honesty registered, receipts not yet argued. **T4:** *"most carry links to incidents that actually happened… CVE-2025-32711"* + the catalog check found in the served OSCAL file (*"each control carries catalogTitle … and withdrawn: false, against a pinned oscalCatalog v1.5.0"*) + *"I have paid consultants five figures for less well-provenanced paper than this."* K5 items 1, 2 and 3. Note R1 also states the key's own G5 finding: this is never argued on screen — *"the most audit-relevant fact the site produced and it is invisible in the UI."* |
| **D6 Boundary** | 2 | 3 | **T2:** editorial severity + 100% Editorial, from the hero, in 5 seconds. **T4:** enumerates K6.1, .3, .6, .7, .8, .9, .10 verbatim from the KNOWN LIMITATIONS block and the `$schema-note` in the downloaded file. Formed **no inversion**. Did not reach K6.5 (counterfactual) — neither asserted nor denied. |
| **D7 Trust** | 3 | 3 | **T0:** *"a tool that leads with its own weakness on the front page is doing something most vendors don't. I trusted it more, not less."* Correct at first paint, sustained: *"Every mapping is labelled 'Editorial' — 0% reviewed, 0% validated."* Open question flagged honestly: *"is that 'not reviewed yet' or 'will never be reviewed'?"* — the site does not answer it. |
| **D8 First action** | 2 | 3 | **T2:** R1 obeyed the site (*"If a product tells me where to start, I start there once"*) and the site took them to a tutorial that misdescribed its own screen. R1 exited the simulator on **professional instinct, not site guidance** — so the site earns partial credit only. **T4:** correct diagnosis of both live answers: *"The order the site offered me — modal → simulator → cascade animation — is close to the reverse of the order that produced understanding."* |

---

### R2 — The Agentic Engineer (governance-naive)

| D | T2 | T4 | Justification (quoted) |
|---|---|---|---|
| **D1 Category** | 2 | 2 | **T2:** *"A mapping table between an OWASP agentic-risk list and some NIST paperwork."* Correct genre; *"Confidence I know what it is: 3/5. I know its genre. I don't know what it does."* **T4:** *"a lookup table from the OWASP agentic top-10 to NIST control IDs"* + the brief. **Held at 2** — R2 never registered *free / open-source / client-side / the data package is the product*. R2 mentions no licence, no export-is-the-point, no "nothing leaves your browser." The K1 category term was received only as a red flag: *"My stomach dropped slightly. 'Middleware' for compliance is a phrase I associate with a vendor pitch."* |
| **D2 Use case** | 3 | 3 | **T1, unaided:** *"It is a translation layer from 'my agent got prompt-injected' into 'AC-6, SI-10' so that someone can put it in a document."* That is K2. **T4:** *"That's the twice-a-year spreadsheet, done, in 60 seconds. So: bookmark it for the next time legal asks."* |
| **D3 JTBD** | 2 | **3** | **T2:** unresolved — T1's open question *"What is the artifact I leave with?"* is still open at the end of T2. **T3/T4:** *"The one thing it genuinely finishes: tick the families you care about and it prints a 'committee brief' PDF — controls, rationale, real CVE links, provenance dates."* And the key's own thesis restated: *"It is a machine for producing a defensible document about your agent. It is not a machine for producing a safer agent."* Scored 3 — the "walk out with a deliverable" reframe landed unambiguously. **Missed 2 of the 5 jobs**: never found the annotation fields, the gap summary, or the meaning of the scoped OSCAL (*"I don't know what consumes it"*). |
| **D4 User** | 2 | 2 | *"Whoever has to fill in the spreadsheet. Not me."* / *"it is written for the compliance person, to explain agents to them."* Right department, from the right pixels (COMPLIANCE kicker; modal copy). But R2 never reaches a governance/risk role and drifts to the wrong one in T4: *"bookmark it for the next time **legal** asks."* Legal is not the K4 audience. |
| **D5 Differentiator** | 1 | 2 | **T2 = 1 (misidentified).** R2 names the *teaching* value as the payoff — *"CM-3 … That is the first moment the site paid for itself"* — which is not K5. The actual moat did not transmit: R2's own honest tag, claim 15, *"I recognized all three [incidents] from my own reading before I opened this site. **The site did NOT teach me these.**"* **T4 = 2:** R2 registers that the receipts travel *with the artifact* (*"real CVE links, provenance dates"*) but frames the advantage as **speed**, not citability. R2 never articulates why a receipt beats an LLM's answer — the exact gap the key logs as G5. |
| **D6 Boundary** | 2 | 2 | Got K6.1, K6.3, K6.7, and v0.9.0. Never learned what OSCAL is, so K6.6 never registered. **No inversion formed** — but see the Misconception Log: R2 is the only reader who caught the SI-10 contradiction, and did so entirely on prior knowledge. |
| **D7 Trust** | 3 | 3 | **T0:** *"A tool that tells me up front that nobody has checked its own work is either very honest or very unfinished."* Correct. **T4:** *"nobody has checked this. Credit for saying so, but that's a v0.9 disclaimer."* Also produced the study's sharpest second-order observation: *"the site's transparency about its own weakness is what sent me looking for the exit"* (went to verify the CVE). |
| **D8 First action** | 2 | 3 | **T2:** *"There are three competing first-moves and no reason given to prefer any."* R2 found the productive door by reflex (`Skip tutorial` → EchoLeak banner), which is K7's *intended* path — and confirms the deep-link works: *"the featured incident is a route into the data, not decoration."* **T4:** names both live answers correctly, incl. the shipped one: *"60/40 that I bounce at T1, at the modal."* |

---

### R3 — The Executive Skimmer (90-second triage)

R3 declined T2 (*"T1 settled it"*), so T2 and T4 are scored from the same 90-second evidence base.
**This is not a defect in R3 — it is the finding: 21/24 with zero clicks into the product.**

| D | T2 | T4 | Justification (quoted) |
|---|---|---|---|
| **D1 Category** | 3 | 3 | *"A free, open-source, browser-based reference crosswalk."* From the hero + footer alone. R3 also correctly rejects the site's own category word rather than being captured by it: *"this is a static reference map, not middleware. That word cost the page a point of clarity."* R3 tagged the "middleware = runtime path" reading as PRIOR and corrected it. |
| **D2 Use case** | 3 | 3 | **T0:** *"Somebody who has to answer 'which of our existing controls already cover AI agent risk?'"* **T4:** *"Its whole value proposition is **reuse**: you already have controls; here's which ones already apply."* Sourced from the card count lines — R3 names the pixel: *"The count line is the tell."* |
| **D3 JTBD** | **2** | **2** | PARTIAL and it never moves. *"It converts 'we have no AI-agent control framework' into 'here is a defensible first-draft mapping… exportable into whatever we track controls in.' It finishes the **blank-page** problem. It does not finish the **assurance** problem."* Right domain, right verb — but R3's "deliverable" is the **footer's all-ten CSV**, not the scoped Assessment. R3 never saw the tray, the brief, or the annotation layer. **Note also an unsourced element: "and a gap list."** R3 never clicked; the GapSummary is inside the tray. That phrase is untagged in R3's claim audit and I re-tag it as inference (see §5). |
| **D4 User** | 3 | 3 | *"A GRC / compliance / control-owner audience… It is **not** for a CISO, not for an engineer, not for a red-teamer."* Correct against the v0.9.0 persona; forwards to *"the Director of GRC / Risk."* Note this **contradicts the README's stated audience** (which leads with CISOs and red-team leads) — the key records that contradiction as G3, so R3 is not penalised. Partially prior-knowledge-assisted (see §5). |
| **D5 Differentiator** | 3 | 3 | Both K5 pillars, from the hero, in 90 seconds. *"The named CVE is the credibility anchor… Abstract framework crosswalks are a dime a dozen; one that opens by pointing at a shipped exploit in Microsoft 365 is not."* And: *"The confidence bar is a trust **builder**, not a trust cost… It cost the tool authority and bought it credibility."* |
| **D6 Boundary** | 2 | 2 | Three correct disclaims from the hero + footer (K6.1, K6.3, and pre-1.0). But: *"I did not open PROVENANCE & LIMITATIONS… **I never found out what's in it.**"* The single richest boundary surface on the site was never reached by the reader who was triaging on credibility. R3's verdict is the indictment: *"That is a placement failure, not a content failure."* |
| **D7 Trust** | 3 | 3 | *"It does not claim its mappings have been reviewed by anyone."* Perfect read, and the trust bar drove the decision: *"That disclosure is the reason I don't drop it."* |
| **D8 First action** | 2 | 2 | R3 correctly identifies the shipped first action and its cost: *"I pressed **Escape — it did not close.**… For a link on a 90-second clock, a non-dismissible interstitial is a bounce trigger… **A colder reader dies here.**"* But the *intended* first action never registered: **R3's unprompted T0 recall does not contain either hero CTA.** R3 never mentions "See the 4 Critical risks →" or "Explore the evidence" anywhere in the transcript. |

---

### R4 — The Second-Line Model-Risk Manager (**the calibration baseline**)

| D | T2 | T4 | Justification (quoted) |
|---|---|---|---|
| **D1 Category** | 3 | 3 | **T1:** *"It is a pre-built, opinionated crosswalk… a starting control set for agents, with citations."* **T4:** *"It's not a platform, whatever the header says. It's a **crosswalk**."* Correct against K1, including the rejection of the site's own "middleware" framing. |
| **D2 Use case** | 3 | 3 | **T4:** *"it **kills the blank page.** It gets you from 'we have no control set for agents' to a defensible first draft with citations, in an afternoon instead of a fortnight."* And R4 independently reconstructs K2's *killer use case* — the examiner script — in full, unprompted: *"This is a published third-party crosswalk… We used it as a starting reference… the crosswalk's own status for all mappings is 'Editorial'…"* Best D2 in the study. |
| **D3 JTBD** | 2 | **1** ↓ | **This is the study's central finding. See §4, entries C1 and C2.** **T2 = 2 (partial):** R4 reaches the crosswalk-as-first-draft-control-set and a real deliverable (the per-risk `Export brief`), but the JTBD's machinery is still an open question at T1: *"Whether I can record my own firm's view on any of it."* **T4 = 1 (wrong):** R4 closes that open question with a **false negative**, in the strongest available terms, four separate times: <br>· *"**There is no scoping.** I could not find any way to say 'these five, not those ten.' **No checkbox, no multi-select, no basket, no 'add to assessment.'** I checked the Overview cards, the heatmap rows, and the detail view."* <br>· *"**No. None. The only status shown is the site's own, and it is read-only.**"* <br>· *"There is **not a single free-text field, name field, date field, checkbox, or approve/reject control anywhere on the site**."* <br>· *"the artifact this tool hands me for my committee is one that **structurally cannot carry** the one thing my committee exists to record."* <br>All four are **false**. R1 ticked the checkbox on the family card ("Include ASI01 AC in assessment"), named the assessment, set `OWNER = Platform Security`, and it printed on the brief. R2 did the same in 60 seconds. The key grounds every one of these surfaces in shipped code (K3(b): `AssessmentTray.tsx`, `SelectToggle`, `GapSummary.tsx`, `BriefExport.tsx:46`, `scopeOscalMapping`). **Scored 1, not 2, because R4 did not merely fail to find the deliverable engine — R4 affirmatively denied its existence and made the denial the lead finding of the report.** |
| **D4 User** | 3 | 3 | **T2:** *"Somebody has thought about my reader, not just the engineer's"* — triggered by the on-screen SR 11-7 governance line and the ISO 42001 / EU AI Act bridge. The v0.9.0 persona targeting **worked**: the reader it was built for recognised itself, from pixels. |
| **D5 Differentiator** | 3 | 3 | All three K5 pillars, and R4 went to the provenance panel **first, deliberately** — *"This is the section that decides whether the rest is worth my time, and it is genuinely good."* Names pinned editions with verified dates, the incident citations with live URLs, and the uniqueness claim: *"it's the only place I've seen the agentic risks mapped back to SR 11-7 lifecycle stages and ISO 42001 in the same view."* Best D5 in the study. |
| **D6 Boundary** | 3 | 3 | The most complete boundary reading in the study: K6.1, .2, .3, .7, .9, .10, .11, plus the excluded families (AT/MA/PS/PT), plus two boundaries **the site does not state on screen** and R4 derived unaided — the simulator's missing editorial badge (key G7) and the CSV's dropped `validationStatus` column. *"an unvalidated quantitative model wearing the same skin as the cited reference."* |
| **D7 Trust** | 3 | 3 | Definitive. R4 lists the **four** places the site says it and defines Editorial exactly as the key does: *"one informed person's reasoned opinion, sourced from public material, that nobody else has checked… it is **unvalidated**, it has had **no effective challenge**, and it has **no accountable owner**."* This is what a correct reading of K6.3 sounds like. |
| **D8 First action** | 2 | 2 | R4 correctly names the shipped door and rejects it — *"the onboarding modal actively points **away** from the thing that turns out to be the product"* — but the **intended** door never registered as a door. R4 read the hero's Featured Incident band, K7's designated worked-example front entrance, as **decoration**: *"the hero sells three numbers and a CVE, which reads like **marketing**."* R4's productive path (footer → provenance panel) is one the site never suggests. |

---

## 2. COMPREHENSION CURVE

| Role | Penny dropped | Trigger | Site's role |
|---|---|---|---|
| **R1** | **T3, twice** | (1) *"the moment the assessment tray slid up after I ticked two checkboxes."* (2) Opening the downloaded OSCAL JSON and seeing one rationale string across AC-3/AC-4/AC-6. | **None.** R1: *"Nothing invited me into it. I found the product's actual purpose by **idly clicking a checkbox**."* And: *"I only got there because I opened a downloaded file. A reviewer who stayed in the UI would not have found it."* |
| **R2** | **T2, at the AC-6 expander** | *"For agentic AI systems, this includes limiting agent tool access… time-bound or task-bound privilege elevation."* → *"Before that sentence, 'AC-6' was a serial number… After it, I understood the site as a dictionary between two vocabularies I already half-speak."* Second, smaller drop at T3 on the architecture-pattern dropdown. | **Marginal.** *"It dropped on a click-to-expand affordance that does not look clickable, on the third screen in, and only because a dismissible reading-guide told me it was there. **If I had dismissed that guide I would have bounced.**"* R2's *JTBD* drop came later still, at T3, from the same accidental checkbox as R1. |
| **R3** | **T0/T1 — the hero** | *"Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1"* + the trust bar + the CVE band. *"I could write that line **from the hero alone**. That's the test, and it passes."* | **Total success — for D1/D2/D4/D5/D7.** And **total failure for D3**: the JTBD is not on the hero (key G2), so the reader who never scrolls past it never gets it. R3's D3 is frozen at 2 forever. |
| **R4** | **Never, on K3's actual JTBD.** R4 *believes* it dropped at T2. | R4's stated drop: *"the moment I opened the ASI01 detail view and saw a rationale sentence attached to a control family… with an EDITORIAL badge and three cited incidents underneath."* That is the *crosswalk*, not the deliverable. On K3's real JTBD, R4's curve is **negative**: an open question at T1 (*"Whether I can record my own firm's view on any of it"*) hardened into a confident false negative at T3 and a lead finding at T4. | **Actively negative.** More exploration produced *more* wrong belief. This is the only inverted curve in the study. |

### Cross-role pattern

1. **The honesty layer is the only thing that transmits universally.** 4/4 clocked *"100% Editorial · 0% Reviewed · 0% Validated"* **within five seconds**, 4/4 read it correctly, and **4/4 said it increased their trust**. D7 = 3 for every role at every stage. Nothing else in this study scores like that. It is the site's one unqualified transmission success and it should not be touched.
2. **The penny drops on whatever surface the reader stumbles into, and never on the one the site prescribes.** The prescribed sequence (modal → Run First Simulation → guided tour) produced comprehension in **zero of four** readers. The one reader who obeyed it (R1) lost four minutes to a tutorial that misdescribed its own screen and then left on instinct.
3. **The three readers who understood the product got there by three different accidents**: an idle checkbox (R1), a dismissible reading-guide sentence (R2), a habit of reading the footer first (R4). None of these paths is designed.
4. **Depth of engagement is inversely correlated with accuracy about the JTBD.** R3 (90 seconds, zero clicks): D3 = 2. R4 (one hour, four tabs, two file downloads): D3 = 1. The site rewards skimming and punishes searching, because searching for the Assessment Tray returns proof of its absence.
5. **The category word failed 4/4.** Nobody parsed "Compliance Middleware." Two readers were actively misled by it (R1: *"I briefly expected a connector product"*; R3: *"my GRC lead would have opened it expecting to install something"*), one read it as a vendor tell (R2), one rejected it (R4). The site's own chosen name for its own category transmitted to nobody.

---

## 3. DIVERGENCE CLASSES

| Role | Class | Verbatim JTBD statement |
|---|---|---|
| **R1** | **MATCH** | *"That's the job it finishes: it turns 'the AI committee is worried about agents' into a scoped, sourced control list you can put in front of people."* — and R1 executed all five of K3's jobs, including annotation and scoped OSCAL. |
| **R2** | **MATCH (narrow)** | *"The one thing it genuinely finishes: tick the families you care about and it prints a 'committee brief' PDF — controls, rationale, real CVE links, provenance dates. That's the twice-a-year spreadsheet, done, in 60 seconds."* — reaches the deliverable; never reaches annotation, gap analysis, or the meaning of the OSCAL export. |
| **R3** | **PARTIAL** | *"It converts 'we have no AI-agent control framework' into 'here is a defensible first-draft mapping onto the framework we already have, with 80 candidate mappings and a gap list, exportable into whatever we track controls in.' It finishes the **blank-page** problem. It does not finish the **assurance** problem."* — right domain, right verb, wrong artifact (the all-ten CSV, not the scoped Assessment). |
| **R4** | **PARTIAL — with a FALSE-NEGATIVE core** | *"The job it actually finishes: **it kills the blank page.**"* … immediately contradicted by *"**There is no scoping.**"* and *"**No. None. The only status shown is the site's own, and it is read-only.**"* |

**A note on the taxonomy.** R4's error has no home in the four classes supplied. It is not an INVERSION (R4 does not believe something the site disclaims), not DRIFT (R4 did not invent an adjacent product), and calling it PARTIAL flatters it — PARTIAL means "stops at read the map," and R4 did not merely stop, R4 **searched for the deliverable engine, failed to find it, and published its non-existence**. I therefore log a fifth class and recommend the instrument adopt it:

> **FALSE-NEGATIVE** — the reader looked for a shipped capability, could not find it, and asserted its absence as a property of the artifact.

A false negative is more dangerous than a partial, because a partial reader is merely under-informed and can be sold; a false-negative reader is **confidently misinformed and will tell others**. R4 did: *"For it to enter my workflow, three fields and a 'concur / challenge / not-applicable' toggle per mapping — persisted, exportable, and printed on the brief — would do it."* That is a feature request for a feature that shipped in v0.9.0.

---

## 4. MISCONCEPTION LOG

*Every wrong or absent belief any reader formed, ranked by severity. Site-caused unless stated.*

### CRITICAL

**C1 — "There is no scoping, no multi-select, no annotation, no way to record my institution's judgement."**
- **Belief (verbatim, R4):** *"There is no scoping. I could not find any way to say 'these five, not those ten.' No checkbox, no multi-select, no basket, no 'add to assessment.' I checked the Overview cards, the heatmap rows, and the detail view."* / *"**No. None. The only status shown is the site's own, and it is read-only.**"* / *"There is not a single free-text field, name field, date field, checkbox, or approve/reject control anywhere on the site."*
- **Reader:** R4 — **the persona the product was rebuilt for.**
- **Truth:** FALSE on every count. R1: *"Each family card has a checkbox — 'Include ASI01 AC in assessment'. I ticked AC and SI, and a tray slid up… per-row `Annotate` (fields: OWNER, RACI, STATUS, NOTE), `New / Clear / Save`, `Export JSON / Import JSON`, and a `COVERAGE GAPS PER SELECTED RISK` readout."* R2 reproduced it in 60 seconds. The key grounds all of it in shipped code (K3(b)).
- **What on screen caused it:** two things, compounding. (i) The `SelectToggle` is a bare checkbox on a family card labelled *"Include ASI01 AC in assessment"* — it reads as a display filter, not as the entrance to a workflow, and a governance reader scanning for a *basket / add-to-cart / add-to-assessment* pattern will not recognise it. (ii) **The Assessment Tray renders nothing until a mapping is already ticked** (key K3: `AssessmentTray.tsx:57-60`, *"Untouched assessment → no tray"*). **A reader searching for the feature therefore finds affirmative evidence that it does not exist.** R4 checked three surfaces and the site showed them three empty rooms.
- **Severity: CRITICAL.** The target user spent an hour, concluded the flagship v0.9.0 capability does not exist, told a peer so in writing, and then specified it as a roadmap item.
- **Surface that must change:** the tray needs a **persistent empty state** — a standing bar reading e.g. *"0 selected · tick a mapping to build an assessment → Committee brief · OSCAL"* — visible before the first click. The checkbox needs a verb (*"Add to assessment"*). The reading primer and hero need one sentence naming the workflow. This is the key's own G2 ("the job-to-be-done is never stated on screen"), now confirmed to produce a false belief in the exact reader it was written for.

**C2 — "The committee brief structurally cannot carry an owner, a reviewer, a challenge, or a review date."**
- **Belief (verbatim, R4):** *"the 'Export brief' committee PDF stamps 'VALIDATION STATUS: EDITORIAL' under every single control block, and has **no line for an owner, a reviewer, a challenge, a review date, or a firm name**. It is generated, timestamped, and **signed by nobody**. So the artifact this tool hands me for my committee is one that **structurally cannot carry the one thing my committee exists to record**."*
- **Reader:** R4.
- **Truth:** The *observation* may be accurate about the artifact R4 actually generated — the **per-risk `Export brief`** on the RiskDetail header. The *inference* — that no such capability exists anywhere — is FALSE. R1's tray-generated brief carried *"my `Owner: Platform Security` annotation carried through"* onto the printed page.
- **What on screen caused it:** **two buttons with near-identical names producing different artifacts.** `Export brief` (per-risk, unannotated, RiskDetail header) vs `Committee brief` (scoped, annotated, in the tray). R4 found the first, never reached the second, and generalised.
- **Severity: CRITICAL.** This is the belief that took R4 from "useful reference" to "cannot enter my workflow" — the exact verdict v0.9.0 was built to reverse.
- **Surface that must change:** rename or merge. The per-risk button should read *"Quick brief (this risk)"* and should carry a line pointing at the tray: *"Add mappings to an assessment to annotate with owner / RACI / concur-challenge."*

**C3 — "SI-10 input validation prevents prompt injection."**
- **Belief:** the site asserts it on screen — *"↳Input validation (SI-10) prevents prompt injection payloads from reaching goal-selection logic"* — on the **same page** where its own ASI01 description says *"Agents cannot reliably distinguish instructions from data."*
- **Readers:** **R1 accepted it and exported it.** R1 quoted the rationale approvingly, ticked the SI family into an assessment, and printed it into a committee brief — a governance document now carrying a technically false control claim under a VALIDATION STATUS stamp. **R2 caught it, on prior knowledge only**, and was blunt: *"This mapping is the single most dangerous cell on the site, because it's the one **a non-engineer will most confidently tick**."* R1 is that non-engineer, and R1 ticked it.
- **Severity: CRITICAL.** The one reader who caught the site's most dangerous claim caught it because he had personally watched an agent get talked into something stupid by webpage text. **The site's target audience is definitionally the audience that cannot catch this.**
- **Surface that must change:** rewrite the SI rationale to claim *detection and reduction*, not prevention; and put K6.5's counterfactual boundary (*"we do not claim the mapped control would have prevented the cited incident"*) on the screen where the rationales are, not only in `VALIDATION.md`.

### HIGH

**H1 — "The simulator's weighted risk ordering is something I'd act on."**
- **Belief (verbatim, R2):** *"'your top exposure is the memory store, then the goal-hijack-to-exfil path, then your unauthenticated agent-to-agent channel' is correct and it's ordered. **I'd act on that ordering.**"*
- **Truth:** those weights are, per the key (K6.16 / G7), *"editorial estimates. **Practitioner validation required**"* — a caveat that **exists only in an engine code comment** and appears nowhere in the UI. R4 independently found the same hole: *"It produces percentages (90% / 80% / 70%) … with no stated methodology, no data lineage, no author, and — unlike the crosswalk — **no editorial badge at all**."*
- **Severity: HIGH.** The key predicted this exact harm in G7; the study confirms it in a live reader who said, out loud, that he would act on it.
- **Surface:** put the editorial/synthetic caveat on the simulator panel and an `EDITORIAL` badge on its numeric outputs.

**H2 — "The tutorial pre-selected a scenario / an error has cascaded."** — Two false statements the site makes about its own screen.
- **R1:** coach mark says *"We've pre-selected a standard scenario: an Erroneous risk occurring in a Sequential agent chain"*; `Generate Scenario` produces **Biased × Swarm**. Then coach step 3 says *"You can see how an error originating in Agent A cascaded…"* while *"the timeline underneath read `Step 0/6` and **every node in the diagram was blue, legend `Healthy`**. Nothing had cascaded."*
- **Severity: HIGH.** *"A tutorial that asserts something the screen contradicts is worse than no tutorial… It cost real trust, this early."* And R1's closing line to the author: *"Fix the tutorial's two lies before you build anything new. In my line of work, a tool that misdescribes its own screen is a tool I have to check twice, and one I have to check twice is one I don't use."* The damage lands on the **one reader who obeyed the site's own instruction**.

**H3 — The `OSCAL (scoped)` button label is an inversion trap.**
- **R1:** *"A GRC lead in a hurry reads that button as 'export to OSCAL,' walks it to the platform team, and only then finds out it isn't an OSCAL model. **The disclosure is honest and the label is not, and the label is what people act on.**"* The `$schema-note` disclaimer (K6.6) lives **inside the downloaded file**.
- **R2** reached for external help on it: *"If OSCAL is what a GRC platform ingests, saying so in six words next to the button would be the highest-ROI copy edit on the site."*
- **Severity: HIGH** — a latent inversion of an explicit K6 disclaimer, prevented in this study only by R1's habit of opening downloads.

**H4 — The CSV strips the validation status.**
- **R4:** *"the machine-readable export preserves provenance; **the export a human will actually open in Excel and paste into a control library strips it**… If a junior analyst loads that CSV into Archer, the firm now has 89 agent control mappings … and **no marker anywhere that says 'unreviewed.'** Six months later nobody remembers where it came from and it has become **policy by sedimentation**."*
- **Severity: HIGH.** This defeats the one thing the site does perfectly (D7 = 3, universal). A one-column fix.

**H5 — "What is the Scenario Simulator for?" — 4/4 could not say.**
- R1: *"I still cannot tell you what the Scenario Simulator is for, in the sense of who commissions it and what decision it changes… It's the tab the product pushes hardest and it's the one I'd cut from my memo entirely."*
- R2: *"I could not work out whether it's meant to be (a) an onboarding device… (b) a real analysis tool… or (c) a portfolio piece."*
- R3: *"It's the loudest thing on the page (it gets a blocking dialog!) and **I still can't tell you what it produces**."*
- R4: *"branded 'Scenario Simulator' in the nav, 'Risk Engineering Platform' in its own heading, and it opens with an 'Architecture Analyzer' whose headline capability is switched off. **Three names, one panel.**"*
- **Severity: HIGH.** The surface the site spends its only blocking modal on is the surface **no reader could describe**. Every reader docked a confidence point for it.

**H6 — "Prompt injection" is never defined; "ASI" is never expanded.**
- **R1 (the target-adjacent, agentic-naive reader):** *"I still don't know what 'prompt injection' is, mechanically, and the site says it constantly."* / *"What is ASI? The site uses the acronym constantly and never once expands it on any screen I saw… **I still don't know.**"*
- **Severity: HIGH.** The product was rebuilt for a governance professional who is explicitly *"not a hands-on security engineer"* (K4) and it never defines its own central term for them. The one sentence that worked — *"Agents cannot reliably distinguish instructions from data"* — is a caption on a card. R1: *"That one sentence did more for me than anything else on the site."*

**H7 — Family-level rationale masquerading as per-control justification.**
- **R1** (from the served OSCAL JSON): *"AC-3, AC-4, and AC-6 all carry the same rationale string — the one that only argues for AC-3 and AC-6. **AC-4 Information Flow Enforcement gets a justification that never mentions it.**"* → *"the hero tile boasts 89 total control mappings, but the reasoning behind them is roughly 30-odd family-level arguments… That is the difference between this being a **scoping input** and being an **assessment**."*
- **R2** found the same defect independently (CM-3/CM-5 identical; SI-4/SI-7 identical).
- **Severity: HIGH.** Two independent readers found it; it directly downgraded R1's memo from an endorsement to a bookmark.

**H8 — The simulator asserts broken controls the crosswalk never mapped, using another risk's rationale.**
- **R2:** *"'BROKEN CONTROLS (4): CM-3, CM-5, CM-7, CM-14' — where … CM-7 and CM-14 carry identical text to each other — 'Banning eval in production agents, requiring safe interpreters…' — which is plainly the **ASI05 Unexpected Code Execution** rationale, not a goal-hijack rationale, showing up inside an **ASI01** cell… The Evidence Explorer only ever claimed CM-3 and CM-5 for ASI01; **the simulator invented two more.**"*
- **Severity: HIGH** — a data-integrity failure. *"Once I saw that I stopped trusting the simulator's specificity… it burned the credibility the Evidence Explorer had built."*

**H9 — The site physically blocks access to its own limitations disclosure.**
- **R1:** *"the sticky assessment tray sits over the footer and swallowed my click until I collapsed it — **with a saved assessment active, the tool physically blocks access to its own limitations disclosure.**"*
- **R3 (never got in at all):** *"the single most decision-relevant control on the page for a credibility-triaging reader like me. **I never found out what's in it.**"*
- **Severity: HIGH.** The two readers who opened it called it the best thing on the site (R1: *"the best-written thing on the site"*; R4: *"genuinely good… whoever wrote it has been on the receiving end of a challenge before"*). The reader who most needed it never saw it.

**H10 — "Compliance Middleware" — 4/4 mis-parse.**
- R3: *"'Middleware' means something sitting in a runtime path, intercepting. This is a static reference map with a simulator attached. **The label promises a product and delivers a document**… **Fix this word.**"* R1 expected a connector product. R2 read it as a vendor tell. R4 rejected it outright.
- **Severity: HIGH** — total failure of K1's own category term (key G8), and it is the **first word on the page**.

### MEDIUM

**M1 — "Where does my saved assessment live?"** R1: *"It has `Save`, `Export JSON`, `Import JSON` and **no sign of a server** — I assume browser-local, and I would not trust my only copy of a committee input to a browser cache. **The site never says where it lives.**" *K1's "no backend, no database, no accounts, no telemetry" is a **genuine trust asset for a regulated-firm reader** — and it transmitted to **zero of four**. Not one reader said "nothing leaves my browser" as a benefit. The copy exists (`DownloadData.tsx`: *"NO server and NO network request"*) but not where the tray is. **Fix:** put it on the tray.

**M2 — The hero's CTA spine did not register.** 3 of 4 readers' unprompted T0 recall omits *"See the 4 Critical risks →"* and *"Explore the evidence"* entirely; only R1 recalled them, and did not use them. R4 read the Featured Incident band — K7's designated worked-example front door — as *"marketing."* **The intended first action (K7) reached one reader out of four and was used by none.**

**M3 — The AI-RMF half never landed.** R2: *"the whole AI-RMF column — GV-1, MP-5, MS-3, MG-1 — I clicked them, I read them, and **I retained nothing**."* / *"What an AI-RMF actually is or why I would want one… stayed abstract from first paint to last click."* One-third of the three-way crosswalk failed to transmit, and R4's memo never mentions AI-RMF either.

**M4 — Un-legended jargon grid.** R2: *"For a page whose entire value proposition is translating jargon, shipping an un-legended jargon grid is a self-own."* The 800-53 heatmap ships 16 bare two-letter family codes with no key.

**M5 — The MP collision.** R2 and R4 both hit it: 800-53's **MP** (Media Protection) column and AI-RMF's **MP-1 Context Establishment** on one screen. R2: *"I stared at that for a while."* This is the known latent bug already logged in the repo's own `CLAUDE.md` (`Home.tsx:97` fallback).

**M6 — The site cannot count its own mappings.** The hero trust bar says **"80 MAPPINGS"**; the stat card says **"89 total control mappings."** R3 reported both without reconciling them (claims 4 and 5); R2 used 89; R4 quoted 80 in one place and 89 in another. **The site's headline coverage number is inconsistent between two elements in the same hero.**

**M7 — Search: undiscoverable and imprecise.** R4 called the reverse lookup *"the sleeper feature"* and then: *"it is **completely undiscoverable** — the search box is not in the tab, it's in the header."* R2: searching `prompt injection` returned *"78 results found"* of 89 — *"A search that returns 88% of the corpus is not a search."*

**M8 — No author.** 3 of 4 flagged it unprompted. R3: *"For a credibility triager this is the biggest hole on the page."* R4: *"it never tells me **whose** judgement I'm reading."* R1: *"a limitation I'd need to put a human being's credentials behind before I cite this to anyone."* For a product whose entire moat is provenance, **the provenance of the author is missing.**

**M9 — `Escape` does not dismiss the modal.** R3: *"I pressed Escape — it did not close. I had to spend a click on 'Skip tutorial' to get back to the page I was already looking at… **A colder reader dies here.**"*

**M10 — The governance line's caveat is invisible.** The rendered line — *"Governance: treat as a Tier-1 model risk — board/CRO reporting, independent validation, and continuous monitoring under SR 11-7; escalate before deployment"* — carries its *"editorial guidance, not a control requirement"* qualifier **only in a source comment** (key G6). Both governance readers absorbed it as site-authoritative: R1 *"That is written in my language, by someone who has met a model risk committee"*; R4 *"Somebody has thought about my reader."* Neither over-claimed it, so no harm landed **in this study** — but the caveat is not on screen, and the two readers most likely to act on it read it unhedged. R2, meanwhile, could not even parse it: *"[REACHED FOR EXTERNAL HELP: 'what is SR 11-7?'] … This is the site's most confident sentence and its least legible one."*

---

## 5. PRIOR-KNOWLEDGE LEAKAGE AUDIT

### Claims I re-tagged

| Reader | Claim | Their tag | **My re-tag** | Reasoning |
|---|---|---|---|---|
| **R4** | #25 *"There is no multi-risk scoping or selection anywhere"* | `[SITE: absence]` | **UNSOURCED AND FALSE** | An absence is not a pixel. This is an inference from a **failure to find**, laundered into a site fact by the tag. It is the load-bearing claim of R4's entire report and it is wrong. |
| **R4** | #26 *"The entire site accepts only three kinds of user input"* | `[SITE: absence]` | **UNSOURCED AND FALSE** | Same defect. The site accepts at minimum: per-mapping selection checkboxes, an assessment-name text field, and four annotation fields (OWNER / RACI / STATUS / NOTE) — all used by R1. |
| **R3** | *"…with 80 candidate mappings **and a gap list**, exportable"* | untagged | **INFERRED — not site-sourced** | R3 never clicked into the product. The `GapSummary` lives inside the tray R3 never opened. R3 could not have seen a gap list. Lucky guess; no points. |
| **R2** | #15 incidents (EchoLeak / AgentFlayer / Gemini) | `[PRIOR KNOWLEDGE]` | **Tag upheld — and it is the most honest tag in the study.** | *"I recognized all three from my own reading before I opened this site. **The site did NOT teach me these.**"* Correct, and consequential: it means **the K5 moat delivers materially less to an engineer than to a governance reader.** R1, R3 and R4 all treated the citations as new and valuable; R2 discounted them and scored D5 = 1–2 accordingly. |
| **R1 / R3** | "middleware implies an integration/runtime layer" | `[PRIOR KNOWLEDGE]` | **Tag upheld** | Both readers caught themselves. Note what this means: the site's category word produced a **transient false belief in two of four readers**, and only their own expertise dissolved it. |

### The `[SITE: absence]` tag class must be abolished

R4 used it three times. Twice it happened to be true (no simulator badge; CSV drops the status column). Once it was false — and it was the one that mattered. **A negative existence claim cannot be site-sourced.** The instrument should require `[INFERRED FROM FAILURE TO FIND]`, which would have forced R4 to hold the claim at lower confidence and would have marked it, correctly, as a **discoverability observation rather than a product fact**.

### Whose score would collapse without prior knowledge?

- **R1 — no collapse; would *rise* in danger.** R1's comprehension is almost entirely pixel-driven (every memo claim is cited to an on-screen element or a site-served download). What R1's prior knowledge supplied was the *use-boundary* — *"I would never cite it as authority to a regulator, never import it into Archer as if it were validated."* **The site never says any of that** (key K4, finding 3: *"Who it is NOT for is stated nowhere"*). Strip R1's professionalism and the memo becomes an endorsement.
- **R2 — no collapse in score, but a collapse in *safety*.** Strip R2's engineering prior and claim #11 disappears — and with it the only thing standing between the site's SI-10 assertion and a reader who ticks the box. **This is the sharpest counterfactual in the study: R2's report is the only one that does not carry a false control claim forward, and the reason is R2's résumé, not the site's copy.**
- **R3 — marginal.** D4 would fall 3 → 2 (routing "COMPLIANCE + 800-53 + AI-RMF" to "the Director of GRC who owns our control catalog" is R3's org knowledge; R3 tagged it honestly at claim 19). Everything else — D1, D2, D5, D6, D7 — is hero- and footer-sourced and holds. **R3's 21/24 is the most nearly pure measure of what the page itself transmits, and it is the strongest result in the study.**
- **R4 — no collapse in comprehension.** R4's D1/D2/D5/D6/D7 are all built on quoted pixels (provenance panel, validation-status panel, governance bridge, pinned editions). What R4's prior knowledge bought was the **quality of the critique** (SR 11-7, effective challenge, MRAs, policy-by-sedimentation), not the comprehension. **Nothing R4 knew caused the D3 failure — that failure is entirely the site's.** R4 looked in three places for the feature and the site showed them nothing.

### The leakage finding that matters

**The site's boundaries about its *data* transmitted perfectly. Its boundaries about its *use* transmitted zero.**
Every reader knew the mappings are Editorial, single-author, unvalidated (4/4, D7 = 3). **Not one reader learned from the site what not to do with it.** "Don't cite this as authority." "Don't load this into Archer as if it were validated." "This is not an assessment of your systems." All three appeared in the reports — and all three came from the readers' own professionalism, tagged `[PRIOR KNOWLEDGE]` by name. R4 spelled out the consequence for a reader who lacks it: *"If a junior analyst loads that CSV into Archer… six months later nobody remembers where it came from and **it has become policy by sedimentation**. I have seen precisely this happen with a vendor spreadsheet, and **it cost us an MRA**."*

---

## 6. GATES

### G1 — Self-explanation · **PASS** (at the floor)

> *R1 AND R4 both score ≥2 on D1, D2, D3 by end of T2 (unaided, 5 min).*

| | D1 | D2 | D3 |
|---|---|---|---|
| R1 @ T2 | 2 | 2 | **2** |
| R4 @ T2 | 3 | 3 | **2** |

**PASS.** But read the passing evidence: both readers clear D3 at exactly 2, and both do so as **PARTIAL — "stops at read the map."** R1 at T2: *"Until that instant I had this filed as a reference site: something you read."* R4 at T1: *"Whether I can record my own firm's view on any of it"* — unanswered. **The gate passes on the crosswalk, not on the product.** It would not survive a stricter threshold, and the gate's own load-bearing dimension is the one where both readers sit on the line.

### G2 — No inversions · **PASS as written · FAIL as intended**

**As written — PASS.** I checked every K6 disclaimer against all four transcripts. Nobody believed something the site explicitly disclaims:
- K6.1 (severity is editorial): 4/4 correct.
- K6.3 (all Editorial): 4/4 correct, at first paint.
- K6.5 (**the one the key warns hardest about** — the site never claims the mapped control would have prevented the cited incident): **0/4 committed this inversion.** Nobody read the Featured Incident card as "AC-6 would have stopped EchoLeak." The evidence layer's framing held.
- K6.6, K6.7, K6.11, K6.14, K6.16: correctly read or not engaged. No inversion.

**As intended — FAIL, and I will not soften this.** The gate's purpose is "no reader walks away with a dangerous false belief," and two readers did:
1. **R1 carried the site's SI-10 prevention claim into a committee brief without challenge.** The site *asserts* it, so it is not an inversion — it is worse. The reader believed the site, and the site was wrong.
2. **R2 said he would act on the simulator's weighted risk ordering** — numbers the key describes as *"editorial estimates. Practitioner validation required"* with the caveat living only in a code comment.

The inversion class only catches readers who **contradict** the site's disclaimers. It has no bucket for a reader who **faithfully propagates a false claim the site makes**. I log a sixth class — **PROPAGATION** — and note that under it, G2 fails 2/4.

### G3 — Forwardability · **PASS, emphatically**

> *R3 states correct category AND user (D1, D4 ≥2) within 90 seconds.*

**D1 = 3, D4 = 3, at 60 seconds, with zero clicks into the product.**
- Category: *"A reference map from a new agentic-AI threat list onto control frameworks my org already runs. Interactive, browser-based."*
- User: *"GRC / compliance / control-owner… **not** for a CISO, not for an engineer, not for a red-teamer."*
- And R3's own verification: *"I could write that line **from the hero alone.** That's the test, and it passes."*

**This is the only unqualified PASS in the instrument.** The hero works. R3's forward note is accurate, correctly caveated, and correctly addressed. Two costs are recorded against it and neither breaks the gate: the modal nearly killed the session (*"A colder reader dies here"*), and the eyebrow word "middleware" would have mis-set the recipient's expectations (*"my GRC lead would have opened it expecting to install something"*).

### G4 — The deliverable lands · **FAIL**

> *At least R4 reaches D3 = 3, naming the exportable deliverable, not just the map.*

**R4 reaches D3 = 1.** Not 3, not 2. R4 did not merely fail to name the deliverable — **R4 named its absence**, four times, in the strongest terms available to a professional writing for a peer, and then wrote the missing feature as a roadmap request:

> *"For it to enter my workflow, three fields and a 'concur / challenge / not-applicable' toggle per mapping — persisted, exportable, and printed on the brief — would do it. **That is the difference between something I read and something I use.**"*

That is a description of `SelectToggle` + `AssessmentTray` + the annotation fields + `brief.ts` — **shipped in v0.9.0, used by R1, used by R2, and grounded in the sealed key at K3(b).**

**Stated plainly, as required: yes. R4 — the target user, the persona the entire v0.9.0 overhaul was built for — formed a FALSE BELIEF about a shipped, working feature, held it with high confidence, made it the lead finding of the report, and transmitted it to a peer.** The feature works. The invitation to it does not exist.

**G4 fails on the gate as written and it fails on the gate's intent.** That two *other* readers reached the deliverable does not rescue it — the gate names R4 for a reason, and the reason is that a product which only reveals itself to the reader who idly clicks a checkbox (R1: *"I found the product's actual purpose by idly clicking a checkbox"*) is not a product that has shipped its purpose.

**Gate summary: G1 PASS (at the floor) · G2 PASS as written / FAIL as intended · G3 PASS · G4 FAIL.**

---

### Study-hygiene note — browser contamination, and what it proves

R4 reported, unprompted: *"a browser tab titled **'AI Committee - agentic control scoping — committee brief'** was already open in my browser when the session began (about:blank, not navigable). That title implies a **named, scoped, multi-risk brief** feature exists. I could not find a route to it from any screen. I am recording it as a tab title I observed, **not** as a feature the site showed me — because from the UI, I never found the door."* R4 tagged it `[NOT A SITE PIXEL]` and excluded it from every claim.

**Confirmed: R4 identified the contamination, correctly refused to score it, and said so in the transcript. That is exemplary hygiene and it should be credited.**

Two things follow.

1. **It is a real hygiene defect and it must be fixed before any re-run.** The tab is a leaked artifact of a prior evaluator's session in the same browser profile — almost certainly R1's (whose stated task was *"a defensible one-pager I could hand to the AI committee"* and who named and saved an assessment). R2's and R4's own brief timestamps are ten minutes apart on the same day (`20:22:54Z` and `20:32:57Z`), which confirms a shared profile. **Any re-run needs a clean browser profile and cleared `localStorage` per evaluator** — note that `localStorage` state also drives the onboarding modal, so profile leakage can silently change which front door a reader gets.

2. **Forensically, it is the single most damning object in the study.** The tab title R4 saw was **literal, on-screen proof that the feature existed, generated on the same machine minutes earlier** — and R4, the target persona, still could not find the door. R4 held the artifact's shadow in their hand, went looking, checked three surfaces, and concluded the feature does not exist. **No discoverability failure can be demonstrated more completely than that.**

---

## 7. THE SINGLE MOST IMPORTANT FINDING

**The site ships the deliverable and hides the door — and the reader it was rebuilt for went looking, found nothing, and published the absence.** Every one of the four readers reconstructed the honesty layer from the hero in five seconds: 4/4 clocked *"100% Editorial · 0% Reviewed · 0% Validated"*, 4/4 read it correctly, and 4/4 said it *increased* their trust — a transmission result most products never achieve and which nothing here should be allowed to disturb. But the v0.9.0 thesis — *rotate the product 90°, make the deliverable the object, walk out with an artifact* — reached only the two readers who happened to tick a checkbox, and **both of them called it an accident** (R1: *"I found the product's actual purpose by idly clicking a checkbox… that's too much load-bearing weight on an accident"*). R4, the second-line model-risk manager the entire release was rotated to serve, spent an hour in the product, deliberately searched the Overview cards, the heatmap rows and the detail view for a way to scope and annotate, concluded in the strongest terms a professional has — *"**No. None. The only status shown is the site's own, and it is read-only**"* — told a peer so in writing, and then specified the missing capability as a roadmap item: *"three fields and a 'concur / challenge / not-applicable' toggle per mapping — persisted, exportable, and printed on the brief."* That is a verbatim description of the `SelectToggle` → `AssessmentTray` → annotation → `Committee brief` pipeline that shipped, that R1 drove end-to-end in under ten minutes, and whose output — a tab titled *"AI Committee - agentic control scoping — committee brief"* — was **sitting open on R4's own screen**, which R4 saw, could not explain, and honourably refused to count. The mechanism is precise and it is one line of the codebase: **the Assessment Tray renders nothing until a mapping has already been ticked**, so the reader who goes looking for the deliverable engine is shown affirmative evidence that it does not exist. The product's honesty is legible in five seconds; **its purpose is invisible in an hour**. Fix the empty state, name the workflow on the hero, and the highest-value reader in this study flips from *"a reference I'd cite in an appendix"* to the thing the release was built to be.

---

**Scored 2026-07-14 · blind to the artifact · from the sealed key and four transcripts only.**

---
status: sealed
sealed_at: 2026-07-14
target: live GitHub Pages build v0.9.0
---

# SEALED ANSWER KEY — Comprehension Audit

**Authored by:** the key-holder, from the repository only. The key-holder has **not** visited the live site and takes no further part in the audit.
**Repo:** `C:\Users\shant\linuxshanti\OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF`
**Site under audit:** https://shantanusinghesq.github.io/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/ (crosswalk data v0.9.0)

This document states what the site is **supposed** to communicate. It is not a claim about how well it does so.

Convention used below: **(a)** = the claim; **(b)** = grounding, with the actual on-screen words quoted where they exist. Where the repo does not state an intent, that is recorded as a finding, not smoothed over.

---

## K1 — Category: what KIND of thing this is (and what it is not)

**(a) The claim.**
This is a **free, fully client-side, open-source reference-data product with an interactive front end**: a three-way *compliance crosswalk* that translates OWASP's Top 10 for Agentic AI (ASI 2026) into NIST SP 800-53 Rev 5 controls and NIST AI-RMF (AI 100-1) functions. Its self-declared category is **"compliance middleware"** — a translation layer sitting between a threat taxonomy and the two control/governance frameworks an enterprise already reports against. The underlying data package (`@shantanusinghesq/crosswalk`) is the actual product; the web app is one view of it.

It is **not**: a scanner, a monitor, an agent-security product, a GRC platform, a certification, an audit, or a source of legal/compliance advice. It has **no backend, no database, no API, no accounts, and no telemetry** — every computation and every export happens in the browser. It is also *not* an authoritative NIST or OWASP publication: the mappings are one author's editorial judgement layered on top of public-domain frameworks.

**(b) Grounding.**
- Hero eyebrow, `client/src/components/HomeHero.tsx:55` — **"Compliance Middleware"** (10px uppercase kicker above the H1).
- Hero H1, `HomeHero.tsx:60` — **"Agentic AI Risks"**. Sub-line, `HomeHero.tsx:63-65`: *"Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1. Interactive compliance mapping for agentic AI security risks across 10 threat categories."*
- Onboarding modal H2, `client/src/features/onboarding/HookModal.tsx:114` — **"Welcome to the Compliance Middleware."** Body: *"AI agents don't just generate text—they take action. This platform bridges the gap between emerging agentic threats (OWASP) and established enterprise security frameworks (NIST)."*
- `README.md:23` — *"This crosswalk operates as a **compliance middleware** layer connecting three authoritative frameworks"*, with the three-layer table: Threat Layer (OWASP ASI) / Control Layer (800-53) / Governance Layer (AI-RMF).
- `CLAUDE.md` (repo) — *"This is a **fully client-side** interactive crosswalk between three frameworks… All data is embedded in TypeScript — there is no database, no API, no backend logic."* And: *"**Data model is the product** — `@shantanusinghesq/crosswalk`."*
- `client/src/components/DownloadData.tsx:6-11` — *"Downloads are generated entirely in the browser… NO server and NO network request."*
- `<title>` / `<meta name="description">`, `client/index.html:11-13` — *"Agentic AI Risks from NIST to OWASP"* / *"Interactive compliance mapping of OWASP Agentic AI risks (ASI01–ASI10) to NIST 800-53 Rev 5 controls and NIST AI-RMF categories. Heatmaps, evidence explorer, and exportable mappings for security and compliance teams."*
- Not-advice boundary: `TERMS_OF_SERVICE.md` §6 — *"**The crosswalk mappings are provided for informational and educational purposes only.** They do not constitute legal advice, compliance certification, audit guidance, or professional recommendations."*

**Finding — the category word is doing heavy lifting in a tiny font.** "Compliance middleware" is the repo's chosen category term, but on screen it appears only as a 10px eyebrow (`HomeHero.tsx:54-56`) and in the first-run modal. The H1 itself ("Agentic AI Risks") names the *subject*, not the *kind of thing*. The repo never defines "compliance middleware" for a reader who has not read the README.

---

## K2 — Use case: what it is for

**(a) The claim.**
It is for **translating an agentic-AI threat into the control and governance language an auditor, regulator, or risk committee already accepts** — and doing so with citations attached. The repo names four concrete situations:
1. **Onboarding a new agentic capability** — deriving the candidate control set before it clears governance.
2. **Audit / assessment preparation** — answering a FedRAMP, SOC 2, or ISO 27001 assessor who asks "how do you mitigate unauthorized agent behavior?" in specific 800-53 control terms.
3. **AI-governance program construction** — turning AI-RMF's high-level GOVERN/MAP/MEASURE/MANAGE functions into a concrete implementation path via 800-53 controls.
4. **Regulatory-exam / internal-audit response** — the repo's own "killer use case": answering an examiner with *specific control citations + source-verified justification + provenance*.

Secondary use case: **feeding the data downstream** — the MIT-licensed package and JSON/CSV/OSCAL exports exist so GRC platforms, SIEM dashboards, and compliance-automation tools can ingest the crosswalk.

**(b) Grounding.**
- `README.md:13-19` — the three named failure modes the crosswalk exists to fix: *"compliance blind spots emerge"*, *"audit preparation becomes fragmented"* (…*"When a FedRAMP assessor or SOC 2 auditor asks how an organization mitigates 'unauthorized agent behavior,' the answer must be expressed in terms of specific 800-53 controls. This crosswalk provides that translation layer"*), *"AI governance programs lack actionable structure."*
- `docs/UX-AUDIT-2026-07-11.md` Part 1 — three demo walkthroughs: model-risk-register onboarding, quarterly AI Risk Committee / board reporting, and *"Demo 3 · Regulatory exam / internal-audit response (**the killer use case**)"*, of which: *"This is the product's strongest moment: I can answer the examiner with **specific control citations + source-verified justification + provenance**, in minutes — the difference between an assertion and a citation."*
- `README.md:35` — *"the underlying data model … can be extracted for integration into GRC platforms, SIEM dashboards, or compliance automation tools."*
- `packages/crosswalk/README.md:5` — published under MIT *"so that downstream tools — assessment platforms, GRC integrations, SIEM dashboards — can consume the data without inheriting the AGPL-3.0 license of the SPA."*

---

## K3 — Job-to-be-done: what work it actually FINISHES

**(a) The claim.**
As of the **v0.9.0 overhaul, the job is no longer "read a map" — it is "walk out with a deliverable."** The atomic object of the product is a **defensible, cited, provenance-stamped control set** (the repo's term: an *Assessment*), not a crosswalk cell. The user's session is supposed to end with an artifact in hand, not a screenshot.

Concretely, the site is supposed to finish **five jobs end-to-end**, all of it in the browser with no login and no server:
1. **Control-set derivation** — select the relevant mappings per ASI risk into a named, savable Assessment (tick-boxes on mapping cards → the Assessment Tray).
2. **Committee reporting** — export a **print-ready, light-theme "Committee brief"** (risk headers + controls with catalog titles + rationale + validation status + your annotations + typed evidence with CVEs + a provenance footer), printable to PDF.
3. **Examiner citation** — produce specific control citations with source-verified evidence and a stated validation status for each.
4. **Gap analysis** — see per-risk coverage % and which families/functions you have *not* selected, and record your institution's own owner / RACI / concur-or-challenge annotation against each mapping.
5. **GRC feed** — export a **scoped OSCAL-aligned mapping** (and JSON/CSV) covering exactly the selected scope, for ingestion into an Archer/ServiceNow-class tool.

The repo is explicit that this reframing is the point of the release: *"rotate the product 90°"* — make the deliverable the object, demote the crosswalk to the palette, and lead with the receipts.

**(b) Grounding.**
- `docs/UX-AUDIT-2026-07-11.md:72` (Part 3, convergent thesis, all three auditors independently) — *"**rotate the product 90°.** The differentiator — source-verified evidence with pinned provenance — creates enterprise value only when it **travels attached to a decision**. Today it stays in a browse view. Make the primary object a **defensible, cited, provenance-stamped control set / risk brief** the user can walk out with; demote the crosswalk to the palette; and **lead with the receipts (the real incidents), not the map.**"*
- `docs/UX-AUDIT-2026-07-11.md:55` (pre-overhaul diagnosis, i.e. what v0.9.0 was built to fix) — *"**It stops at 'read.'** It completes **zero of the persona's five jobs end-to-end** — every one ends with '…now re-assemble this by hand and re-key it into the GRC tool.' The atomic object is the *mapping cell*, not the *deliverable*."*
- `docs/UX-AUDIT-2026-07-11.md:121` (Palo Alto lens signature insight) — *"Flip the object model: the atomic unit should be a 'defensible control set,' not the crosswalk. `{capability → selected controls → cited evidence → validation status → analyst annotation → provenance stamp}`."*
- `docs/acc/004-2026-07-11-ux-audit-implementation.md:16` — *"Verdict **PASS**: 5/5 persona jobs now complete end-to-end (were 0/5), 14/14 recs present, 107 tests green."*
- `docs/scratchpad-demo-evaluate-updated-app.md:92` — the five jobs named: *"control-set derivation, committee reporting, examiner citation, gap analysis, GRC feed"*; CoVE-05 (:160-162) maps each to its shipped surface: `AssessmentTray` + `SelectToggle`; `buildBriefHtml`; RiskDetail evidence w/ CVEs; `asiGaps`/`GapSummary`; `scopeOscalMapping`.
- On-screen surfaces that carry the job: `client/src/features/assessment/AssessmentTray.tsx` (collapsed bar: *"N selected"* + controls/families/functions/cats chips + an editable assessment-name field + **"Committee brief"** + **"OSCAL (scoped)"** buttons; expanded: New / Clear / Save / *"Load saved…"* / *"Delete saved…"* / **"Export JSON"** / **"Import JSON"**); `BriefExport.tsx:46` button label **"Committee brief"**, tooltip *"Open a print-ready committee brief of the selected mappings"*; `AssessmentTray.tsx:219` tooltip *"Download the OSCAL-aligned mapping scoped to the selected mappings"*; `GapSummary.tsx:28` heading **"Coverage gaps per selected risk"**, rows read *"{pct}% covered ({selected}/{available} mapped areas)"* and *"Missing: …"*; `RiskDetail.tsx:117` per-risk **"Export brief"** button and `:130` **"Copy link"**.
- The brief document itself, `client/src/features/assessment/brief.ts:279` — H1 **"Agentic AI risk — committee brief"**, with a **"Provenance"** footer listing each pinned upstream edition plus *"Crosswalk data version {v} · generated {timestamp}"*, and a **"Print / Save as PDF"** toolbar button.

**Finding — the JTBD is stated in `docs/`, NOT in the site's own copy.** Nowhere in the shipped UI does the site tell a visitor that the job is to assemble and export a deliverable. The hero (`HomeHero.tsx`) offers "See the 4 Critical risks →" and "Explore the evidence" — both *browse* verbs. The Assessment Tray, which *is* the deliverable engine, **renders nothing at all until the user has already ticked a mapping** (`AssessmentTray.tsx:57-60`: *"Untouched assessment → no tray"*). The reading primer (`ExplorerView.tsx:38`, "How to read this crosswalk") explains the *map*, not the *workflow*. So the v0.9.0 job-to-be-done is real, shipped, and testable — but **it is never announced**. An evaluator who reports that the site does not tell you it can produce a deliverable is describing a genuine property of the artifact, not a misreading.

---

## K4 — Intended user: who it is for, and who it is NOT for

**(a) The claim.**
Two answers exist in the repo and they are **not the same**, so both are recorded.

*The README's answer (the broad four):* **CISOs and security architects** evaluating agentic AI deployments; **GRC analysts** preparing for FedRAMP / SOC 2 / ISO 27001 audits involving AI; **AI governance officers** building NIST AI-RMF-aligned programs; **red team leads** scoping adversarial testing against agentic threat models.

*The v0.9.0 design target (the sharp one):* a **second-line AI / model-risk manager at a large financial-services firm** — fluent in governance (SR 11-7 / OCC 2011-12, NIST AI RMF, FFIEC, DORA / EU AI Act, three-lines-of-defense, board/CRO reporting, regulatory exams; lives in Archer / ServiceNow IRM / OneTrust / MetricStream) but **explicitly *not* a hands-on security engineer**. Every design decision in the v0.9.0 overhaul (committee brief, SR 11-7 lifecycle tags, governance framing lines, scoped OSCAL, inline control titles, the reading primer) was made for this person.

**Who it is NOT for:** the repo never says. By construction it is not for an end-user/consumer, not for someone seeking a scanner or a runtime defense, and not for a lawyer seeking advice. The v0.9.0 persona line implies it should *work for* — not merely *at* — a governance professional who cannot read a bare `AC-6` and know what it means.

**(b) Grounding.**
- `README.md:33-35`, heading **"Who Should Use This"** — *"This crosswalk is designed for **CISOs and security architects** evaluating agentic AI deployments, **GRC analysts** preparing for FedRAMP, SOC 2, or ISO 27001 audits involving AI systems, **AI governance officers** building risk management programs aligned with the NIST AI-RMF, and **red team leads** scoping adversarial testing against agentic AI threat models."*
- `docs/UX-AUDIT-2026-07-11.md:5` — *"**Persona optimized for:** a **second-line AI / model-risk manager at a large financial-services firm** … but **not** a hands-on security engineer."*
- `docs/UX-AUDIT-2026-07-11.md:68` (clarity lens verdict) — *"it's built for someone who already speaks 800-53"* — named as a **defect**, i.e. the intent is that it should NOT require that.
- `packages/crosswalk/src/data.ts:81-82` — the governance bridge *"exists so a second-line risk manager can start from the frameworks they actually report against."*
- `client/src/features/explorer/RiskDetail.tsx:25-26` — *"Governance framing — translates OWASP/NIST severity into the second-line risk manager's native frame (three-lines-of-defense / SR 11-7 posture)."*

**Findings.**
1. **The site itself never names its user.** No on-screen copy says who this is for. The audience statement lives only in `README.md` and `docs/`.
2. **The two audience statements are in tension.** The README's list is led by *security* roles (CISO, security architect, red team lead); the v0.9.0 build was explicitly optimized for a *governance* role who is "not a hands-on security engineer." The README was not updated to reflect the v0.9.0 persona. An evaluator could reasonably read either. **This is a real, unresolved inconsistency in the repo's stated intent.**
3. **"Who it is NOT for" is stated nowhere.** Everything under that heading above is inference.

---

## K5 — Differentiator: why this rather than a spreadsheet, a Google search, or an LLM

**(a) The claim.**
Three things, in the repo's own order of importance:

1. **Source-verified evidence — the moat.** Every one of the 10 risks carries typed, machine-resolvable citations: **33 real, adversarially-verified incidents** with CVEs and live external links (EchoLeak → CVE-2025-32711; AgentFlayer → Zenity Labs; the Replit production-database deletion → The Register; the Amazon Q wiper → ReversingLabs; the malicious `postmark-mcp` package → Koi.ai). Every proposed source was fetched and confirmed on-topic before acceptance. A spreadsheet gives you assertions; an LLM gives you plausible-sounding control IDs and hallucinated CVEs. **This gives you a citation.** All three independent auditors named this the moat.
2. **Exam-grade transparency you can hand a regulator.** Pinned upstream framework editions (`UPSTREAM_VERSIONS`) with verification dates, a monthly upstream-drift watch, a three-tier validation model with a per-mapping status badge, an aggregate evidence-confidence bar, and a "Provenance & Limitations" panel that names its own gaps. This is the intellectual honesty *"that most vendor GRC content fakes or omits"* — and it is exactly what a second line and a regulator reward.
3. **The three-way crosswalk itself.** Nobody else does OWASP-agentic + 800-53 + AI-RMF simultaneously; and it is machine-checked — an integrity suite (107 tests) fails the build if a mapping cites a control that does not resolve in the pinned NIST catalog, or a control Rev 5 withdrew.

The distilled positioning the repo lands on: *"the only agentic-AI crosswalk you can hand a regulator, because every claim carries its receipt."*

**(b) Grounding.**
- `docs/UX-AUDIT-2026-07-11.md:50-52` (Part 2, "What genuinely validates it (the moat)") — *"**Source-verified evidence is unique.** 33 real, adversarially-verified incidents with CVEs and external links … turn an abstract mapping into examiner-ready material. All three auditors independently named this the moat."* And: *"**Exam-grade transparency.** Editorial-severity disclosure, a 3-status validation model, pinned `UPSTREAM_VERSIONS` provenance, a monthly upstream-drift watch, and a 'Provenance & Limitations' panel are the intellectual honesty a second line and a regulator reward — and that most vendor GRC content fakes or omits."*
- `docs/UX-AUDIT-2026-07-11.md:107` — *"'the only agentic-AI crosswalk you can hand a regulator, because every claim carries its receipt.'"*
- `docs/UX-AUDIT-2026-07-11.md:45` (stated value proposition, as built) — *"Compliance middleware — the Rosetta Stone that translates the OWASP Top-10 agentic-AI threats into the NIST control (800-53 Rev 5) and governance (AI-RMF) frameworks a regulated firm already reports against, with source-verified evidence you can hand a regulator."*
- `CHANGELOG.md:47-49` — *"All **33** evidence references across the 10 risks were web-researched and adversarially verified — every proposed source was fetched and confirmed on-topic before acceptance… This is the difference between a citable compliance artifact and an unsourced spreadsheet."*
- `CHANGELOG.md:17` — *"A crosswalk asserting Rev 5 alignment cannot cite controls Rev 5 withdrew — an auditor mapping a citation back to the catalog would find no such control."*
- On-screen carriers: the red **"Real-World Evidence"** strip in `RiskDetail.tsx:278` (typed badge + linked title + CVE per item); the **"Featured incident"** card in `HomeHero.tsx:96` (*"See how it maps to NIST controls →"*); the **TrustBar** (`TrustBar.tsx:26`) — *"Evidence confidence — {N} mappings"* with *"How to read this crosswalk"*… (see K6); the **"Provenance & Limitations"** panel in the footer (`ProvenancePanel.tsx:56`).

**Finding — the differentiator is *enacted* on screen but never *argued* on screen.** No copy anywhere in the app says "unlike a spreadsheet / unlike asking an LLM, every mapping here carries a verifiable citation and a pinned framework edition." The site shows the receipts; it never tells you why receipts are the point. The competitive framing exists only in `docs/UX-AUDIT-2026-07-11.md`.

---

## K6 — Boundaries: every claim the site explicitly DISCLAIMS

This is the section an evaluator must not get wrong **in the opposite direction**. The site's honesty layer is load-bearing and is disclosed in these exact terms:

1. **Severity ratings are editorial, not OWASP's.** Hero, `HomeHero.tsx:65` — *"Severity ratings (Critical, High, Medium-High) are editorially assigned based on OWASP ordinal risk ranking and are not official OWASP severity classifications."* Repeated in `ProvenancePanel.tsx:23-26`: *"Severity ratings are editorial: ASI severity ratings are this project's editorial judgement, not an official OWASP classification."*

2. **A mapping is a judgement, not a measurement.** `VALIDATION.md:4-5` — *"A mapping is an **editorial judgement** about which controls are relevant to a risk — **not a measured fact**."*

3. **The three-status validation model — Editorial / Reviewed / Validated — and the fact that EVERYTHING is currently Editorial.**
   - `ValidationBadge.tsx:16` — **Editorial** = *"authored from public evidence + authoritative guidance; not yet externally reviewed."*
   - `ValidationBadge.tsx:22` — **Reviewed** (`practitioner-reviewed`) = *"an external practitioner has signed off on this mapping (see reviewIssue)."*
   - `ValidationBadge.tsx:28` — **Validated** (`empirically-validated`) = *"corroborated by observed incident/exploitation evidence (see reviewIssue)."*
   - `RiskDetail.tsx:183-186`, the "Mapping validation status" panel — *"Every mapping declares how it was validated. All mappings are currently **Editorial** — no mapping has yet been through external practitioner sign-off. Status is shown as a labelled badge on each card (not by color alone)."*
   - `TrustBar.tsx:8-9` — *"Every mapping declares how it was validated; today all are Editorial."* The bar reads **100% Editorial / 0% Reviewed / 0% Validated**.
   - `VALIDATION.md:11-13` — *"the label never claims more than has actually happened."*
   - **The trust bar and every badge on the live site therefore say 100% Editorial. That is not a bug and not an omission — it is the disclosure.**

4. **No mapping carries a confidence rating, deliberately.** `VALIDATION.md:118-127` — confidence is an optional *ordinal* enum (`provisional < moderate < high`), **never numeric** (constraint AD-3), and *"**No mapping is rated today.** … leaving `confidence` unset is the honest current state."* Also: the mapping-confidence field *"must never be conflated"* with the Scenario Simulator's differential-privacy scores.

5. **The evidence standard deliberately does NOT claim the mapped control would have prevented the cited incident.** `VALIDATION.md:157-163` — *"We do **not** require evidence that the specific mapped control *did* mitigate the specific cited incident. Establishing counterfactual mitigation … is generally impossible from public post-mortems and would force either fabricated causal claims or an empty crosswalk."* The standard is two-part: the risk is demonstrably real, **and** the control domain is a recognised countermeasure per authoritative guidance. **An evaluator must not read the Featured Incident card as "AC-6 would have stopped EchoLeak."**

6. **"OSCAL-aligned mapping, NOT a formal OSCAL model."** `packages/crosswalk/src/oscal-mapping.ts:8-11` — *"NOTE ON CONFORMANCE: this is an OSCAL-\*aligned\* shape, **NOT a formal OSCAL model** — it is intentionally not validated against the OSCAL JSON Schema (no `mapping` layer / `back-matter` / UUID rigor)."* On screen the tray button is labelled **"OSCAL (scoped)"** with tooltip *"Download the OSCAL-aligned mapping scoped to the selected mappings"* (`AssessmentTray.tsx:219-223`); the emitted file stamps `scope.note: "client-scoped subset of the full mapping"` (`export-oscal.ts:56`).

7. **Unmapped and excluded families — the scope boundary.** `ProvenancePanel.tsx:28-31` — *"Control coverage: 54 distinct NIST 800-53 controls are mapped across **14 of the 16** in-scope families; **Media Protection (MP) and Physical & Environmental (PE) are currently unmapped**."* The heatmap explainer (`HeatmapExplainer.tsx:22-24`) adds: *"Scope: **16 of the 20** NIST 800-53 Rev 5 families are in scope; 14 carry mapped controls (MP and PE are defined but currently unmapped)"* and *"Excluded families (**AT, MA, PS, PT**) have lower relevance to agentic AI threat vectors"*, with a link to the Scope Expansion Roadmap.

8. **AI-RMF is not fully covered either.** `ProvenancePanel.tsx:32-35` — *"AI-RMF coverage: **17 of 19** AI-RMF subcategories are referenced; **GV-3 (Workforce Diversity)** and **MS-4 (Measurement Effectiveness)** are tracked but not yet mapped."*

9. **Single-author provenance.** `ProvenancePanel.tsx:36-40` — *"Single-author provenance: Mappings and rationales reflect a single-author editorial process; they have **not undergone independent multi-reviewer validation**."* Corroborated by `README.md:197` (*"The project runs in **Solo Mode**: the maintainer's review plus a green CI run … is the sole merge gate — **no external approval is required yet**"*) and `VALIDATION.md:92-99` (Tier 3 *"NEVER gates a merge (CF-03, single-author-safe)"*).

10. **Evidence backfill is incomplete.** `ProvenancePanel.tsx:41-46` — *"Evidence backfill in progress: Evidence citations are being backfilled; some mappings cite **illustrative** incidents rather than an exhaustive evidence base."*

11. **The governance framework bridge (ISO 42001 / EU AI Act / SR 11-7) is editorial v1 and NOT authoritative.** On screen, `RiskDetail.tsx:141-143` — panel titled **"Governance framework bridge"** with the label **"Editorial v1 · verify before use"**. In data, `packages/crosswalk/src/data.ts:79-82` — *"This is a **v1 editorial pass** — not an authoritative mapping, not externally reviewed, and roadmap-flagged … verify before use."* `CHANGELOG.md:37` — *"a starting point to verify against the primary texts, **never a citation to lift unread**."* `docs/acc/004:29` still lists this as an open question: *"`FRAMEWORK_REFS` is unverified editorial — needs practitioner review before any citation use."*

12. **Pinned framework editions, with verification dates — i.e. the data can go stale.** `ProvenancePanel.tsx:68-93` renders **"Pinned upstream editions"** (framework · edition · *"verified {date}"* · source link) from `UPSTREAM_VERSIONS`; the footer repeats *"Sources: {framework} {edition} | …"* (`SiteFooter.tsx:60`).

13. **The incident register is register-relative.** `VALIDATION.md:177-180` — *"`asisWithNoIncident` means 'no evidence item is attached to that ASI **in this dataset**', not a claim that the risk is unobserved in the wild."*

14. **Terms of Service — no warranty, no advice.** `TERMS_OF_SERVICE.md` §6 — *"THE SERVICE IS PROVIDED 'AS IS' AND 'AS AVAILABLE,' WITHOUT WARRANTY OF ANY KIND… The Developer does not warrant that the crosswalk data is complete, accurate, or current, or that it constitutes legal, compliance, or professional advice."* And: *"They do not constitute legal advice, compliance certification, audit guidance, or professional recommendations. Users should consult qualified legal, compliance, and cybersecurity professionals before making decisions based on the crosswalk data."*

15. **The per-risk "Governance:" line is editorial guidance, not a control requirement.** `RiskDetail.tsx:27` (code comment) — *"Editorial guidance, not a control requirement."* The on-screen text reads e.g. *"Governance: treat as a Tier-1 model risk — board/CRO reporting, independent validation, and continuous monitoring under SR 11-7; escalate before deployment."*
    **Finding — this caveat is NOT on screen.** The "editorial guidance, not a control requirement" qualifier exists only as a source comment. The rendered line makes an unhedged SR 11-7 prescription.

16. **The Scenario Simulator's risk weights are editorial estimates.** `client/src/features/simulator/engine/mappings.ts:97` — *"Weights are editorial estimates. **Practitioner validation required.**"* and `:10` — contested families *"resolved by editorial rule."* The scenarios are randomly generated from IMDA-derived probability weights, not from the user's own system.
    **Finding — this caveat is NOT on screen either.** A grep of `client/src/features/simulator/**` surfaced no user-facing disclaimer that the simulated fact patterns are synthetic or that the control→family bridge is an editorial estimate; the caveat lives only in engine code comments. An evaluator who reads the simulator as making a claim about *their* system would be misled, and the site does not currently stop them.

---

## K7 — First action: what the site wants a new visitor to DO first

**(a) The claim.**
**Intended (per the v0.9.0 design):** click a hero CTA and land on a *real, cited breach*, then see it map to concrete NIST controls. The hero was deliberately given "a spine": the primary button **"See the {4} Critical risks →"**, the secondary **"Explore the evidence"**, a clickable **"Featured incident"** card (EchoLeak / ASI01, with its CVE) whose call to action is *"See how it maps to NIST controls →"*, and four **clickable stat cards** that are doorways into the matching views. The design intent (audit rec R3) is: *lead with a real incident; make the "aha" one click, not three.*

**Actually shipped, and in conflict with the above:** on a first visit with no `localStorage` key, **the site opens a full-screen blurred modal 600ms after load** — "Welcome to the Compliance Middleware." — whose primary CTA is **"Run First Simulation"** and whose secondary is *"Skip tutorial (I know my way around)"*. Accepting it hijacks the session into a 5-phase guided tour of the **Scenario Simulator** (Hook → Guided Action → Translation → Root Cause → Handoff). So the first thing the site *does* is push the visitor into the simulator — the very surface the audit called *"buried and framed for engineers,"* and the opposite of "lead with the receipts."

**(b) Grounding.**
- `HomeHero.tsx:68-84` — code comment *"Primary actions — give the hero a spine"*; buttons **"See the {criticalCount} Critical risks →"** and **"Explore the evidence"**.
- `HomeHero.tsx:12-16` — *"Featured incident — the worked-example front door. A real, cited breach (EchoLeak/ASI01) that maps to concrete controls; the CTA jumps straight into its full crosswalk so the 'aha' is one click, not three."* On-screen: **"Featured incident · ASI01 {name} · {CVE}"** → *"See how it maps to NIST controls →"*.
- `HomeHero.tsx:108-113` — *"Stats row — each card is a doorway into the matching view"*: **ASI Risks (10)**, **Unique 800-53 Controls (54)**, **Unique AI-RMF Categories**, **Critical Risks (4)** — all clickable.
- `docs/UX-AUDIT-2026-07-11.md:84` (rec R3, Critical) — *"**Invert the IA — lead with a real incident + a 'start here' spine.** Hero primary CTA ('Start with the 4 Critical risks →' / 'See a worked example'); make the 4 stat cards clickable entry points; land on an incident (EchoLeak) that animates breach → ASI → the exact control that catches it."*
- Counter-evidence: `OnboardingContext.tsx:58-64` — on mount, if `localStorage['agentic_risk_onboarding_v1']` is unset, `setTimeout(() => setPhase("hook"), 600)`. `HookModal.tsx:114-143` — H2 *"Welcome to the Compliance Middleware."*; body *"…Let's run a quick simulation to see how a single AI failure impacts your compliance posture."*; primary CTA **"Run First Simulation"**; secondary *"Skip tutorial (I know my way around)"*. `OnboardingController.tsx:133-140` — phase `guided-action` calls `switchToSimulator()`.
- `docs/UX-AUDIT-2026-07-11.md:133` (Wiz lens, High finding) — *"the Scenario Simulator — the delight engine — is **buried last and framed for engineers**."*

**Finding — the repo contains two mutually contradictory answers to "what should a new visitor do first," and both are live.** The v0.9.0 hero says *look at a real breach / see the Critical risks*. The first-run onboarding modal — untouched by the overhaul; `docs/acc/004` never mentions the onboarding slice — says *run a simulation*. The audit's own R3 and R11 point away from the simulator as the front door. **Nothing in the repo reconciles these.** For the purposes of this key: the **intended** first action is the hero CTA / Featured Incident path; the **shipped** first action on a cold visit is the "Run First Simulation" modal. An evaluator who reports being taken to a simulator tour is reporting the truth about the build, and an evaluator who reports the hero's incident-first spine is reporting the truth about the design. Both readings are grounded; the site is at war with itself here.

---

## WHAT A CORRECT READING SOUNDS LIKE

It's a free, open-source "compliance middleware" crosswalk — a browser-only reference tool that translates each of the ten OWASP Top 10 agentic-AI risks (ASI01–ASI10) into the NIST 800-53 Rev 5 controls and NIST AI-RMF functions your auditors and risk committee already speak, with a real, cited incident attached to every risk (EchoLeak with its actual CVE, the Replit database wipe, AgentFlayer — 33 of them, each with a live source link). The thing that makes it worth using over a spreadsheet or an LLM is that every claim carries its receipt: the framework editions are pinned and date-verified, every control ID resolves against NIST's real catalog, and each mapping wears a badge saying exactly how far it's been validated — which right now, for all of them, honestly reads "Editorial," because a single author wrote them and no outside practitioner has signed off yet. As of v0.9.0 it doesn't just want you to *read* the map: you tick the mappings that apply to your agentic capability, annotate them with an owner and a concur/challenge, and walk out with a print-ready committee brief (controls + rationale + validation status + cited evidence + a provenance footer) plus a scoped OSCAL/JSON export to feed your GRC tool — all client-side, no login, nothing leaves your browser. What it is careful *not* to claim: the severities are its own editorial call and not OWASP's; the OSCAL output is OSCAL-*aligned*, not a schema-valid OSCAL model; MP and PE families and two AI-RMF subcategories aren't mapped at all; the ISO 42001 / EU AI Act / SR 11-7 bridge is flagged "Editorial v1 · verify before use"; and it never claims the control it names would have stopped the breach it cites — only that the risk is demonstrably real and that control domain is a recognised countermeasure. It's a citable starting point for a defensible control set, not legal advice, not a certification, and not a scanner.

---

## APPENDIX — Places the repo's stated intent is ABSENT or SELF-CONTRADICTORY

Recorded per the audit rules. These are properties of the artifact, not of any evaluator's reading.

| # | Gap | Where |
|---|---|---|
| G1 | **Two live, contradictory "first actions."** The v0.9.0 hero is built to lead with a real incident ("Featured incident … See how it maps to NIST controls"), but a cold visit auto-opens a modal 600ms in whose primary CTA is **"Run First Simulation"** and which hijacks the session into a simulator tour. The overhaul (ACC 004, PRs #31–35) never touched the onboarding slice, and the audit's R3/R11 point away from the simulator as the front door. Nothing reconciles them. | `HomeHero.tsx:68-106` vs `OnboardingContext.tsx:58-64` + `HookModal.tsx:114-143` + `OnboardingController.tsx:133-140`; `docs/UX-AUDIT-2026-07-11.md:84,133` |
| G2 | **The job-to-be-done is never stated on screen.** The "walk out with a deliverable" reframing — the entire point of v0.9.0 — is documented only in `docs/`. The UI's own verbs are browse verbs, and the Assessment Tray (the deliverable engine) is invisible until *after* the user has already ticked a mapping. | `AssessmentTray.tsx:57-60`; `HomeHero.tsx:70-83`; `docs/UX-AUDIT-2026-07-11.md:72` |
| G3 | **Two different intended audiences, unreconciled.** `README.md` "Who Should Use This" leads with CISOs / security architects / red team leads; the v0.9.0 build was explicitly optimized for a second-line model-risk manager who is *"not a hands-on security engineer."* The README was never updated. | `README.md:33-35` vs `docs/UX-AUDIT-2026-07-11.md:5` |
| G4 | **"Who it is NOT for" is stated nowhere** in the repo. | — |
| G5 | **The differentiator is enacted but never argued.** No on-screen copy explains why a cited, provenance-stamped mapping beats a spreadsheet or an LLM answer. That framing exists only in the audit doc. | `docs/UX-AUDIT-2026-07-11.md:45,50-52,107` |
| G6 | **The per-risk "Governance:" prescription carries no on-screen caveat.** Its "editorial guidance, not a control requirement" qualifier lives only in a source comment; the rendered line makes an unhedged SR 11-7 claim. | `RiskDetail.tsx:27` (comment) vs `:97-101` (render) |
| G7 | **The Scenario Simulator has no user-facing caveat.** Its risk weights are "editorial estimates. Practitioner validation required" and its fact patterns are randomly generated — both disclosed only in engine code comments, nowhere in the UI. A visitor can plausibly read the simulator as saying something about *their* system. | `client/src/features/simulator/engine/mappings.ts:10,97` |
| G8 | **The category term is undefined for the reader.** "Compliance middleware" appears as a 10px eyebrow and in the first-run modal; nothing on screen tells a reader who has not read the README what that means or what the tool therefore is *not*. | `HomeHero.tsx:54-56`; `HookModal.tsx:114` |
| G9 | **`README.md` still describes a three-view app** ("The application provides three interactive views") — Overview, the two heatmaps, the Evidence Explorer, the Scenario Simulator, the Diagram Analyzer and the whole Assessment/export layer are all live but unlisted in the Features section. The README's own feature inventory is stale relative to v0.9.0. | `README.md:41-47` |

---

**FROZEN 2026-07-14 · SHA-256 of this file at seal time (excluding this line):** `048A43F299A3775CF7FBD68F268882DD7A07E88FD246EDF2257C35374C8181FF`

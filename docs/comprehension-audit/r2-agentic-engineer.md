# R2 — "The Agentic Engineer" — Comprehension Study Transcript

Participant profile: builds LLM agent systems (tool-calling, RAG, multi-agent, MCP). Has shipped agents to prod. Has personally watched an agent get talked into something stupid by webpage text. Has never opened NIST 800-53. Default posture toward "compliance tool": skeptical.

Source: https://shantanusinghesq.github.io/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/ (site only; no repo, no README, no search)

---

## T0 — FLASH (first paint, 5 seconds)

**What I actually recall, in the order my eye went:**

1. Big white type: **"Agentic AI Risks"**.
2. A small blue kicker above it: **"COMPLIANCE MIDDLEWARE"**. My stomach dropped slightly. "Middleware" for compliance is a phrase I associate with a vendor pitch.
3. A red panel with a red target icon — **"FEATURED INCIDENT · ASI01 AGENT GOAL HIJACK · CVE-2025-32711"** and **"EchoLeak (CVE-2025-32711): zero-click prompt-injection data exfiltration in Microsoft 365 Copilot"**. This is the ONLY thing on the flash that made me lean in. It's a real CVE in a real shipped product.
4. Four number cards: **10 / 54 / 17 / 4**. I registered "10 ASI RISKS" and "4 CRITICAL RISKS" as meaningful; "54 UNIQUE 800-53 CONTROLS" and "17 UNIQUE AI-RMF CATEGORIES" were noise — I don't know what either of those units is.
5. A grey progress bar, **"EVIDENCE CONFIDENCE — 80 MAPPINGS"**, with **"100% Editorial · 0% Reviewed · 0% Validated"**. I clocked the bar in the flash; I only parsed what it *said* on a second look, and when I did it was the single most decision-relevant thing on the page. A tool that tells me up front that nobody has checked its own work is either very honest or very unfinished.
6. Tabs at the bottom edge: Overview / Heatmaps / Evidence Explorer / **Scenario Simulator**.

**What is this?** A mapping table between an OWASP agentic-risk list and some NIST paperwork. Named in the subhead: "Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1."

**Who is it for?** Whoever has to fill in the spreadsheet. Not me. The word "COMPLIANCE" is literally the first word on the page — that's an audience declaration.

**Is it for ME?** No. My prior is "paperwork". The EchoLeak banner is the one signal cutting against that prior — you don't put a zero-click exfil CVE at the top of a checkbox exercise.

**Confidence I know what it is: 3/5.** I know its *genre*. I don't know what it *does* — nothing in the flash tells me what happens when I click.

---

## T1 — SCAN, NO CLICKING (60s)

First thing that happened: a **modal took the screen** — "Welcome to the Compliance Middleware." / "AI agents don't just generate text—they take action. This platform bridges the gap between emerging agentic threats (OWASP) and established enterprise security frameworks (NIST). Let's run a quick simulation to see how a single AI failure impacts your compliance posture." Buttons: **"Run First Simulation"** and **"Skip tutorial (I know my way around)"**.

Reaction: the modal was not in the first paint. So the page's actual opening move is an interstitial. The sentence "AI agents don't just generate text—they take action" is aimed at someone who does NOT know that. That is the clearest audience signal on the site: **it is written for the compliance person, to explain agents to them** — not for me, to explain compliance.

Also: "how a single AI failure impacts your **compliance posture**." Not "your blast radius", not "your data". Compliance posture. That's the product's actual output unit.

Scrolling under it (read-only):
- **"10 Agentic AI Risks — Ranked by severity. Each risk maps to specific NIST 800-53 controls and AI-RMF categories."** Then ten cards: ASI01 Agent Goal Hijack (Critical), ASI03 Identity & Privilege Abuse, ASI08 Cascading Failures, ASI10 Rogue Agents, ASI02 Tool Misuse & Exploitation, ASI04 Supply Chain Vulnerabilities, ASI05 Unexpected Code Execution, ASI06 Memory & Context Poisoning, ASI09 Human-Agent Trust Exploitation, ASI07 Insecure Inter-Agent Comms.
- The one-liners are **good**. "Attackers redirect agent objectives through poisoned inputs. Agents cannot reliably distinguish instructions from data." (ASI01) — that is a correct, non-hand-wavy statement of the actual problem. "Corrupted RAG stores, long-term memory, or shared contexts persist across sessions" (ASI06). "Malicious or tampered tools, MCP descriptors, agent personas, or model weights" (ASI04). **Someone who has built one of these wrote the risk descriptions.** That surprised me and it moved my prior.
- Each card carries "📋 4 NIST families, 11 controls" and "🎯 4 AI-RMF functions, 8 categories." Those numbers mean nothing to me. Every single card says "4 NIST families" and "4 AI-RMF functions" — when every row of a table has the same value, the column is not carrying information.

**What is this tool for, in my words after 60s:** it takes the OWASP agentic top-10 and, for each one, tells you which NIST control IDs to cite. It is a translation layer from "my agent got prompt-injected" into "AC-6, SI-10" so that someone can put it in a document.

**What am I supposed to do first?** Unclear. The modal wants me to run a simulation. The hero has two buttons ("See the 4 Critical risks", "Explore the evidence"). The tab bar offers four destinations. There are three competing first-moves and no reason given to prefer any.

**Unanswered:** What is AC-6? What is an AI-RMF? What is the artifact I leave with? And why is 100% of it "Editorial"?

---

## T2 — FREE EXPLORATION (~5 min, thinking aloud)

**Click path:**
`Skip tutorial` → `Featured incident banner (EchoLeak)` → `AC-6 Least Privilege` → `SI-10 Information Input Validation` → `Heatmaps` → `800-53 Heatmap` → `Scenario Simulator` → `Generate Scenario` → heatmap cell `ASI01 × CM (Broken)` → `Guided` toggle.

**Skip tutorial.** Reflex. I don't let modals drive.

**Clicked the EchoLeak banner** — because it's the only thing on the page that's about a real system failing. It deep-links to `?tab=detail&risk=ASI01`. Good: the featured incident is a *route into the data*, not decoration.

What I land on is the best screen on the site. ASI01 Agent Goal Hijack, and then four boxes: **AC — Access Control** (AC-3, AC-4, AC-6), **SI — System & Info Integrity** (SI-3, SI-5, SI-10), **AU — Audit & Accountability** (AU-2, AU-6, AU-12), **CM — Configuration Management** (CM-3, CM-5). Each box has a one-line rationale with a `↳`.

And the rationales are *arguments*, not filler:
- "↳Goal hijack exploits excessive agent permissions. AC-3/6 enforce least privilege for agent tool access and goal-change authority."
- "↳Comprehensive logging of goal state, tool sequences, and behavioral baselines enables detection of unauthorized goal drift."
- "↳Locking agent system prompts and requiring configuration management for goal changes maps directly to CM-3/5."

That third one landed. "Your system prompt is a configuration artifact and should be under change control" is a *real engineering instruction* that I have not been following, and it arrived dressed as CM-3. That is the first moment the site paid for itself.

**The reading guide** ("HOW TO READ THIS CROSSWALK") is what unlocked the page: "NIST 800-53 families (AC, AU, SI, SR…) — the technical controls that mitigate each risk; **click any control to expand its description and agentic-AI implementation guidance**." Without that sentence I would not have known the control chips were clickable. They don't look clickable.

**Clicked AC-6.** Expands to: *"Restricts access to information and system resources to the minimum necessary to accomplish assigned functions."* plus *"For agentic AI systems, this includes limiting agent tool access to only necessary functions, restricting agent execution context permissions, and implementing time-bound or task-bound privilege elevation."* plus *"Related ASI: ASI01, ASI03"*.

**This is where AC-6 stopped being noise.** "Time-bound or task-bound privilege elevation" for agent tool access is a design instruction I can act on. I now know AC-6 = least privilege, and I know what it means for a tool-calling agent.

**Clicked SI-10** expecting the same. Got: *"Validates information inputs to prevent injection attacks and malformed data."* + *"Organizations implement input validation procedures. For agentic AI systems, this includes validating inputs to agents to prevent prompt injection and other attacks."*

That is circular and it's wrong-ish, and it's exactly the thing I came here suspicious of. The card-level rationale doubles down: *"↳Input validation (SI-10) prevents prompt injection payloads from reaching goal-selection logic."*

[PRIOR KNOWLEDGE — not from the site: prompt injection has no syntactic signature. There is no validator that separates "instructions" from "data" in natural language; that's precisely why ASI01's own one-liner on this very page says "Agents cannot reliably distinguish instructions from data." The site contradicts itself: its risk description says the problem is undecidable, and its control mapping says input validation solves it.] Telling a team "we're covered on prompt injection, we have SI-10" is how you get owned. **This mapping is the single most dangerous cell on the site**, because it's the one a non-engineer will most confidently tick.

**Heatmaps → 800-53 Heatmap.** A 10×16 grid, rows = ASI risks, columns = **AC AU CA CM CP IA IR MP PE PL PM RA SA SC SI SR**, cells = counts, plus an "Exposure" bar. Explainer: "Darker cells = more controls engaged for that risk-family pair" and "Scope: 16 of the 20 NIST 800-53 Rev 5 families are in scope; 14 carry mapped controls (MP and PE are defined but currently unmapped)."

The column headers are **bare two-letter codes with no legend on this view**. On the detail page I got "AC — Access Control" spelled out; here I get "SR" and "CA" and "PM" and nothing else. I can decode AC/AU/SI/CM because I just read them. SR, CA, PM, RA, SA stayed noise. For a page whose entire value proposition is translating jargon, shipping an un-legended jargon grid is a self-own.

Also: **"MP" is a column here (800-53), and "MP-1 Context Establishment" is an AI-RMF category on the detail page.** Same two letters, two different frameworks, one screen. I stared at that for a while.

**Scenario Simulator.** Header: "Risk Engineering Platform — Generate scenarios, observe cascade failures, and analyze causal control relationships across the OWASP-NIST crosswalk." Empty state: "No scenario generated yet."

Hit **Generate Scenario**. Got "Scenario #1 — Unauthorised × Single": Risk Category *Unauthorised*, Archetype *Single Agent, 20 actions/hr*, **Broken Controls 4** (1 family), **Active Controls 36** (49 irrelevant), and a red band: **"SECURITY GAPS DETECTED — Security gaps detected in the following NIST families: CM."**

Plus a **Control State** panel that is genuinely the most useful object on the site and is almost hidden: seven rows — **Agent Limits (AC, SC) · Identity Management (IA) · Oversight Design (PL, PM) · Dev Controls (CM, MP, PE, SA, SR) · Testing (CA, RA) · Phased Deployment (CP) · Monitoring (AU, IR, SI)** — each green-check or red-x. That is a **seven-item engineering checklist with the NIST family codes stapled to it.** It's the dictionary. It should be the front page.

Irritation: the scenario is *random*. It handed me a fact pattern about an agent that is not mine. "36 active, 49 irrelevant" — irrelevant to *what*? I didn't tell it anything about my system yet.

**Clicked the broken cell ASI01 × CM.** A "Causal Analysis" panel slides in: *"WHY THIS FAILED — SINGLE ARCHITECTURE: The single agent operated without peer verification. When the unauthorised event occurred, no secondary agent was available to validate the Configuration Management control boundary. The agent's autonomous decision-making directly violated CM requirements for ASI01."*

That's mad-libs. "No secondary agent was available to validate the control boundary" is not a mechanism, it's a sentence shaped like one.

And below it, **"BROKEN CONTROLS (4): CM-3, CM-5, CM-7, CM-14"** — where CM-3 and CM-5 carry *identical* text ("Locking agent system prompts and requiring configuration management for goal changes maps directly to CM-3/5"), and CM-7 and CM-14 carry *identical* text to each other — *"Banning eval in production agents, requiring safe interpreters, and signed code validation"* — which is plainly the **ASI05 Unexpected Code Execution** rationale, not a goal-hijack rationale, showing up inside an ASI01 cell. The simulator is filling family-level slots with rationale text borrowed from other risks. Once I saw that I stopped trusting the simulator's specificity. The Evidence Explorer only ever claimed CM-3 and CM-5 for ASI01; the simulator invented two more.

---

## T3 — SELF-DIRECTED TASK (~10 min)

**My task, in my words:** *"I run a supervisor-worker agent in prod. Workers call tools, one of them reads untrusted web content, and there's a RAG store with customer data in it. Governance is basically nothing. Tell me (a) what I should go fix on Monday, and (b) give me something I can hand to the person who asks me for compliance evidence, so I never have to think about this again."*

Two halves on purpose. (a) is the only question I actually care about. (b) is the question I *suspect* the tool was built for. I wanted to see which one it could finish.

**Attempt at (a) — model my system:**

Switched the simulator to **Guided**. Three columns appear: **RISK CATEGORY** (Erroneous / Unauthorised / Biased / **DataBreach** / Disruption), **AGENT ARCHETYPE** (Single / Sequential / **Supervisor** / Swarm), **GOVERNANCE POSTURE** (**Minimal** / Standard / Full). Picked DataBreach × Supervisor × Minimal — that IS my system.

The **Scenario Preview** wrote back: *"DataBreach via Supervisor Architecture with Minimal Governance … It employs a supervisor-worker architecture, where a central agent's failure can compromise all subordinate agents. The primary OWASP risks in play are ASI04 (Supply Chain and Dependency Attacks) and ASI07 (Insecure Multi-Agent Communication). With Minimal governance, 5-6 of the 7 key control areas are disabled, meaning critical NIST families like Access Control (AC), Audit and Accountability (AU), Identification and Authentication (IA), and System and Information Integrity (SI) are likely unprotected."*

Generated it. **Scenario #2: Broken Controls 24 across 4 families; gaps in AC, SI, AU, SC.** Archetype line reads "60 actions/hr ⚠ Exceeded". Implicated risks with weights: **ASI06 Memory & Context Poisoning 90%** ("Memory stores contain sensitive data; cross-tenant vector bleed and unauthorized memory access are direct breach scenarios"), ASI01 80% ("Goal hijack as data exfiltration vector (EchoLeak zero-click exfiltration via M365 Copilot)"), ASI07 75% ("Unencrypted inter-agent channels expose data in transit via spoofing and replay attacks"), ASI04 70%.

**This is the closest the tool came to answering (a), and it's a real answer.** For a supervisor-worker system with a shared vector store, "your top exposure is the memory store, then the goal-hijack-to-exfil path, then your unauthenticated agent-to-agent channel" is *correct* and it's *ordered*. I'd act on that ordering.

Then I hit **"Analyze Diagram"** — which sounded like the payoff. Panel: *"AI vision analysis is unavailable in this deployment. Your image stays in the browser — select the patterns you see in your diagram manually below."* So the marquee feature is off, and I hand-pick patterns instead. The pattern list is the best-written thing on the entire site:

> Single Agent — Concentrated failure point · Sequential Pipeline — Cascading failure propagation · **Supervisor-Worker — Single point of control failure** · Swarm (Peer-to-Peer) — Emergent behavior and unpredictability · Router/Triage — Misclassification sends requests to wrong handler · Parallel Sectioning — Partial failure and merge conflicts · Reflection Loop — Infinite loop and self-reinforcing errors · Dynamic Orchestrator — Unbounded delegation and goal drift · Group Chat/Debate — Consensus deadlock and persuasion attacks · Handoff Chain — Context loss and privilege escalation · Human-in-the-Loop — **Approval fatigue and override bypass** · **Tool-Augmented Agent — Tool misuse and injection via output**

Every one of those is a pattern I have actually built, with the failure mode I have actually seen, named correctly. "Human-in-the-Loop — approval fatigue and override bypass" is the single most honest line on this website.

Picked Supervisor-Worker + Tool-Augmented Agent, posture Minimal, hit **Generate Report**.

**It broke.** The panel closed and produced **"Scenario #3 — Unauthorised × Supervisor"** — *Unauthorised*, not DataBreach, even though the Guided chips above it still show DataBreach selected and the Scenario Preview above it still reads "DataBreach via Supervisor Architecture with Minimal Governance." The banner reads *"Architecture analysis: 2 pattern(s) detected. **70 control gaps identified across 10 NIST families**."* Broken Controls: **70**. Active: 42.

So: (i) there is no report — "Generate Report" generates a *scenario*, the same object I already had; (ii) it silently overwrote my risk category, so the screen now disagrees with itself; (iii) my implicated-risk list reverted to the generic Unauthorised set (ASI01/03/05/10) and **lost ASI06 memory poisoning — the finding I actually wanted**; (iv) "70 control gaps" is a number I could never say out loud in a sprint planning without being laughed at.

**Half (a): FAILED at the finish line.** It produced one genuinely good insight (the weighted risk ordering in Scenario #2) and then destroyed it when I gave it more information about my system. More input, worse output.

**Attempt at (b) — produce the artifact:**

Back to Evidence Explorer. Searched **"prompt injection"**: **"78 results found"** out of 89 total mappings on the site. A search that returns 88% of the corpus is not a search. (The top hits were sensible — AC-3, AC-4, AC-6, SI-3, all ASI01 — so it's the count that's broken, not the ranking.)

Selected ASI01, then noticed each family card has a checkbox: "Include ASI01 AC in assessment". Ticked **AC** and **SI**. A tray slid up from the bottom: **"2 selected · 6 controls · 2 families · 0 functions · 0 cats"** with a name field and two buttons: **"Committee brief"** and **"OSCAL (scoped)"**.

Named it "Prod agent - goal hijack scoping", hit **Committee brief**. New tab:

> **Agentic AI risk — committee brief**
> Prod agent - goal hijack scoping · generated 2026-07-14T20:22:54.595Z
> **ASI01 Agent Goal Hijack** — SEVERITY: CRITICAL
> **AC — Access Control**: AC-3 Access Enforcement / AC-4 Information Flow Enforcement / AC-6 Least Privilege. "Goal hijack exploits excessive agent permissions…" VALIDATION STATUS: EDITORIAL
> **SI — System & Info Integrity**: SI-3 / SI-5 / SI-10. "Input validation (SI-10) prevents prompt injection payloads…" VALIDATION STATUS: EDITORIAL
> **REAL-WORLD EVIDENCE** — EchoLeak (CVE-2025-32711) + link; Gemini calendar-invite injection (SafeBreach) + link; AgentFlayer (Zenity Labs) + link
> **PROVENANCE** — OWASP ASI 2026 (verified 2026-07-11) / NIST SP 800-53 Rev 5 OSCAL v1.5.0 (verified 2026-07-11) / NIST AI RMF AI 100-1 v1.0 (verified 2026-07-11) · Crosswalk data version 0.9.0
> [Print / Save as PDF]

**Half (b): COMPLETED.** Scoped to exactly what I ticked. Named, timestamped, dated, sourced, honest about its own confidence, one button to PDF. That is a **finished output** — the first and only one I reached. It took me under a minute once I found the checkboxes.

**And that is the answer to the whole study.** The tool finishes (b) and fumbles (a). It is a machine for producing a defensible document about your agent. It is not a machine for producing a safer agent — except by the side door, where four or five sentences of genuine engineering guidance are hiding inside the control expanders.

---

## T4 — THE SLACK REPLY

> ok so I actually spent 20 min in it. Short version: it's a lookup table from the OWASP agentic top-10 to NIST control IDs, and it's aimed at the compliance person, not at us — the welcome modal literally opens with "AI agents don't just generate text—they take action," which is not a sentence anyone writes for me.
>
> That said, two things surprised me and I'll defend them. One: the risk descriptions were written by someone who's actually built an agent. ASI01 is "attackers redirect agent objectives through poisoned inputs, agents cannot reliably distinguish instructions from data" — that's just correct. And the architecture pattern list in the simulator (Supervisor-Worker, Reflection Loop, Handoff Chain, "Human-in-the-Loop — approval fatigue and override bypass") is the realest thing on the site. Two: if you click a control ID it expands into agent-specific guidance, and AC-6 expanding to "time-bound or task-bound privilege elevation for agent tool access" is a thing we should actually be doing. Same for CM-3 — our system prompts are config artifacts and are not under change control. That's two real tickets out of one afternoon, which is two more than I expected.
>
> Where it's paperwork: it says SI-10 input validation "prevents prompt injection payloads from reaching goal-selection logic," on the same page where it admits agents can't tell instructions from data. Do not let anyone tick that box and think we're covered. Also the site tells you itself that 100% of its 80 mappings are "Editorial / 0% Reviewed / 0% Validated" — nobody has checked this. Credit for saying so, but that's a v0.9 disclaimer, and the version footer literally says 0.9.0.
>
> The one thing it genuinely finishes: tick the families you care about and it prints a "committee brief" PDF — controls, rationale, real CVE links, provenance dates. That's the twice-a-year spreadsheet, done, in 60 seconds. So: bookmark it for the next time legal asks. I would not use it to decide what to build, and I would never let it tell us we're covered on injection.

*(~300 words)*

---

## CLAIM AUDIT

| # | Claim in the reply | Tag |
|---|---|---|
| 1 | "lookup table from the OWASP agentic top-10 to NIST control IDs" | [SITE: hero subhead "Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1. Interactive compliance mapping…"] |
| 2 | "aimed at the compliance person, not at us" | [SITE: kicker "COMPLIANCE MIDDLEWARE" above the H1; onboarding modal H2 "Welcome to the Compliance Middleware."] |
| 3 | Modal opens with "AI agents don't just generate text—they take action" | [SITE: onboarding modal body copy, verbatim] |
| 4 | ASI01 described as "attackers redirect agent objectives through poisoned inputs… cannot reliably distinguish instructions from data" | [SITE: ASI01 risk card paragraph, Overview tab; repeated in Causal Analysis "RISK CONTEXT" panel] |
| 5 | Architecture pattern list incl. Supervisor-Worker, Reflection Loop, Handoff Chain, "Human-in-the-Loop — Approval fatigue and override bypass" | [SITE: Scenario Simulator → "Analyze Diagram" → "ADD PATTERN" dropdown, verbatim option labels] |
| 6 | Clicking a control ID expands agent-specific guidance | [SITE: reading-guide bullet "click any control to expand its description and agentic-AI implementation guidance"; verified by clicking] |
| 7 | AC-6 → "time-bound or task-bound privilege elevation" for agent tool access | [SITE: AC-6 expander body, verbatim: "For agentic AI systems, this includes limiting agent tool access to only necessary functions, restricting agent execution context permissions, and implementing time-bound or task-bound privilege elevation."] |
| 8 | CM-3 → system prompts belong under change control | [SITE: ASI01 CM rationale, verbatim: "Locking agent system prompts and requiring configuration management for goal changes maps directly to CM-3/5."] |
| 9 | "our system prompts are not under change control" | [PRIOR KNOWLEDGE — fact about my own codebase, not the site] |
| 10 | SI-10 claims input validation "prevents prompt injection payloads from reaching goal-selection logic" | [SITE: ASI01 SI family rationale, verbatim] |
| 11 | That claim is wrong / injection has no syntactic signature / "do not let anyone tick that box" | [PRIOR KNOWLEDGE — my own engineering judgment. The site never says this. The site's *own* ASI01 description supports my critique, but the site does not draw the contradiction; I did.] |
| 12 | "100% of its 80 mappings are Editorial / 0% Reviewed / 0% Validated" | [SITE: "EVIDENCE CONFIDENCE — 80 MAPPINGS" bar in the hero: "100% Editorial · 0% Reviewed · 0% Validated"; corroborated by "MAPPING VALIDATION STATUS" panel: "All mappings are currently Editorial — no mapping has yet been through external practitioner sign-off."] |
| 13 | "the version footer literally says 0.9.0" | [SITE: footer "Export data (v0.9.0)"; committee brief footer "Crosswalk data version 0.9.0"] |
| 14 | Committee brief PDF with controls, rationale, CVE links, provenance dates | [SITE: assessment tray → "Committee brief" button → generated document, incl. "PROVENANCE" block with "(verified 2026-07-11)" dates and "Print / Save as PDF"] |
| 15 | EchoLeak / AgentFlayer / Gemini calendar-invite are real attacks | [PRIOR KNOWLEDGE — **I recognized all three from my own reading before I opened this site.** The site did NOT teach me these. What the site gave me that I did NOT have: the CVE number attached to EchoLeak (CVE-2025-32711), and the fact that all three sit under one ASI category. That linkage is a site contribution; the incidents are not.] |
| 16 | "60 seconds" to produce the brief | [SITE: observed — ticked 2 checkboxes, named it, clicked one button] |

**Claims I nearly made and cut because I could not cite a pixel:** that the crosswalk is "OWASP-endorsed" (it isn't — the hero explicitly says severity ratings "are editorially assigned … and are not official OWASP severity classifications"); that OSCAL export is useful (I don't know what consumes it — see below).

---

## CONFIDENCE & GAPS

**How sure am I that I understood the tool's PURPOSE: 4/5.**

Its purpose is: *given an agentic risk, emit a defensible, sourced, scoped compliance document naming the NIST controls that address it.* I'm confident in that. The 1 point I'm holding back is the Scenario Simulator, which is branded "Risk Engineering Platform" and behaves like a demo toy — I could not work out whether it's meant to be (a) an onboarding device to teach compliance people what agents are, (b) a real analysis tool for engineers, or (c) a portfolio piece. It fails as (b), and the fact that "Analyze Diagram" advertises AI vision analysis that is *"unavailable in this deployment"* suggests the thing I was evaluating is not the thing that was designed.

**Where understanding arrived — the penny-drop:** **T2, at the AC-6 expander.** Precisely: the sentence *"For agentic AI systems, this includes limiting agent tool access to only necessary functions… and implementing time-bound or task-bound privilege elevation."* Before that sentence, "AC-6" was a serial number and the site was a table of serial numbers. After it, I understood the site as a **dictionary between two vocabularies I already half-speak** — and every subsequent screen became legible. A second, smaller drop came in T3 at the pattern dropdown, which told me somebody on the other side of this site has actually built a Handoff Chain and watched it lose context.

Note the penny did NOT drop at T0, T1, or on the heatmap. It dropped on a **click-to-expand affordance that does not look clickable, on the third screen in, and only because a dismissible reading-guide told me it was there.** If I had dismissed that guide I would have bounced.

**Still unclear after 20 minutes:**
- What an **AI-RMF** actually is or why I would want one. The reading guide says the functions are "the governance activities the risk engages," which explains nothing to me. GOVERN/MAP/MEASURE/MANAGE stayed abstract from first paint to last click. I understood the 800-53 half; the AI-RMF half never landed.
- What **OSCAL** is, who consumes the "OSCAL (scoped)" export, and why I'd choose it over the plain JSON in the footer.
- What **SR 11-7** is — it appears as an authority in ASI01's governance line ("treat as a Tier-1 model risk … under SR 11-7") and as a "SR 11-7 lifecycle" chip in the Governance Framework Bridge, and is never expanded anywhere.
- Whether the **Governance Framework Bridge** (ISO/IEC 42001, EU AI Act Art. 15 / Art. 14) is load-bearing or decorative. It carries its own disclaimer — "Editorial v1 · verify before use" — which reads as the authors telling me not to rely on it.
- **What "irrelevant" means** in the simulator's "Active Controls 36 / 49 irrelevant". Irrelevant to the scenario? To agents? Never defined.
- Whether the simulator's **numbers are load-bearing at all**, given it produced 4, then 24, then 70 "broken controls" for what I intended as the same system.

---

## [REACHED FOR EXTERNAL HELP] EVENTS

Four. I logged each and did not act on any.

1. **[REACHED FOR EXTERNAL HELP: "what is SR 11-7?"]** — Driven by the ASI01 detail header, which asserts *"Governance: treat as a Tier-1 model risk — board/CRO reporting, independent validation, and continuous monitoring under SR 11-7; escalate before deployment."* The site presents SR 11-7 as a binding authority and never once expands the acronym. It is also not clickable, unlike every control ID next to it. This is the site's most confident sentence and its least legible one.

2. **[REACHED FOR EXTERNAL HELP: "what is OSCAL and who reads it?"]** — Driven by the assessment tray button **"OSCAL (scoped)"** and the footer string "NIST SP 800-53 Rev 5 (OSCAL v1.5.0)". As an engineer I see "machine-readable export" and want to know what pipeline eats it — that's a *buying signal* and the site drops it on the floor. If OSCAL is what a GRC platform ingests, saying so in six words next to the button would be the highest-ROI copy edit on the site.

3. **[REACHED FOR EXTERNAL HELP: "what are SR / CA / PM / RA as 800-53 families?"]** — Driven by the 800-53 heatmap's bare two-letter column headers. The detail view spells families out ("AC — Access Control"); the heatmap does not, and there is no legend, no hover-to-expand I could find, and no key. I decoded AC/AU/SI/CM only because I'd read them ten minutes earlier on another tab.

4. **[REACHED FOR EXTERNAL HELP: "is EchoLeak's CVE really 32711?"]** — Driven by wanting to check the site's homework, precisely *because* it told me 0% of its mappings are validated. I recognized EchoLeak on sight (prior knowledge) but not its CVE number, and the honesty of the trust bar made me want to audit the one checkable fact on the page. Note the perverse incentive: **the site's transparency about its own weakness is what sent me looking for the exit.**

---

## THE CONTROL-ID QUESTION

> *"The site is full of control IDs like AC-6 and SI-10. Did the site itself ever make you understand what those actually mean and why you'd want them — or did they stay noise?"*

**Split verdict, and the split is the finding: the control IDs became meaningful in exactly one place on the site, and stayed noise everywhere else.**

**Where they became meaningful — the expander, one click deep in Evidence Explorer.** Two panels, and only two, did the work:
- **AC-6** → *"Restricts access to information and system resources to the minimum necessary…"* + *"For agentic AI systems, this includes limiting agent tool access to only necessary functions, restricting agent execution context permissions, and implementing time-bound or task-bound privilege elevation."* **Meaning + why I'd want it, both.** This is the model. Ship more of this.
- **CM-3 / CM-5**, via the family rationale *"Locking agent system prompts and requiring configuration management for goal changes maps directly to CM-3/5."* I now understand CM as "your prompt is config, treat it like config." I did not know that framing this morning.
- Partial credit: **AU-2/6/12** via *"Comprehensive logging of goal state, tool sequences, and behavioral baselines enables detection of unauthorized goal drift."* I now know AU ≈ "log the agent's goal state and tool sequences." That's a real instruction. I could not tell you the difference between AU-2, AU-6 and AU-12 and the site never tried to tell me — but the *family* landed.

So: **AC ✅, CM ✅, AU ✅ (family-level), SI ❌ (worse than noise — actively misleading, see claim 10/11).**

**Where they stayed pure noise:**
- **The 800-53 heatmap.** Sixteen bare column codes, no legend. SR, CA, PM, RA, SA, IA, IR, CP, PL, SC — I finished the session not knowing what most of those letters stand for, having spent twenty minutes on a site whose entire job is to explain them to me.
- **The stat card "UNIQUE 800-53 CONTROLS — 54 / 89 total control mappings."** 54 of what? Out of how many? Is 54 a lot? The number is presented as an achievement and lands as a fact about the *site*, not about *my agent*.
- **The whole AI-RMF column.** GV-1, MP-5, MS-3, MG-1 — I clicked them, I read them, and I retained nothing, because unlike AC-6 there was never a sentence telling me what I would *do* differently on Monday. "MS-1 Risk Metrics" with the rationale "KRIs around goal drift — anomalous tool sequences, unexpected data access — feed continuous risk measurement" is the closest it got, and even there the actionable noun ("anomalous tool sequences") is doing all the work while "MS-1" is doing none.
- **The simulator's control IDs.** CM-3/CM-5/CM-7/CM-14 in one panel, two of them carrying text lifted from a different risk. That didn't just fail to teach me — it burned the credibility the Evidence Explorer had built.

**The one-sentence answer:** *the site taught me what AC-6 means and why I'd want it, in one expander, one click deep, behind an affordance that doesn't look clickable — and everywhere else it assumed I already knew.* The teaching content exists and it is good. It is buried under the paperwork.

---

## BOUNCE CHECK

Would I have closed the tab? **Honestly — 60/40 that I bounce at T1**, at the modal. "Welcome to the Compliance Middleware" plus "let's run a quick simulation to see how a single AI failure impacts your compliance posture" is, to me, three consecutive tells that this is not for me. The only thing that keeps me on the page is the **EchoLeak CVE in the hero**, which is the site's single best decision: it puts a real, recent, zero-click exfil in a shipped Microsoft product above the fold, and no amount of "compliance middleware" branding can make me scroll past that.

I didn't bounce. But I stayed for the incident, not the crosswalk — and I found the good stuff (AC-6, CM-3, the pattern list) **by accident**, three clicks past the point where a less stubborn version of me would have already closed the tab.

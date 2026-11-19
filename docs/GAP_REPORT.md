# Gap report — public sources checked 2026-11-19

This note records disagreements between the crosswalk's evidence placement and public primary sources, the ASI risks whose evidence is still thin, the AI-RMF subcategories this package defines but does not cite, and four **proposed** implementation notes. Nothing in this file was applied to `CROSSWALK` mappings. No NIST control row and no AI-RMF row was added or moved.

Every URL below was fetched on 2026-11-19. Scores and titles are taken from those pages, not from memory.

Sources used:

- NVD CVE-2025-32711 JSON record (published 2025-06-11, last modified 2026-06-17): https://nvd.nist.gov/vuln/detail/CVE-2025-32711 — API `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2025-32711`
- Reddy and Gujral, "EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System," arXiv:2509.10540v1, submitted 6 Sep 2025: https://arxiv.org/abs/2509.10540
- OWASP Top 10 for Agentic Applications 2026 (Version 2026, December 2025, file title `OWASP Top 10 for Agentic Applications 2026 12.6.docx`, CC BY-SA 4.0): https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/ and https://genai.owasp.org/download/52117/
- Invariant Labs, "GitHub MCP Exploited: Accessing private repositories via MCP," 2025-05-26: https://invariantlabs.ai/blog/mcp-github-vulnerability
- Compact-Bench, arXiv:2610.31710: https://arxiv.org/abs/2610.31710
- NIST SP 800-53 Rev 5, Update 1: https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final
- Control titles below are the Rev 5 titles in the vendored OSCAL index (`packages/crosswalk/src/oscal-index.ts`), generated from https://raw.githubusercontent.com/usnistgov/oscal-content/v1.5.0/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json

## 1. Mapping disagreements

These are disagreements about **which ASI an incident substantiates**. The 800-53 and AI-RMF rows were not edited. Where this pull request adds a citation, it adds it under one ASI and says so here.

### EchoLeak / CVE-2025-32711 — do not treat the case study as ASI06

The OWASP PDF does two different things with this case.

- Printed page 10, under **ASI01** attack scenarios, describes EchoLeak as a zero-click email that makes Microsoft 365 Copilot exfiltrate confidential emails, files, and chat logs.
- The same page's ASI01 description separates ASI01 from ASI06: ASI06 is "the persistent corruption of stored context or long-term memory."
- Appendix D, printed page 47, tags the May 2025 EchoLeak row **ASI01, ASI02, and ASI06**. The row's links are Microsoft, NVD, and Aim Security.

NVD's English description is: "Ai command injection in M365 Copilot allows an unauthorized attacker to disclose information over a network."

| Scorer | CVSS 3.1 | Vector | Base |
|---|---|---|---|
| NIST (`nvd@nist.gov`, type Primary) | 7.5 HIGH | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N` | scope unchanged, confidentiality high, integrity none, availability none |
| Microsoft CNA (`secure@microsoft.com`, type Secondary) | 9.3 CRITICAL | `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:L/A:N` | scope changed, confidentiality high, integrity low, availability none |

Weakness on the NVD record: CWE-74, source Microsoft. NVD lists two references: the MSRC update guide and `https://www.aim.security/lp/aim-labs-echoleak-m365`. On 2026-11-19 the Aim Labs URL returned HTTP 403 and was not used. The MSRC URL returned HTTP 200; the advisory body is client-rendered and was not extracted, so no patch detail is taken from MSRC.

arXiv:2509.10540v1 is a case study of already-public reporting. The authors state they did not reproduce the attack or run experiments, and that they did not comprehensively evaluate the mitigations they list. The attack chain they describe is a crafted email pulled into Copilot, a bypass of link redaction with reference-style Markdown, an image the chat UI fetches automatically, and a Microsoft Teams URL allowed by the content-security policy. The PDF text of v1 contains no occurrence of the word "memory." "Chat" appears as the chat UI that renders the reply, not as a write into stored chat history.

**What the data does.** EchoLeak stays on **ASI01**, which already had a secondary write-up. This change adds the NVD record and the arXiv case study there. It does **not** add the incident to ASI02 or ASI06.

**Proposal for the maintainer, not applied.** ASI02 is a reasonable second citation: the exfiltration uses an allowed fetch path (the chat client and the Teams proxy) to carry data out. ASI06 is not supported by the case study. File it as memory poisoning only if a public source documents a write into stored memory. This case study does not.

### GitHub MCP public-issue leak — cited under ASI02 only

Appendix D, printed page 48, tags "GitPublic Issue Repo Hijack" (May 2025) as **ASI01, ASI02, ASI06, ASI07, and ASI08**, with a link to Invariant Labs.

The Invariant Labs post (2025-05-26) describes a different, narrower chain: the user has the official GitHub MCP server connected to their account; an attacker opens a malicious issue on a public repository; a benign request to look at open issues pulls that issue into context; the agent then reads a private repository and opens a public pull request containing that data. The post does not describe a write into long-term memory, an agent-to-agent channel, or a cascade across agents.

**What the data does.** The Invariant URL is added under **ASI02** only (a legitimate GitHub tool used to leak data). The PDF's ASI06, ASI07, and ASI08 tags were not copied in.

**Proposal, not applied.** ASI01 is also supported by the same post (hidden instructions in the issue redirect the task). ASI03 — the agent uses its own GitHub authorization, a confused deputy — is a plausible additional filing the PDF does not use. Neither was applied.

### Other Appendix D tags that are wider than this repo's evidence placement

Not moved. Listed so a later edit does not "correct" them silently.

| Appendix D row (printed page) | PDF ASI tags | Where this repo cites it |
|---|---|---|
| Amazon Q prompt poisoning, Jul 2025 (p. 46). PDF links AWS and NVD; it does not print a CVE id | ASI01, ASI02, ASI04 | ASI04 only (ReversingLabs write-up). No CVE was added: an NVD keyword search for this incident did not return a record in this pass, and none is invented here |
| Malicious MCP server impersonating postmark-mcp, Sep 2025 (p. 46) | ASI02, ASI04, ASI07 | ASI04 only (Koi Security write-up) |
| Replit vibe-coding meltdown, Jul 2025 (p. 46; the ASI10 bullet continues at the top of p. 47) | ASI01, ASI09, ASI10 | ASI05 only (The Register, 21 Jul 2025) |

## 2. ASI risks with thin evidence

"Thin" here means the evidence items are secondary write-ups, with no NVD record and no paper, or the same URL is reused. It is not a claim that the risk is unobserved.

### ASI01 — was thin; primary sources are now attached

Before this change ASI01 had three incident posts (The Hacker News, SafeBreach, Zenity Labs) and no NVD URL. The Hacker News item names CVE-2025-32711 but is not the NVD record. The NVD record, arXiv:2509.10540, and Greshake et al. (arXiv:2302.12173, submitted 23 Feb 2023) are now on ASI01. The three earlier posts remain.

What is still missing on ASI01: a public source for the SafeBreach and Zenity incidents that is an NVD record or a paper. Those two stay as vendor write-ups.

### ASI04 — still thin

ASI04's four items are practitioner write-ups: ReversingLabs (Amazon Q extension prompt), Invariant Labs (MCP tool poisoning), Koi Security (postmark-mcp), and Noma Security (AgentSmith). None is an NVD record. None is an arXiv paper.

Two public papers that show up next to supply-chain discussions were **not** added here, because they document a different failure:

- Carlini et al., "Poisoning Web-Scale Training Datasets is Practical" (arXiv:2302.10149), is about poisoning training corpora. The OWASP PDF treats static dependency and training-data issues as the LLM Top 10 case, and ASI04 as malicious or altered agent components (tools, prompts, MCP servers, registries).
- PoisonedRAG (arXiv:2402.07867) and AgentPoison (arXiv:2407.12784) poison a retrieval corpus or agent memory. They were added under **ASI06**, which is where a stored-knowledge write belongs. A third-party RAG index seeded upstream can also be an ASI04 example in the PDF (ASI04, common examples). That dual label was not applied.

NIST AI 600-1 (July 2024; https://doi.org/10.6028/NIST.AI.600-1, PDF https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) names content provenance as one of four focus areas of the Generative AI Profile, alongside governance, pre-deployment testing, and incident disclosure. That is a provenance control for generated content. It is not a documented compromise of an agent tool or MCP server, so it was not added as ASI04 evidence.

**Proposal, not applied.** If a maintainer confirms an NVD entry for the Amazon Q extension incident or for the postmark-mcp package, add that CVE under ASI04 with the NVD URL and the score the record actually prints.

### Also thin, not the focus of this pass

ASI07's first two items share one URL (a Microsoft GitHub markdown of the ASI07 scenario). Neither is an NVD record. ASI08's items are two arXiv papers plus the Google SRE chapter on cascading failures; there is no incident write-up. Those were left as they are.

## 3. AI-RMF subcategories not yet referenced

This package defines 19 subcategories in `AI_RMF` and `NIST_AI_RMF_DESCRIPTIONS`. The integrity check T16 allows exactly two description keys to be uncited by any `CROSSWALK` `aiRmf` mapping. Both are still uncited. They were not wired in.

| Id | Taxonomy name | Notes |
|---|---|---|
| GV-3 | Workforce Diversity | The description record lists `relatedASI` of ASI01, ASI03, and ASI10, but no mapping cites GV-3. The description pointer and the mapping are out of step. |
| MS-4 | Measurement Effectiveness | `relatedASI` is empty. No mapping cites MS-4. |

The other 17 subcategory ids appear in at least one ASI mapping.

## 4. Candidate implementation notes — proposals, not mappings

These four controls are **proposals for the maintainer**. They are not rows in `CROSSWALK`. They are not claims that NIST already maps them this way.

Public measurement that motivates the question, and does not answer it: Compact-Bench (arXiv:2610.31710) reports that LLM summaries of coding-agent history retain at most **16.0%** of recurring details, compared with **79.1%** for mechanical extraction (abstract, retrieved 2026-11-19). That paper measures task-detail retention under summarization. It does not test an adversary, and it does not test safety-constraint retention. A related public design, not a mapping, is CaMeL (arXiv:2503.18813, "Defeating Prompt Injections by Design"): control flow is taken from the trusted query so untrusted retrieved data cannot change it, and tool calls are checked by capabilities.

| Proposal | What it would do | Candidate Rev 5 controls (not applied) | Already cited nearby |
|---|---|---|---|
| Pinned trust region | System instructions, tool definitions, and safety constraints stay in a region the agent cannot rewrite and that compaction cannot drop | **AC-6** Least Privilege (the agent is not granted authority to change its own constraints); **CM-3** Configuration Change Control (a change to that region is a configuration change) | AC-6 is already on ASI01, ASI02, ASI03, and ASI05 for tool and execution privilege, with a different rationale. CM-3 is already on ASI01 and ASI04 for prompt and component pinning |
| Verbatim constraint re-injection | After a summary or compaction, the original constraint text is inserted again, not a paraphrase | **SI-10** Information Input Validation (the constraint is re-supplied as a checked input); **SI-7** Software, Firmware, and Information Integrity | SI-10 is on ASI01, ASI05, and ASI07. SI-7 is on ASI04, ASI05, and ASI06 |
| Append-only audit log | Every memory write is logged, and the agent that is the subject of the log cannot edit it | **AU-2** Event Logging; **AU-9** Protection of Audit Information | AU-2 is already on ASI01, ASI02, ASI03, ASI06, ASI07, ASI09, and ASI10. AU-9 is in the OSCAL index and is not referenced by any mapping |
| Trust tags | Each context segment is tagged (system, user, tool source, or agent). Text merged from several segments inherits the lowest trust | **AC-16** Security and Privacy Attributes; **AC-4** Information Flow Enforcement | AC-4 is on ASI01 and ASI06. AC-16 is in the OSCAL index and is not referenced by any mapping |

AC-6, SI-10, and AU-2 are the three controls to review first. CM-3, SI-7, AU-9, AC-16, and AC-4 are the similar controls whose Rev 5 titles match the proposal. Adding any of them, or changing a rationale to cover these mechanisms, is a mapping change and needs its own editorial pass.

# Evidence Audit — WS7 Structured-Evidence Migration

All 33 real-world evidence references backing the 10 OWASP ASI risks were
web-researched and adversarially verified on **2026-07-11**. Every reference
resolves to a live source URL and/or CVE identifier; **0 are unverifiable**
(0/33 lacking a machine-resolvable reference).

This table documents the migration from the pre-WS7 single prose `evidence`
string to the structured `EvidenceItem[]` model (`packages/crosswalk/src/data.ts`),
mapping each original prose reference to its verified structured record.

| ASI | Original reference | Title | Type | Source (URL) | CVE | Verified date |
| --- | --- | --- | --- | --- | --- | --- |
| ASI01 | EchoLeak zero-click exfiltration via M365 Copilot | EchoLeak (CVE-2025-32711): zero-click prompt-injection data exfiltration in Microsoft 365 Copilot | incident | [link](https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html) | CVE-2025-32711 | 2026-07-11 |
| ASI01 | Calendar invite goal-lock drift | Invitation Is All You Need: Gemini calendar-invite prompt injection (SafeBreach) | incident | [link](https://www.safebreach.com/blog/invitation-is-all-you-need-hacking-gemini/) | — | 2026-07-11 |
| ASI01 | AgentFlayer inception attack on ChatGPT users | AgentFlayer: ChatGPT Connectors 0-click attack (Zenity Labs) | incident | [link](https://labs.zenity.io/p/agentflayer-chatgpt-connectors-0click-attack-5b41) | — | 2026-07-11 |
| ASI02 | Amazon Q secrets via DNS exfiltration | Amazon Q Developer Vulnerability: Secrets Leaked via DNS and Prompt Injection | incident | [link](https://embracethered.com/blog/posts/2025/amazon-q-developer-data-exfil-via-dns/) | — | 2026-07-11 |
| ASI02 | MCP tool descriptor poisoning | MCP Tool Poisoning (OWASP community attack reference) | guidance | [link](https://owasp.org/www-community/attacks/MCP_Tool_Poisoning) | — | 2026-07-11 |
| ASI02 | EDR bypass via tool chaining under trusted credentials | MITRE ATT&CK T1218 — System/Signed Binary Proxy Execution (LOLBins) | guidance | [link](https://attack.mitre.org/techniques/T1218/) | — | 2026-07-11 |
| ASI03 | CVE-2025-31491 | AutoGPT cross-origin credential & cookie leakage on redirect (CVE-2025-31491) | incident | [link](https://nvd.nist.gov/vuln/detail/CVE-2025-31491) | CVE-2025-31491 | 2026-07-11 |
| ASI03 | Confused deputy via cross-agent trust | CSA Research Note: Confused Deputy Attacks on Autonomous AI Agents | research | [link](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-agent-confused-deputy-prompt-injection/) | — | 2026-07-11 |
| ASI03 | Memory-based SSH credential escalation | OWASP AI Agent Security Cheat Sheet — memory poisoning & credential/privilege escalation | guidance | [link](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html) | — | 2026-07-11 |
| ASI03 | Forged Agent Persona registration | Security Analysis of Agentic AI Communication Protocols — agent registration/discovery spoofing (CWE-290) | research | [link](https://arxiv.org/abs/2511.03841) | — | 2026-07-11 |
| ASI04 | Amazon Q supply chain compromise | Malicious data-wiping prompt injected into Amazon Q Developer VS Code extension v1.84.0 | incident | [link](https://www.reversinglabs.com/blog/aws-amazonq-ai-incident) | — | 2026-07-11 |
| ASI04 | MCP Tool Descriptor Poisoning | MCP Tool Poisoning Attacks — malicious instructions hidden in tool description/metadata | research | [link](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) | — | 2026-07-11 |
| ASI04 | Malicious Postmark MCP server | Rogue postmark-mcp npm package BCC-exfiltrated emails (first malicious MCP server in the wild) | incident | [link](https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft) | — | 2026-07-11 |
| ASI04 | AgentSmith Prompt-Hub proxy attack | AgentSmith: LangSmith Prompt Hub malicious Proxy Provider agent leaks API keys and data | incident | [link](https://noma.security/blog/how-an-ai-agent-vulnerability-in-langsmith-could-lead-to-stolen-api-keys-and-hijacked-llm-responses/) | — | 2026-07-11 |
| ASI05 | Replit vibe-coding agents executing unreviewed install commands | Replit AI agent deleted a production database during a code freeze (SaaStr / Jason Lemkin incident) | incident | [link](https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/) | — | 2026-07-11 |
| ASI05 | Direct shell injection via embedded prompts | "Your AI, My Shell": Demystifying Prompt Injection Attacks on Agentic AI Coding Editors | research | [link](https://arxiv.org/abs/2509.22040) | — | 2026-07-11 |
| ASI05 | Dependency lockfile poisoning | Lockfile Poisoning: An Attack Vector to Introduce Malware in the Software Supply Chain | research | [link](https://safedep.substack.com/p/lockfile-poisoning-an-attack-vector) | — | 2026-07-11 |
| ASI06 | Gemini long-term memory corruption via prompt injection | Hacking Gemini's Memory with Prompt Injection and Delayed Tool Invocation (Johann Rehberger / Embrace The Red) | incident | [link](https://embracethered.com/blog/posts/2025/gemini-memory-persistence-prompt-injection/) | — | 2026-07-11 |
| ASI06 | ChatGPT persistent false memory planting | SpAIware: Spyware/false-memory injection into ChatGPT's long-term memory (Johann Rehberger / Embrace The Red) | incident | [link](https://embracethered.com/blog/posts/2024/chatgpt-macos-app-persistent-data-exfiltration/) | — | 2026-07-11 |
| ASI06 | Cross-tenant vector namespace bleed | OWASP LLM08:2025 Vector and Embedding Weaknesses (cross-context / multi-tenant leakage) | guidance | [link](https://genai.owasp.org/llmrisk/llm08-excessive-agency/) | — | 2026-07-11 |
| ASI07 | Semantic injection over unencrypted HTTP channels | OWASP ASI07 Insecure Inter-Agent Communication: MITM semantic injection over HTTP/unauthenticated channels | guidance | [link](https://github.com/microsoft/hve-core/blob/main/.github/skills/security/owasp-agentic/references/07-insecure-inter-agent-communication.md) | — | 2026-07-11 |
| ASI07 | Trust poisoning via altered reputation messages | OWASP ASI07: altered reputation messages skew agent trust (agentic trading network scenario) | guidance | [link](https://github.com/microsoft/hve-core/blob/main/.github/skills/security/owasp-agentic/references/07-insecure-inter-agent-communication.md) | — | 2026-07-11 |
| ASI07 | MCP descriptor spoofing | Invariant Labs - MCP Tool Poisoning / Shadowing Attacks (spoofed & overridden tool descriptors) | research | [link](https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks) | — | 2026-07-11 |
| ASI08 | Financial trading cascade via prompt-injected risk limits | TradeTrap: Are LLM-based Trading Agents Truly Reliable and Faithful? | research | [link](https://arxiv.org/abs/2512.02261) | — | 2026-07-11 |
| ASI08 | Healthcare protocol propagation from supply-chain tampering | Data Poisoning Vulnerabilities Across Healthcare AI Architectures: A Security Threat Analysis | research | [link](https://arxiv.org/abs/2511.11020) | — | 2026-07-11 |
| ASI08 | Auto-remediation feedback loops | Addressing Cascading Failures (Google SRE Book, Ch. 22) | guidance | [link](https://sre.google/sre-book/addressing-cascading-failures/) | — | 2026-07-11 |
| ASI09 | Helpful Assistant Trojan exfiltrating code | CamoLeak: GitHub Copilot Chat prompt-injection flaw silently exfiltrating private source code and secrets | incident | [link](https://www.legitsecurity.com/blog/camoleak-critical-github-copilot-vulnerability-leaks-private-source-code) | — | 2026-07-11 |
| ASI09 | Credential harvesting via contextual deception | Human-Agent Trust Exploitation (OWASP ASI09) — SecureFlag Security Knowledge Base | guidance | [link](https://knowledge-base.secureflag.com/vulnerabilities/sensitive_information_exposure/human_agent_trust_exploitation_in_ai_llm_vulnerability.html) | — | 2026-07-11 |
| ASI09 | Invoice Copilot Fraud | Zscaler ThreatLabz — indirect prompt injection manipulating autonomous AI agents into executing fraudulent payments | research | [link](https://www.zscaler.com/blogs/security-research/indirect-prompt-injection-web-content-targets-ai-agents) | — | 2026-07-11 |
| ASI09 | Weaponized Explainability | Fooling LIME and SHAP: Adversarial Attacks on Post hoc Explanation Methods (Slack, Hilgard, Jia, Singh, Lakkaraju — AIES 2020) | research | [link](https://arxiv.org/abs/1911.02508) | — | 2026-07-11 |
| ASI10 | Impersonated observer agent approving fraudulent transactions | AI agent fraud: agent impersonation / identity spoofing in multi-agent systems (Stytch) | guidance | [link](https://stytch.com/blog/ai-agent-fraud/) | — | 2026-07-11 |
| ASI10 | Compromised automation agent spawning unauthorized replicas | Morris II / ComPromptMized: self-replicating zero-click GenAI worm (Cohen, Bitton, Nassi) | research | [link](https://arxiv.org/abs/2403.02817) | — | 2026-07-11 |
| ASI10 | Reward-hacking DR deletion | Natural emergent misalignment from reward hacking (Anthropic) | research | [link](https://www.anthropic.com/research/emergent-misalignment-reward-hacking) | — | 2026-07-11 |

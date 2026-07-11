# OWASP Agentic AI ↔ NIST 800-53 Rev 5 ↔ AI-RMF Crosswalk

> **An interactive compliance crosswalk mapping the OWASP Top 10 for Agentic AI (ASI 2026) to NIST SP 800-53 Rev 5 security controls and the NIST AI Risk Management Framework (AI 100-1).**

Licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).

---

## Why a Crosswalk Matters

Enterprise security and compliance teams face a fundamental challenge when deploying agentic AI systems: the threat landscape described by the **OWASP Top 10 for Agentic Applications** does not map neatly onto the control frameworks that auditors, regulators, and risk committees already use. NIST SP 800-53 Rev 5 remains the authoritative catalog of security and privacy controls for federal information systems and is widely adopted across the private sector [1]. The NIST AI Risk Management Framework (AI 100-1) provides a voluntary, rights-preserving framework specifically designed for AI systems [2]. Meanwhile, the OWASP Agentic Security Index (ASI) identifies the ten most critical risks unique to autonomous, tool-using AI agents — risks such as goal hijacking, rogue agent behavior, and cascading multi-agent failures [3].

Without a structured crosswalk, organizations are forced to perform ad hoc gap analysis every time they onboard an agentic AI capability. This leads to three recurring problems.

**First, compliance blind spots emerge.** A security team may implement robust access controls (NIST AC family) without realizing that agentic AI introduces entirely new attack surfaces — such as prompt-injection-driven goal hijacking — that require controls from multiple families (AC, SI, AU, and CM simultaneously). The crosswalk makes these multi-family dependencies explicit.

**Second, audit preparation becomes fragmented.** When a FedRAMP assessor or SOC 2 auditor asks how an organization mitigates "unauthorized agent behavior," the answer must be expressed in terms of specific 800-53 controls. This crosswalk provides that translation layer, mapping each OWASP ASI risk to the precise controls (e.g., AC-3, AC-6, SI-10, AU-2) that constitute an adequate response.

**Third, AI governance programs lack actionable structure.** The NIST AI-RMF provides high-level functions (GOVERN, MAP, MEASURE, MANAGE) but does not prescribe specific technical controls. By bridging OWASP ASI risks through 800-53 controls and into AI-RMF categories, this crosswalk gives governance teams a concrete implementation path — from risk identification to control selection to continuous measurement.

### The Three-Layer Architecture

This crosswalk operates as a **compliance middleware** layer connecting three authoritative frameworks:

| Layer | Framework | Purpose | Scope |
|-------|-----------|---------|-------|
| **Threat Layer** | OWASP ASI 2026 | Identifies *what can go wrong* with agentic AI | 10 risk categories (ASI01–ASI10) |
| **Control Layer** | NIST SP 800-53 Rev 5 | Specifies *what to implement* to mitigate threats | 16 families in scope (14 carry mappings), 54 distinct controls, 89 mappings |
| **Governance Layer** | NIST AI-RMF (AI 100-1) | Defines *how to govern* AI risk at the organizational level | 4 functions, 17 of 19 subcategories referenced, 62 mappings |

Each ASI risk is mapped to multiple 800-53 control families with specific control identifiers, accompanied by a rationale explaining why that control addresses the agentic-specific threat vector. Simultaneously, each risk is mapped to AI-RMF functions and subcategories, creating a bidirectional bridge between technical controls and governance processes.

### Who Should Use This

This crosswalk is designed for **CISOs and security architects** evaluating agentic AI deployments, **GRC analysts** preparing for FedRAMP, SOC 2, or ISO 27001 audits involving AI systems, **AI governance officers** building risk management programs aligned with the NIST AI-RMF, and **red team leads** scoping adversarial testing against agentic AI threat models. The interactive web application makes the data explorable through heatmaps and an evidence explorer, while the underlying data model (embedded in the source code) can be extracted for integration into GRC platforms, SIEM dashboards, or compliance automation tools.

---

## Features

The application provides three interactive views for exploring the crosswalk data.

**800-53 Heatmap** — A density matrix showing how many specific NIST 800-53 controls map to each OWASP ASI risk across all 16 control families. Darker cells indicate higher control density, revealing which risks require the broadest control coverage.

**AI-RMF Heatmap** — A coverage matrix showing how many AI-RMF subcategories (across GOVERN, MAP, MEASURE, MANAGE) are engaged by each ASI risk. This view helps governance teams understand which AI-RMF functions are most heavily implicated.

**Evidence Explorer** — A drill-down view where users select an ASI risk and see the complete crosswalk: every mapped 800-53 control with rationale, every mapped AI-RMF category with rationale, and real-world evidence citations (CVEs, published attacks, and incident reports).

---

## Local Installation

### Prerequisites

Before you begin, ensure you have the following installed on your system:

| Requirement | Minimum Version | Verification Command |
|-------------|----------------|---------------------|
| **Node.js** | v18.0.0 or later | `node --version` |
| **npm** | v9.0.0 or later (ships with Node.js) | `npm --version` |
| **Git** | Any recent version | `git --version` |

### Step 1: Clone the Repository

Open a terminal and clone this repository to your local machine:

```bash
git clone https://github.com/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF.git
```

Navigate into the project directory:

```bash
cd OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF
```

### Step 2: Install Dependencies

This project uses [pnpm](https://pnpm.io/) as its package manager. Install it globally if you don't have it:

```bash
npm install -g pnpm
```

Then install the project dependencies:

```bash
pnpm install
```

This will install React 19, Tailwind CSS 4, shadcn/ui, Radix UI primitives, and all other dependencies. The full dependency list is defined in `package.json`.

### Step 3: Start the Development Server

Launch the local development server:

```bash
pnpm dev
```

Vite will compile the application and serve it at `http://localhost:3000`. The terminal output will display the exact URL. Open that URL in your browser to access the crosswalk application.

The development server supports **hot module replacement (HMR)**, so any changes you make to the source files will be reflected in the browser immediately without a full page reload.

### Step 4: Build for Production (Optional)

To create an optimized production build:

```bash
pnpm build
```

The compiled output will be placed in the `dist/` directory. These static files can be served by any web server (Nginx, Apache, Caddy, or a static hosting service such as GitHub Pages, Netlify, or Vercel).

### Step 5: Serve the Production Build Locally (Optional)

To preview the production build locally:

```bash
pnpm preview
```

This will serve the production build at `http://localhost:4173/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/` (the app is built for the GitHub Pages project subpath).

---

## Project Structure

```
├── client/
│   ├── index.html              # Entry point HTML (OG meta tags, browser title)
│   └── src/
│       ├── App.tsx             # Root component with Wouter routing (providers + routes)
│       ├── main.tsx            # React DOM entry point
│       ├── index.css           # Global styles, design tokens, animations
│       ├── pages/              # Route components only
│       │   ├── Home.tsx        # Thin composition root: view state + the five tab views
│       │   ├── TermsOfService.tsx
│       │   └── NotFound.tsx
│       ├── data/
│       │   └── crosswalk.ts    # Data adapter — the ONLY importer of @haremantra/crosswalk
│       ├── components/         # Shared shell: SeverityBadge, StatCard, HomeHero,
│       │   │                   #   ViewTabs, SiteFooter, ErrorBoundary
│       │   └── ui/             # shadcn/ui (pruned to the 8 components in use)
│       ├── features/
│       │   ├── overview/       # OverviewRoster landing view
│       │   ├── heatmap/        # 800-53 + AI-RMF heatmap views, cells, static derivations
│       │   ├── explorer/       # Evidence Explorer: search, risk detail, mapping cards
│       │   ├── simulator/      # Scenario Simulator + ScenarioContext
│       │   │   └── engine/     # Pure simulation logic (generator, evaluator, mappings…)
│       │   ├── diagram/        # Architecture Diagram Analyzer
│       │   │   └── engine/     # Pattern taxonomy + evaluators (pure)
│       │   └── onboarding/     # Guided-tour context + components
│       ├── hooks/              # useMobile, useTabParam
│       └── lib/
│           └── utils.ts        # Tailwind class utilities
├── packages/
│   └── crosswalk/              # @haremantra/crosswalk — the crosswalk data package (MIT)
│       ├── src/                # Data, descriptions, derived statistics (single source of truth)
│       └── tests/              # Referential-integrity, contract, and derivation pins
├── db/                         # Offline SQLite analyst tooling for the pattern taxonomy
├── package.json                # App dependencies and scripts (pnpm workspace root)
├── vite.config.ts              # Vite build configuration (GitHub Pages base path)
├── vitest.config.ts            # Test configuration
├── tsconfig.json               # TypeScript configuration
├── components.json             # shadcn/ui configuration
├── LICENSE                     # AGPL-3.0 license (app; data package is MIT)
├── TERMS_OF_SERVICE.md         # Terms of Service for the hosted application
├── CHANGELOG.md                # Version history
└── README.md                   # This file
```

---

## Data Model

The crosswalk data lives in the `@haremantra/crosswalk` workspace package (`packages/crosswalk/src/data.ts`) as TypeScript objects — the single source of truth consumed by the application through the `client/src/data/crosswalk.ts` adapter, and independently publishable for downstream tools. The application remains fully self-contained with no external API dependencies. The data model consists of four primary structures:

**`OWASP_ASI`** — An array of 10 risk objects, each containing an identifier (ASI01–ASI10), a human-readable name, a severity rating (Critical, High, or Medium-High), and a description of the threat.

**`NIST_800_53`** — An array of 16 control family objects, each with an identifier (AC, AU, CA, etc.), a full name, and a display color for the heatmap.

**`AI_RMF`** — An array of 4 function objects (GOVERN, MAP, MEASURE, MANAGE), each containing its subcategories.

**`CROSSWALK`** — A keyed object mapping each ASI identifier to its 800-53 control mappings (with specific controls and rationale) and AI-RMF category mappings (with specific subcategories and rationale), plus real-world evidence citations.

---

## Contributing

Contributions are welcome under the terms of the AGPL-3.0 license. Start with **[GOVERNANCE.md](GOVERNANCE.md)**, which defines the roles, the merge gate, and the evidentiary standard for data changes.

- **Propose or correct a mapping** using the issue forms: [New mapping proposal](.github/ISSUE_TEMPLATE/new-mapping.yml) or [Mapping correction](.github/ISSUE_TEMPLATE/mapping-correction.yml). Each requires the affected ASI / 800-53 / AI-RMF IDs, a rationale, at least one citation, a confidence estimate, and your stated assumptions.
- **Meet the [Mapping Provenance Standard](GOVERNANCE.md#mapping-provenance-standard)** — every new or modified mapping must cite at least one authoritative source (a URL, a `CVE-YYYY-NNNN+` identifier, or a named publication/section) beyond editorial judgment, alongside the rationale.
- **Edit data in the canonical location only** — `packages/crosswalk/src`. The client consumes this data through the `@haremantra/crosswalk` package; a CI guard rejects any duplicate copy under `client/src/lib`.

The project runs in **Solo Mode**: the maintainer's review plus a green CI run (`pnpm check && pnpm test && pnpm build` and the repository guards) is the sole merge gate — **no external approval is required yet**. A multi-reviewer Board Mode activates only when the trigger documented in [GOVERNANCE.md](GOVERNANCE.md#board-mode-inactive) is met. Which control families could enter scope, and under what conditions, is tracked in the [Scope Expansion Roadmap](docs/EXPANSION_ROADMAP.md).

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](LICENSE) file for the full text.

Under the AGPL-3.0, you are free to use, modify, and distribute this software, provided that any modified versions or derivative works are also licensed under the AGPL-3.0 and that the source code is made available to users who interact with the software over a network. This ensures that improvements to the crosswalk data and application remain open and accessible to the security community.

The hosted web application at the official deployment URL is additionally subject to the [Terms of Service](TERMS_OF_SERVICE.md), which govern usage of the hosted service as distinct from the open-source codebase.

---

## References

[1]: https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final "NIST SP 800-53 Rev 5 — Security and Privacy Controls for Information Systems and Organizations"

[2]: https://www.nist.gov/artificial-intelligence/ai-risk-management-framework "NIST AI Risk Management Framework (AI 100-1)"

[3]: https://owasp.org/www-project-agentic-ai-threats/ "OWASP Top 10 for Agentic Applications"

[4]: https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final "NIST AI 600-1 — Generative AI Profile"

# Comprehension Audit — Findings & Fixes

**Run date:** 2026-07-14
**Target:** live GitHub Pages build, crosswalk data v0.9.0
**Protocol:** `Comprehension Audit — Protocol v1` (approved 2026-07-13: all four roles, thresholds as written, live build)
**Sealed key:** `00-sealed-key.md` · SHA-256 `048A43F299A3775CF7FBD68F268882DD7A07E88FD246EDF2257C35374C8181FF` (frozen before any evaluator was spawned)
**Transcripts:** `r1-inheriting-reviewer.md` · `r2-agentic-engineer.md` · `r3-executive-skimmer.md` · `r4-model-risk-manager.md`
**Scorecard:** `05-scorecard.md`

---

## The one-line result

**The site transmits its honesty perfectly and its purpose not at all.** All four cold readers correctly understood, within seconds, that the mappings are editorial and unvalidated. None of them was shown the door to the product. Three of four found it by accident; the fourth — the persona v0.9.0 was rebuilt for — searched for an hour, failed, and *published its absence to a peer*.

---

## Gates (pre-committed 2026-07-13, judged without adjustment)

| Gate | Condition | Verdict |
|---|---|---|
| **G1** Self-explanation | R1 and R4 both ≥2 on D1/D2/D3 by end of T2 | **PASS — at the floor.** Both cleared D3 at exactly 2, and both did so as *"a map you read,"* not *"a deliverable you produce."* |
| **G2** No inversions | Zero inversion-class findings | **PASS as written; FAIL as intended.** Nobody believed a claim the site disclaims — notably 0/4 read the incident card as "AC-6 would have stopped EchoLeak." But two readers propagated a false claim **the site itself makes** (see F2). The rubric had no bucket for that. |
| **G3** Forwardability | R3 correct category + user in ≤90s | **PASS, emphatically.** The only unqualified pass in the study. R3 wrote a correct, caveated forward note from the hero alone, zero clicks. |
| **G4** The deliverable lands | R4 reaches D3 = 3 | **FAIL.** R4 reached D3 = **1**. |

**The comprehension curve is inverted.** Depth of engagement correlates *negatively* with understanding the job-to-be-done: R3 (90 seconds, zero clicks) scored D3 = 2; R4 (one hour, two downloads) scored D3 = 1. The prescribed path — onboarding modal → "Run First Simulation" → Scenario Simulator — produced correct comprehension in **zero of four** readers.

---

## Findings (all adversarially verified against code + live site; refuted claims removed)

### F1 — CRITICAL · The product ships the deliverable and hides the door
The v0.9.0 assessment workflow (tick mappings → tray → annotate owner/RACI/concur → Committee brief + scoped OSCAL) is gated behind a **16×16px checkbox with a fully transparent glyph** (`rgba(0,0,0,0)` until ticked), no visible label, no tooltip, no hint text — and **no zero-state**, because the tray returns `null` until something is already selected.

**Root cause — `client/src/features/assessment/AssessmentTray.tsx:57-60`:**
```ts
// Untouched assessment → no tray. Keeps the default App DOM unchanged.
if (assessment.selections.length === 0 && untouchedName) return null;
```
The header comment states the reason outright: *"Renders NOTHING when the assessment is untouched… so the app's default DOM is unchanged — App.smoke.test.tsx must stay byte-identical."*

**A snapshot test is dictating the product's discoverability.** A user hunting for the feature is shown proof it does not exist. Grep across `client/src/` for any inviting copy ("select…", "add to assessment", "tick", "build an assessment") returns **zero hits**.

> **Do not cite R4's supporting sentence.** R4 wrote *"not a single free-text field, name field, date field, checkbox… anywhere on the site"* — that is **factually false** (the ASI01 detail view has 8 `role="checkbox"` elements and an enabled per-risk "Export brief"). R4 asserted an unverified universal negative. The reader's evidence is unusable; the reader's *conclusion* is correct, and the code proves it independently.

**Fix (smallest):** render the tray in a zero-state (`count === 0` → "Tick a mapping to build an assessment", exports disabled) and **update the smoke test, not the product**. Add a visible label beside the first checkbox.

### F2 — HIGH · The site states a security claim that is false on its own terms
- `packages/crosswalk/src/data.ts:95` — *"Agents **cannot reliably distinguish instructions from data**."*
- `packages/crosswalk/src/data.ts:167` — *"Input validation (SI-10) **prevents** prompt injection payloads from reaching goal-selection logic."*

"Prevents" is indefensible precisely because of line 95. R1 accepted it and exported it into a committee brief; R2 caught it *only* on engineering prior knowledge the site never supplied.

**Severity downgraded from Critical by the adversarial pass:** the mapping carries its `Editorial` badge, and `brief.ts:104` stamps `Validation status: Editorial` on every block — so the claim does not travel *unqualified*. It is still wrong.

**Fix:** one word. `prevents` → `constrains` at `data.ts:167`.

### F3 — HIGH · The CSV export silently drops both of the product's headline claims
`packages/crosswalk/src/artifacts.ts:31-41` — `CSV_HEADER` is `asiId, asiName, severity, family, familyName, controlId, controlTitle, rationale, evidence`.

1. **No `validationStatus`.** JSON keeps it (`buildJson()` returns `CROSSWALK` wholesale, every mapping carries `validationStatus: "editorial"`); CSV drops it. The "unreviewed" flag does not travel into the GRC tool. R4: *"in six months it'll be policy and nobody will know why."*
2. **The adversarial pass found this understated:** `buildCsv()` (`artifacts.ts:84-109`) iterates **only `entry.nist53`**. **All 62 AI-RMF mappings are absent from the CSV entirely.** The export format most likely to reach a GRC tool silently claims the crosswalk is 800-53-only *and* unlabelled as to validation.

**Fix:** add `validationStatus` + a `framework` column to the header and row builder; emit `aiRmf` rows.

### F4 — HIGH · The honest labelling stops exactly where the numbers start
The crosswalk badges every mapping `Editorial`. The Scenario Simulator emits hard quantities — **"BROKEN CONTROLS 21 / 4 families affected"**, **"60 actions/hr ⚠ Exceeded"**, risk weights of 90/80/70% — with **no user-facing caveat of any kind**.

The only caveat exists as a code comment: `client/src/features/simulator/engine/mappings.ts:97` — *"Weights are editorial estimates. Practitioner validation required."* The footer Provenance panel never mentions the simulator (grep for `simulat|scenario|weight|probab` in `ProvenancePanel.tsx`: **nothing**). The hero's editorial disclaimer is scoped to *severity ratings* only.

R4: *"I would never put the Scenario Simulator's output in front of an examiner… an unvalidated model dressed as an assessment is exactly the thing we get written up for."*

**Fix:** one line under the scenario header — "Scenario weights are editorial estimates, not empirical frequencies."

### F5 — HIGH · The simulator reports controls that aren't mapped, with another risk's rationale
Reproduced live: ASI01 × CM reports broken controls **CM-3, CM-5, CM-7, CM-14**. Ground truth (`data.ts:169`): **ASI01 × CM = CM-3, CM-5 only.** CM-7/CM-14 belong to **ASI05** (`data.ts:246`) and are displayed carrying ASI05's rationale verbatim ("Banning eval in production agents…").

**Root cause — two lines:**
- `engine/evaluator.ts:113-120` pushes every `ControlEvaluation` into one flat array across all 10 ASIs, recording `control_id`/`family`/`state`/`rationale` but **no ASI id** (`types.ts:90-98` confirms `ControlEvaluation` has no `asi_id`).
- `AnalysisPanel.tsx:53-56` therefore filters **by family only** — `asiId` is in scope on line 43, used on line 48, and simply never applied to the filter.

**Fix:** add `asi_id: asiRisk.id` at `evaluator.ts:114`; filter `c.asi_id === asiId && c.family === familyId` at `AnalysisPanel.tsx:53`.

### F6 — HIGH · The onboarding modal points away from the product, and traps keyboard users
On a clean profile the modal auto-opens: *"Welcome to the Compliance Middleware… Let's run a quick simulation."* Primary CTA **"Run First Simulation"** (`HookModal.tsx:135`) routes the first-time visitor into the Scenario Simulator — the one surface carrying uncaveated editorial numbers (F4) and mis-scoped control lists (F5). The only exit is a low-contrast *"Skip tutorial (I know my way around)."*

**Escape does nothing.** Verified live (`modalStillPresent: true`) and in code — grep for `escape|keydown|onKeyDown` across `client/src/features/onboarding/`: **zero hits**. There is **no close/X button**. R3 (the skimmer): *"a colder reader bounces here."*

R2 also found the tour misdescribes its own screen — it announces a pre-selected "Erroneous × Sequential" scenario, then generates `Biased × Swarm`; it narrates a cascade while the timeline reads `Step 0/6` and every node is Healthy.

**Fix:** add Escape/backdrop close; point the primary CTA at the crosswalk, simulator secondary.

### F7 — MEDIUM · The validation model lives off the tool
Both "How mappings are validated" and "Read the validation model" link to `VALIDATION.md` **on GitHub**. R4 — whose entire question is methodology — wanted it badly and logged the urge rather than following it: *"the tool's account of its own validation model lives off the tool, on a developer platform my committee will never visit."*

### F8 — MEDIUM · Vocabulary never defined on screen
**"ASI"** is used as a bare acronym on every screen and expanded nowhere — R1 finished the entire session **still not knowing what it stands for**. **"Prompt injection"** is never defined (R1: *"[PRIOR KNOWLEDGE — the site never told me]"*). **"Compliance Middleware"** was mis-parsed by 4/4 readers as implying a runtime integration layer; R3: *"Middleware implies a runtime path. This is a static reference map."* The 800-53 heatmap ships **16 bare two-letter column headers with no legend** (R2 never decoded SR/CA/PM/RA/SA).

### F9 — MEDIUM · Rationale is written per family, reused per control
R1 discovered from the downloaded OSCAL that AC-3/AC-4/AC-6 carry **byte-identical** rationale strings. *"The argument for AC-4 is really the argument for AC-3. Fine for scoping. Not defensible line-by-line under audit."* This reframed "89 mappings" into "~30 arguments applied at family resolution" — and it materially cooled R1's memo.

### F10 — MEDIUM · The tray occludes the limitations panel
With an assessment active, the sticky tray intercepts the click on **Provenance & Limitations** — the site physically blocks access to its own best credibility asset. That panel is also collapsed, at the page bottom, behind a "Show" toggle. R3 (the skimmer) never reached it at all.

---

## What the site got right — and this is not a consolation prize

**The trust layer transmitted to 4/4 readers, at every stage, without exception (D7 = 3 across the board).** Every reader independently found the `100% Editorial / 0% Reviewed / 0% Validated` bar, read it correctly as *"one informed person's opinion that nobody has checked,"* and — critically — **trusted the tool more because of it**, not less.

- R3: *"volunteering your own weakness before I find it is why this is forward-with-caveat and not drop."*
- R4: *"That's not a weakness, that's the most professional thing on the site, and it's why I'd let it near a committee pack."*

The honesty story is load-bearing and it works. **Do not trade it away for polish.** Note the perverse incentive R2 logged, though: the trust bar's candor is what sent them looking for the exit ("0% validated → let me go check the CVE myself").

---

## Prioritized fix list

| # | Fix | File | Effort | Why now |
|---|---|---|---|---|
| 1 | Give the tray a zero-state; update the smoke test instead of suppressing the UI | `AssessmentTray.tsx:57-60` + `App.smoke.test.tsx` | S | The whole v0.9.0 thesis is invisible without it. G4 fails on this alone. |
| 2 | Add `asi_id` to `ControlEvaluation`; scope the panel filter | `evaluator.ts:114`, `AnalysisPanel.tsx:53`, `types.ts:90` | S | The simulator currently reports **wrong controls with the wrong risk's rationale**. Correctness bug. |
| 3 | CSV: add `validationStatus` + `framework`; emit AI-RMF rows | `artifacts.ts:31-41, 84-109` | S | The GRC-bound export drops the validation flag *and* 62 of the mappings. |
| 4 | `prevents` → `constrains` | `data.ts:167` | XS | The site currently states something false on its own terms. |
| 5 | User-facing editorial caveat on the simulator | simulator scenario header | XS | The honesty stops where the numbers start. |
| 6 | Modal: Escape/backdrop close; primary CTA → crosswalk, not simulator | `HookModal.tsx:135`, `features/onboarding/` | S | Keyboard trap + it routes cold users away from the product. |
| 7 | Expand "ASI" on first use; define "prompt injection"; legend the heatmap columns | hero, `RiskDetail`, heatmap | S | A reader finished an hour-long session not knowing what ASI stands for. |
| 8 | Bring the validation model on-site (don't link to GitHub) | new panel / route | M | The audience that needs it most will never click a GitHub markdown link. |
| 9 | Don't let the tray occlude the limitations panel | `AssessmentTray.tsx` z-index/padding | XS | The tool blocks its own credibility asset. |
| 10 | Reconsider per-family rationale reuse, or label it as family-level | `data.ts` | M | Sophisticated readers notice and discount the whole dataset. |

---

## Protocol deviations & threats to validity (recorded honestly)

1. **T0 stimulus was the real first paint, not the bare hero.** The plan specified a hero screenshot; the site actually paints an onboarding modal over a blurred hero. I used what a stranger actually sees. This is a fidelity improvement, but it is a deviation from the approved plan.
2. **Cold reads ran sequentially, not in parallel.** The Playwright MCP drives a single shared browser; concurrent readers would have interleaved clicks and corrupted each other's runs.
3. **Cross-run contamination occurred and was caught.** R1 left a generated committee-brief tab open; it was still present when R4 began. R4 spotted it, tagged it `[NOT A SITE PIXEL]`, and excluded it from every claim — exemplary participant behavior. It is also the most damning object in the study: **literal proof of the feature was open in a tab on R4's own screen, and R4 still could not find the door.** `localStorage` was cleared between every run (it holds the onboarding flag *and* the assessment tray state).
4. **A scoring-rubric flaw was found mid-flight.** The `[SITE: absence]` tag class let a *search failure* be laundered into a *site fact* — it is how R4's false universal negative earned a `[SITE]` tag. **The tag class must be abolished before any re-run:** an absence is not a pixel.
5. **The headline ceiling stands, as promised in the plan.** These are simulated readers, not people. This run **proves a comprehension failure** — four independent readers, four different accidental paths, zero guided discoveries of the core workflow, corroborated by the code. It does **not** prove that the fixes will work. After fixing #1–#6, the honest next step is five real humans, and no clean re-run of this instrument substitutes for that.

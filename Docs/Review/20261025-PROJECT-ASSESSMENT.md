# Foodandish project assessment — 2026-10-25

## Executive assessment

Foodandish is a small, static React/Vite recipe lottery: a user presses `Spin`, watches a slot-reel animation, receives a non-repeating recipe, and can read the recipe or follow its source. The implementation is intentionally simple and is appropriate for GitHub Pages.

The current result is a credible phase-one prototype, but not yet a strong portfolio release without documentation and delivery cleanup. The central workflow is implemented and the local build, lint, unit tests, and importer smoke test pass. The most important gaps are:

1. The documented recipe import pipeline does not feed the running application. The app imports the hand-maintained `src/data/recipes.ts`; the importer writes ignored `src/data/recipes.generated.json`.
2. The repository does not include a project license or the required upstream dataset license attribution, despite describing itself as open source and using recipe content from another repository.
3. GitHub Actions builds and deploys, but does not run `npm test` or `npm run lint`, so the release gate does not verify the declared quality checks.
4. Reduced-motion users still wait for the hard-coded three-second JavaScript timeout even though CSS reduces the animation to nearly zero.
5. The local checkout has an empty `.git` directory, so local branch/history/change-state evidence was unavailable. The authorized remote clone was clean and contained seven commits on `main`.

Portfolio readiness: **ready with caveats**. The app demonstrates a focused interaction and a reasonable static architecture. It needs honest data-pipeline documentation, licensing/attribution, CI coverage, and a small accessibility behavior fix before it should be presented as a polished open-source project.

## Evidence scope and confidence

- Local source was inspected under `/home/mehran/foodandish`.
- The authorized remote `https://github.com/m3hr4nn/foodandish` was cloned to `/tmp/foodandish-remote` for history comparison; no project files or external systems were modified.
- The remote has seven commits on `main`, from `0ee3941 Add phase one recipe spinner` through `7d922d8 Update README project details`, with no tags or additional branches in the fetched history.
- The local tracked application files match the remote checkout. The local-only files are owner instructions/design context and the ignored empty generated-data file.
- Because the local `.git` directory contains no Git metadata, local uncommitted-change state cannot be established. The remote clone itself was clean.
- No production site was contacted. Dependency audit could not complete because the npm advisory endpoint was unreachable from the execution environment; no vulnerability conclusion is made from that failed scan.

## Reconstructed purpose and principles

### Intended users and problem

The intended user is someone deciding what to cook. The product removes decision friction by making a random recipe recommendation entertaining and immediate, rather than providing a full recipe-management system. The apparent owner goal is a simple first release that is static-hosting friendly and easy to extend later with cuisine, protein, vegetarian, seafood, and related filters.

### Documented principles

`AGENTS.md` defines the phase-one scope, GitHub Pages constraint, separation of selection logic from animation, normalized recipe records, upstream source expectations, and testing priorities. It also requires license attribution and honest documentation of custom-domain deployment.

The Alpy package supplied locally is valid for both explicit `light` and `dark` modes, with no validation findings. Its relevant UX principles are clarity, one primary action, semantic/accessibility-aware HTML, visible focus, responsive hierarchy, and motion that clarifies change. The current UI is explicitly dark in `src/styles.css`, which is consistent with the README’s stated dark slot-machine treatment but is not an explicit Alpy mode implementation.

### Observed and inferred decisions

- **Observed:** React state controls selection, animation state, and result display (`src/app.tsx:8-31`). Selection is kept in a pure helper (`src/lib/recipes.ts:3-19`).
- **Observed:** The deployment model is static Vite output deployed by GitHub Pages through `.github/workflows/pages.yml:3-50`; `public/CNAME` contains `foodandish.ir`.
- **Observed:** The app ships 20 recipes in `src/data/recipes.ts`, seven Iranian and thirteen international by the stored `cuisine` field. IDs are unique and all records have required fields in the current dataset.
- **Inferred:** The project is still in phase one. There is no account, server, database, analytics, personalization, filtering, persistence, or backend trust boundary.
- **Unknown:** Whether `foodandish.ir` is actually configured and served; this review did not contact production.
- **Unknown:** Whether the recipe text has been legally reviewed beyond the stated upstream source. The repository contains no license file or attribution document to establish that.

## Architecture and workflows

### Components and data flow

1. `src/main.tsx` mounts `App` under React `StrictMode`.
2. `src/app.tsx` imports `recipes` from `src/data/recipes.ts`, derives reel items, and renders the slot machine, actions, and inline recipe detail.
3. `pickRandomRecipe` excludes the prior ID when alternatives exist. `getReelItems` constructs repeated filler cycles ending in the selected recipe.
4. CSS translates the reel for three seconds; a JavaScript timeout then publishes the result and enables the next spin.
5. The source link is rendered only when the URL begins with `http`.
6. `scripts/import-recipes.mjs` can recursively read raw JSON and normalize it, but its generated output is not imported by the app or build.

### Trust boundaries, storage, and integrations

There is no user authentication, authorization, server-side storage, user input form, API call, secret, upload, or database. Build-time recipe JSON is the only meaningful input boundary. The browser follows external recipe URLs supplied by repository data. The deployment integration is GitHub Actions/GitHub Pages; its workflow has `contents: read`, `pages: write`, and `id-token: write` permissions.

### Principal workflows

- Visitor loads the static site.
- Visitor presses `Spin`; the button is disabled during the animation.
- A recipe is selected without repeating the previous recipe when alternatives exist.
- Visitor presses `Get recipe` to jump to inline details, then may follow the original source.
- Maintainer may place upstream JSON under `data/raw/recipes/` and run `npm run import:recipes`; in the current implementation this does not update what users see.
- A push to `main` runs the Pages workflow, builds `dist`, uploads it, and deploys it.

## Findings ordered by priority

### F-01 — The documented importer is disconnected from the application

- **Category:** Correctness / architecture / maintainability
- **Severity:** High for maintainers; Medium for current users
- **Confidence:** Confirmed
- **Evidence:** `src/app.tsx:2` imports `recipes` from `./data/recipes`; `src/data/recipes.ts` contains the shipped 20-record dataset. `scripts/import-recipes.mjs:6-8,37-40` writes `src/data/recipes.generated.json`, which is ignored by `.gitignore:8-10`; no source file imports that JSON. The generated file is empty in the local checkout.
- **Affected workflow:** A maintainer follows README.md:28-34, imports new recipes, builds, and expects the site to use them. The build continues to use the old hand-maintained array, so the command can report success while making no product change.
- **Correction:** Choose one authoritative path. Recommended: import/validate into a tracked normalized data file that `src/data/recipes.ts` re-exports, or make `recipes.generated.json` the actual app import and add a checked-in generated artifact policy. Add duplicate-ID and required-field validation before writing output. Update README wording to describe the chosen source of truth.
- **Effort / dependencies / regression risk:** Small to medium, no new dependency; medium regression risk because the dataset becomes generated and import shape becomes runtime-visible.
- **Verification:** Run the importer on a fixture with a distinctive recipe, run the build, and assert the distinctive title exists in the built asset or UI. Add tests for generated-data loading, duplicate IDs, missing URLs, and empty datasets.

### F-02 — Open-source and recipe attribution claims are incomplete

- **Category:** Legal/portfolio credibility / documentation
- **Severity:** High before public portfolio presentation
- **Confidence:** Confirmed gap; legal applicability requires owner review
- **Evidence:** `README.md:1-42` calls the project open-source by context and identifies `dpapathanasiou/recipes`, but there is no `LICENSE`, `NOTICE`, or attribution file in the remote tracked files. `AGENTS.md` explicitly requires preserving license attribution. `src/data/recipes.ts:1-700` contains recipe text and source URLs but no provenance metadata or attribution notice.
- **Affected workflow:** A reviewer or downstream user cannot determine Foodandish’s project license, which upstream license terms apply to copied content, or which exact upstream dataset snapshot supplied the records.
- **Correction:** Add a project license selected by the owner, an attribution/NOTICE document naming the upstream repository and its license, and a reproducible provenance note (source commit/date and selected files). If redistribution terms are uncertain, reduce copied content or link to sources until verified. This requires legal/owner confirmation rather than assuming MIT covers all copied material.
- **Effort / dependencies / regression risk:** Small documentation change plus provenance audit; low code regression risk, potentially meaningful content/licensing work.
- **Verification:** Check that every shipped record can be traced to a documented source and that README/license claims match the selected terms.

### F-03 — CI deploys without running the repository’s declared tests or lint

- **Category:** Testing / delivery
- **Severity:** Medium
- **Confidence:** Confirmed
- **Evidence:** `.github/workflows/pages.yml:30-34` runs `npm ci` and `npm run build` only. `package.json:10-12` declares separate `lint` and `test` scripts. The workflow deploys after the build job succeeds (`pages.yml:41-50`).
- **Affected workflow:** A regression in selection behavior, React rendering, or lint quality can reach GitHub Pages while the local quality commands would fail.
- **Correction:** Run `npm test` and `npm run lint` in the build job before artifact upload. Keep the deployment job dependent on that quality gate. Add a small browser-level smoke test only if the project adopts a browser test tool; do not add one merely for coverage optics.
- **Effort / dependencies / regression risk:** Small; no new dependency for the first step; low regression risk.
- **Verification:** Introduce a deliberately failing test/lint check on a branch or local workflow copy and confirm the artifact/deploy job is blocked; then confirm the normal workflow passes.

### F-04 — Reduced-motion users wait for a three-second result

- **Category:** Accessibility / correctness of interaction feedback
- **Severity:** Medium
- **Confidence:** Confirmed
- **Evidence:** `src/app.tsx:6,28-31` always delays result publication by `3000ms`. `src/styles.css:445-457` reduces CSS animation duration to `0.01ms` for `prefers-reduced-motion: reduce`, but does not change the JavaScript timeout.
- **Affected workflow:** A user who requests reduced motion sees the reel stop almost immediately but remains in the `Spinning...`/disabled state for nearly three seconds. This makes the interface feel broken and violates the intended relationship between motion and feedback.
- **Correction:** Use a motion-duration value shared by the state logic and CSS, or resolve the result from `animationend` with a reduced-motion fast path. Preserve the non-repeating selection behavior and avoid timers that outlive the component.
- **Effort / dependencies / regression risk:** Small; low to medium risk around animation timing and test determinism.
- **Verification:** Test with `prefers-reduced-motion: reduce` and normal motion. Confirm result publication, button re-enable, and reel landing behavior in both modes.

### F-05 — Import normalization can create unstable or colliding IDs

- **Category:** Data integrity / plausible risk
- **Severity:** Medium if the importer becomes authoritative; Low today because its output is unused
- **Confidence:** Confirmed code weakness; occurrence in the upstream input is not established
- **Evidence:** `scripts/import-recipes.mjs:42-56` recursively accepts nested files, while `:70-72` derives `id` from only `path.basename(file, '.json')`. Two directories containing the same basename produce the same ID. There is no duplicate check. `src/lib/recipes.ts:16-18,22-25` assumes IDs distinguish recipes.
- **Affected workflow:** After wiring in generated data, colliding IDs can cause filtering to remove multiple records, allow `pickRandomRecipe` to have no candidates, and make selection behavior inconsistent. The UI currently adds an index to reel keys, so this is not a React-key-only issue.
- **Correction:** Define a stable ID policy using upstream identity or a normalized path/title plus collision detection; fail the import with a useful report rather than silently emitting duplicates. Validate `limit` and random/candidate invariants as part of the same importer boundary.
- **Effort / dependencies / regression risk:** Small to medium; low risk if done before generated data is made authoritative.
- **Verification:** Add fixtures with identical basenames in different directories and assert the importer rejects or deterministically disambiguates them.

### F-06 — Current external recipe links are all HTTP

- **Category:** Security / user trust / content quality
- **Severity:** Low to Medium
- **Confidence:** Confirmed data fact; exploitability and redirect behavior not tested
- **Evidence:** A local data audit found 20/20 `sourceUrl` values use `http://`; the UI emits them at `src/app.tsx:148-151`.
- **Affected workflow:** Following a source can begin over an unencrypted connection or fail through browser upgrade/redirect behavior. It also weakens the credibility of a public recipe app.
- **Correction:** Prefer canonical HTTPS URLs after verifying each source. Reject non-HTTP(S) URLs in the importer and consider preserving a validated canonical URL field. Do not silently rewrite URLs without checking that the destination is equivalent.
- **Effort / dependencies / regression risk:** Small data cleanup; low code risk, but links need manual verification.
- **Verification:** Validate URL schemes in import tests and manually check a representative sample of rendered source links without contacting production systems from this audit.

## What is implemented well

- The product scope is narrow and matches the stated phase-one goal.
- Selection logic is separated from rendering and accepts an injectable random function (`src/lib/recipes.ts:3-19`), which is a good foundation for deterministic tests.
- The spin button prevents concurrent spins (`src/app.tsx:19-26,95-96`), and the current selection helper avoids immediate repeats when alternatives exist.
- Recipe content is rendered as text through React rather than injected HTML, so the current data path does not expose an obvious HTML injection sink.
- The app has no server, secrets, authentication, or unnecessary runtime dependencies, keeping the threat surface and deployment model small.
- TypeScript strict mode, Vite static output, a lockfile, a Pages workflow, visible focus styles, semantic headings/lists, and a reduced-motion CSS intent are all sound foundations.
- The remote history is small and understandable: initial phase-one delivery followed by asset-path, UI, dataset, and README refinements.

## Validation performed

| Check | Result | Notes |
|---|---|---|
| `npm test -- --run` | Pass | 1 file, 4 tests. Coverage is limited to recipe helpers. |
| `npm run build` | Pass | `tsc -b` and Vite build succeeded; emitted `dist/index.html` and JS/CSS assets. |
| `npm run lint` | Pass | No ESLint findings. |
| Importer fixture smoke test | Pass | Valid record imported; missing-URL record was skipped; output shape was inspected. |
| Dataset integrity audit | Pass for current data | 20 records, no duplicate IDs, required fields/URLs present; 20 HTTP source URLs. |
| Remote Git inspection | Pass | Clean shallow clone; seven commits on `main`; no tags/additional branches fetched. |
| `npm audit --omit=dev --audit-level=moderate` | Inconclusive | npm advisory endpoint failed DNS resolution; no vulnerability conclusion. |
| Production/live-site validation | Not run | Explicitly excluded to avoid external contact. |
| Browser interaction/accessibility run | Not run | No browser harness was declared; source review covered the interaction and CSS behavior. |

Passing build/tests do not establish that the importer is wired, the live deployment is correct, links are safe/current, or the UI is accessible across browsers.

## Portfolio-readiness assessment

**Ready with caveats.**

The project is honest as a small phase-one prototype if presented as a static recipe spinner. The following claims or presentation details are currently misleading or incomplete:

- “Import Recipes” reads as if imported data powers the app; it does not.
- “Open-source” is not supported by a project license file or complete upstream attribution.
- The README presents a GitHub Pages URL but does not explain the `foodandish.ir` CNAME, DNS, or HTTPS status even though `public/CNAME` declares that custom domain.
- The repository has no screenshots, demo GIF, architecture note, test-status badge, or explicit limitation note. These are not defects, but their absence makes the portfolio story weaker.
- The live site and custom domain were not verified in this review, so “live” should be treated as a claim requiring owner verification.

The README should explicitly say that there is no backend, no persistence, no filters yet, and that the current dataset is curated/static until F-01 is corrected. A screenshot or short recording should show the first spin, repeat spin, recipe detail, mobile layout, and reduced-motion behavior after that fix.

## Phased improvement plan

### Phase 1 — Release credibility and correctness

Address F-01 through F-04, plus licensing/attribution work in F-02:

- Select and implement one authoritative recipe-data path.
- Add importer validation and a small fixture suite.
- Add project license and upstream attribution/provenance.
- Add test and lint steps to CI.
- Synchronize reduced-motion behavior with result timing.
- Correct README claims, custom-domain notes, and current limitations.

Acceptance criteria:

- A fixture recipe added through the documented import command appears in a production build artifact or browser smoke test.
- Duplicate IDs, malformed URLs, and empty datasets fail with actionable errors.
- CI runs build, test, and lint before deployment.
- Reduced-motion users receive the result promptly and the control state recovers.
- License, attribution, source snapshot, and deployment claims are reviewable from the repository.

### Phase 2 — Focused maintainability and UX verification

- Add component-level tests for initial state, spin, disabled concurrent action, result detail, source link, and repeat rolls.
- Add deterministic tests for importer normalization and boundary cases.
- Add a lightweight browser smoke test if the project already accepts a browser-test dependency.
- Add explicit data schema validation at import time and a documented dataset refresh procedure.
- Verify mobile layout, keyboard navigation, focus visibility, screen-reader announcements, source-link behavior, and both motion modes.

Acceptance criteria:

- Critical user workflows have tests that fail for known regressions.
- The app has a reproducible dataset refresh from a pinned upstream snapshot.
- Accessibility checks cover behavior, not just static markup inspection.

### Optional later work

- Add filters only after the data schema is authoritative and tested.
- Add richer recipe metadata/images only with clear licensing and a performance budget.
- Add analytics or persistence only if a product need exists; neither is necessary for the current portfolio goal.
- Keep the static architecture. There is no evidence supporting a backend, framework migration, microservices, or new infrastructure.

## Unanswered questions that affect decisions

1. Which license does the owner want for Foodandish, and has the upstream recipe dataset’s license/redistribution scope been confirmed for the copied text?
2. Should imported data be committed as a generated artifact, or should the application read generated JSON at build time?
3. Is `foodandish.ir` intended to be the canonical public URL, and are DNS/HTTPS/custom-domain settings currently active?
4. Are the 20 curated records intentionally hand-maintained, or were they meant to be reproducible from a specific upstream dataset revision?
5. Is the target portfolio claim a polished frontend prototype or a reusable open-source recipe dataset pipeline? The second claim requires substantially more provenance and validation than exists today.

## Concise handoff summary

1. **What it does and structure:** A static React/Vite app renders a slot-reel recipe lottery. `App` owns UI state, `src/lib/recipes.ts` owns selection/reel logic, `src/data/recipes.ts` owns the shipped dataset, and a GitHub Pages workflow builds/deploys `dist`.
2. **Most important verified problems:** The importer output is unused; licensing/attribution is incomplete; CI skips tests/lint; reduced-motion still waits three seconds; all current source links are HTTP.
3. **Already implemented well:** Focused scope, static deployment, strict TypeScript, separated selection logic, deterministic helper tests, repeat-spin guard, visible focus styling, and no server/secrets.
4. **First improvement batch:** Make the data pipeline authoritative, add attribution/license provenance, gate deployment on test/lint, and synchronize reduced-motion timing. These changes remove the biggest correctness and credibility gaps without expanding the architecture.
5. **Owner input genuinely required:** project license/upstream redistribution decision, authoritative data workflow, canonical domain status, and whether the portfolio should emphasize a frontend prototype or a reproducible data pipeline.

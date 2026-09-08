# Project context — Frank Le portfolio site

Read this before making changes. It's the compressed version of a longer planning conversation (Cowork, Sept 2026) — the `docs/` folder has the full detail on any point below.

## Who this is for
Lê Vũ Xuân Anh ("Frank Le") — 4th-year Global Business & Digital Arts student at Waterloo, filmmaker (director/writer/editor) and UI/UX designer. Not a high-level code writer — prefers to direct/review, wants changes explained plainly. See `docs/bio.md`.

## What this site is
A single unified portfolio (not split by discipline) covering both his design work and his filmmaking, aimed at landing design job/internship opportunities and film-industry contacts. Recruiters are expected to skim, not read deeply — content and layout should favor skimmability over density.

## Structure (see docs/sitemap.md for full detail)
- `index.html` — Homepage: hero (headline + role labels + two CTA links) and an empty `<section id="work-grid">` slot where Frank is embedding a third-party grid component. The featured carousel and text index that used to sit there were removed Sept 8 2026 on his instruction — don't rebuild them. Anchor page — every other page links back to it.
- `about.html` — headshot + expanded bio + a skimmable facts capsule.
- `works.html` — grid of all works, filterable by type / year / commercial, reads `data/works.json`.
- `work.html?id=<id>` — one flexible detail template (not a separate file per project) driven by the same JSON. Content order: title/role/tools metadata → credits → awards slot → five-beat insight passage (what / problem / audience / process / result) → full-bleed media → next-project pager.
- `contact.html` — public email (academic + business, see `docs/contact.md`), LinkedIn, CV download slot (no file yet).
- Nav: unboxed floating type (no sticky bar/background/border), with **two display modes the visitor toggles between** — `List` (classic inline links) and `Tree` (a literal branching node diagram in a full-page panel). Built Sept 8 2026 in `js/nav.js`; the mode persists in `localStorage` (`nav-mode`) and is applied pre-paint by a one-line inline script in each page's `<head>`. The tree is generated from `data/works.json`, so adding a project adds a node. The plain `<ul>` links stay in the HTML as the no-JS fallback — don't move them into JS.

## Design system (see docs/style-direction.md for full rationale)
- Palette: strictly black/white. **Paper is pure `#FFFFFF` as of Sept 8 2026** (Frank's direct instruction — this reversed the earlier off-white `#f5f2ea` "open book paper" value; don't restore it). Ink stays near-black `--ink: #16140f`, and the two grays (`--paper-dim`, `--ink-soft`) were retoned neutral at the same time so they don't read dirty on a white sheet. No accent color. Hairlines/borders (`--line`) resolve to ink directly.
- Type: split-role system. Serif (`"Times New Roman", Times, Georgia, serif`) for headlines/bio/narrative — literary voice. Grotesk (`"Helvetica Neue", Helvetica, Arial, sans-serif`) small/functional for nav/labels/metadata — structural voice. Both are literal system fonts on purpose (unstyled/default look is part of the brutalist-editorial statement) — don't swap in a webfont without asking.
- Scale (**revised Sept 2026 — read this before touching type sizes**): monumental display (`--step-3`/`--step-4`, pushed toward 135-188px territory) against quiet functional labels, with an extreme jump and nothing in between. This REVERSES the original "restrained/consistent scale, boldness lives in layout not type" call — boldness now lives in both. Don't quietly revert to smaller headline sizes; that undoes a deliberate, confirmed decision.
- Grid: deliberately asymmetric/broken (12-col grid, intentional uneven spans) AND full-bleed as of Sept 2026 (`--max-w: none` — no centered max-width container).
- Media: full color, full-bleed, but every `.media-frame` now has a 1px ink hairline border and square corners (no radius, no soft edges) as of Sept 2026.
- Motion, split by purpose: content entering on scroll keeps the slow editorial curve (`--ease`, ~0.7-0.9s, via `js/site.js`'s IntersectionObserver `.reveal`); anything the visitor operates directly — menu toggle, tree panel, expand buttons, filters — uses `--ease-out` at 140-220ms with exits faster than entries and `scale(0.97)` press feedback. Hover rules are gated behind `@media (hover: hover) and (pointer: fine)` so they don't stick on touch. Respect `prefers-reduced-motion`.
- North star for any visual judgment call: does this make the homepage feel like "a filmmaker made this," not like a generic design-student portfolio site.

## Art-direction revision (Sept 2026)
After the first full draft, Frank referenced this case study for a more brutalist/unconventional direction: https://styles.refero.design/style/5a7ba5ff-0476-4f3f-99f9-0b920534dde5 — full details and the reasoning behind what was and wasn't adopted are in `docs/style-direction.md` under "Art-direction revision." Short version: monumental type scale was adopted, full-bleed layout was adopted, stark ink hairlines were adopted, the reference's single accent color was explicitly NOT adopted (site stays strictly black and white).

A second, deeper pass ("Art-direction revision, deepened" in `docs/style-direction.md`) pulled the reference's actual DESIGN.md/tokens rather than just its look, and tightened line-height (0.86), letter-spacing (-0.022em), added a `--section-gap` token for a more spacious inter-section rhythm, and restructured the homepage hero into a diagonal composition (headline top-left, facts/actions bottom-left, role meta bottom-right) — all using existing copy, no new content. Read that doc section before touching `.hero__*` or `--step-3` again: it also documents two bugs found and fixed along the way (a hero element collision, and the footer email wrapping mid-word once `--step-3` grew), both easy to reintroduce if these values move again without checking.

## Content model
All project content lives in `data/works.json` — one entry per project (id, title, type, year, commercial, featured, role, tools, credits, awards, insight {what/problem/audience/process/result}, media[]). Adding or editing a project is editing this file; no new HTML per project. Current entries are placeholders clearly marked `PLACEHOLDER` — real content (Frank's actual projects, images/video, headshot) has not been delivered yet as of this repo's creation.

## Known gaps / next steps
- Real work-sample content (3–6 projects) and headshot still need to be added to `data/works.json` / `assets/`.
- CV file not yet provided — `contact.html` has a placeholder slot.
- Homepage work grid: the carousel was removed Sept 8 2026; a third-party grid component goes into the empty `#work-grid` section instead. Not yet chosen or embedded.
- ~~Node-tree navigation is unbuilt~~ — built Sept 8 2026 as a nav display mode (see Structure above).
- Two small open questions from the brief (docs/creative-brief.md, sections 3 and 9) were answered with Claude's stated default assumptions — flagged inline, worth confirming with Frank rather than silently changing.
- One piece of drafted copy still needs Frank's sign-off: the About page facts capsule (disciplines / studying / tools / based in). The other drafted lines (footer availability line, Contact aside) were cut in the Sept 8 2026 pass. Bio, contact details and page structure all come from `docs/`.
- A literal vertical corner-stacked nav (closer to the refero.design reference) is still unbuilt; the horizontal nav plus the tree panel covers the ground for now.

## Working style
Frank reviews and gives direction; explain non-obvious technical decisions in plain terms rather than assuming familiarity with the codebase. No build tools/framework (plain HTML/CSS/JS). Frank authorized React/Next on Sept 8 2026 and it was declined for two concrete reasons, both still true: **Node isn't installed on his machine** (`node`/`npm`/`npx` all absent, no nvm), so anything with a build step couldn't be run or previewed there without setting that up first; and the only stateful piece in a five-page static site is the nav menu, which is ~200 lines of vanilla JS. Revisit only if the site grows something a framework actually earns — and install Node first.

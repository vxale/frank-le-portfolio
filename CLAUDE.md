# Project context — Frank Le portfolio site

Read this before making changes. It's the compressed version of a longer planning conversation (Cowork, Sept 2026) — the `docs/` folder has the full detail on any point below.

## Who this is for
Lê Vũ Xuân Anh ("Frank Le") — 4th-year Global Business & Digital Arts student at Waterloo, filmmaker (director/writer/editor) and UI/UX designer. Not a high-level code writer — prefers to direct/review, wants changes explained plainly. See `docs/bio.md`.

## What this site is
A single unified portfolio (not split by discipline) covering both his design work and his filmmaking, aimed at landing design job/internship opportunities and film-industry contacts. Recruiters are expected to skim, not read deeply — content and layout should favor skimmability over density.

## Structure (see docs/sitemap.md for full detail)
- `index.html` — Homepage: hero line (short bio) + featured-work carousel (pulled from `data/works.json` entries with `"featured": true`) + a full text index of every project. Anchor page — every other page links back to it.
- `about.html` — headshot + expanded bio + a skimmable facts capsule + a short selected-work index.
- `works.html` — grid of all works, filterable by type / year / commercial, reads `data/works.json`.
- `work.html?id=<id>` — one flexible detail template (not a separate file per project) driven by the same JSON. Content order: title/role/tools metadata → credits → awards slot → five-beat insight passage (what / problem / audience / process / result) → full-bleed media → next-project pager.
- `contact.html` — public email (academic + business, see `docs/contact.md`), LinkedIn, CV download slot (no file yet).
- Nav: a simple, unboxed text nav (no sticky bar/background/border as of the Sept 2026 revision below). Frank's long-term concept is a literal branching node-tree diagram as the nav — planned upgrade, not required for launch. Don't build it speculatively without checking in first, it's a real design task on its own.

## Design system (see docs/style-direction.md for full rationale)
- Palette: strictly black/white, but "open book" — off-white paper (`--paper: #f5f2ea`), near-black ink (`--ink: #16140f`), not pure `#FFFFFF`/`#000000`. No accent color (reaffirmed Sept 2026 — see revision note below). Hairlines/borders (`--line`) resolve to ink directly now, not a soft gray.
- Type: split-role system. Serif (`"Times New Roman", Times, Georgia, serif`) for headlines/bio/narrative — literary voice. Grotesk (`"Helvetica Neue", Helvetica, Arial, sans-serif`) small/functional for nav/labels/metadata — structural voice. Both are literal system fonts on purpose (unstyled/default look is part of the brutalist-editorial statement) — don't swap in a webfont without asking.
- Scale (**revised Sept 2026 — read this before touching type sizes**): monumental display (`--step-3`/`--step-4`, pushed toward 135-188px territory) against quiet functional labels, with an extreme jump and nothing in between. This REVERSES the original "restrained/consistent scale, boldness lives in layout not type" call — boldness now lives in both. Don't quietly revert to smaller headline sizes; that undoes a deliberate, confirmed decision.
- Grid: deliberately asymmetric/broken (12-col grid, intentional uneven spans) AND full-bleed as of Sept 2026 (`--max-w: none` — no centered max-width container).
- Media: full color, full-bleed, but every `.media-frame` now has a 1px ink hairline border and square corners (no radius, no soft edges) as of Sept 2026.
- Motion: smooth/fluid easing, not snappy/abrupt — unchanged by the Sept 2026 revision. Scroll reveals (`.reveal` class, added via `js/site.js`'s IntersectionObserver) and hover effects are the main interaction vocabulary. Respect `prefers-reduced-motion`.
- North star for any visual judgment call: does this make the homepage feel like "a filmmaker made this," not like a generic design-student portfolio site.

## Art-direction revision (Sept 2026)
After the first full draft, Frank referenced this case study for a more brutalist/unconventional direction: https://styles.refero.design/style/5a7ba5ff-0476-4f3f-99f9-0b920534dde5 — full details and the reasoning behind what was and wasn't adopted are in `docs/style-direction.md` under "Art-direction revision." Short version: monumental type scale was adopted, full-bleed layout was adopted, stark ink hairlines were adopted, the reference's single accent color was explicitly NOT adopted (site stays strictly black and white).

## Content model
All project content lives in `data/works.json` — one entry per project (id, title, type, year, commercial, featured, role, tools, credits, awards, insight {what/problem/audience/process/result}, media[]). Adding or editing a project is editing this file; no new HTML per project. Current entries are placeholders clearly marked `PLACEHOLDER` — real content (Frank's actual projects, images/video, headshot) has not been delivered yet as of this repo's creation.

## Known gaps / next steps
- Real work-sample content (3–6 projects) and headshot still need to be added to `data/works.json` / `assets/`.
- CV file not yet provided — `contact.html` has a placeholder slot.
- Homepage carousel is native scroll-snap for now; Frank plans to bring in an external carousel library — markup hooks (`.carousel`, `.carousel__track`, `.carousel__item`) are there so this should be a styling swap, not a rebuild.
- Node-tree navigation is unbuilt by design (v2).
- Two small open questions from the brief (docs/creative-brief.md, sections 3 and 9) were answered with Claude's stated default assumptions — flagged inline, worth confirming with Frank rather than silently changing.
- Some site copy was drafted rather than supplied by Frank and needs his sign-off: the footer line "Open to design internships and film collaborations", the About page facts capsule (disciplines / studying / tools / based in), and the Contact page note. Bio, contact details and page structure all come from `docs/`.
- The node-tree nav aside, a literal vertical corner-stacked nav (closer to the refero.design reference) was considered but not built during the Sept 2026 revision — the simpler unboxed horizontal nav was kept to limit risk. Worth revisiting if Frank wants to push navigation further toward the reference.

## Working style
Frank reviews and gives direction; explain non-obvious technical decisions in plain terms rather than assuming familiarity with the codebase. No build tools/framework by design (plain HTML/CSS/JS) — keep it that way unless Frank explicitly asks to add one.

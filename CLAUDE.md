# Project context — Frank Le portfolio site

Read this before making changes. It's the compressed version of a longer planning conversation (Cowork, Sept 2026) — the `docs/` folder has the full detail on any point below.

## Who this is for
Lê Vũ Xuân Anh ("Frank Le") — 4th-year Global Business & Digital Arts student at Waterloo, filmmaker (director/writer/editor) and UI/UX designer. Not a high-level code writer — prefers to direct/review, wants changes explained plainly. See `docs/bio.md`.

## What this site is
A single unified portfolio (not split by discipline) covering both his design work and his filmmaking, aimed at landing design job/internship opportunities and film-industry contacts. Recruiters are expected to skim, not read deeply — content and layout should favor skimmability over density.

## Structure (see docs/sitemap.md for full detail)
- `index.html` — Homepage: hero line (short bio) + featured-work carousel (pulled from `data/works.json` entries with `"featured": true`). Anchor page — every other page links back to it.
- `about.html` — headshot + expanded bio.
- `works.html` — grid of all works, filterable by type / year / commercial, reads `data/works.json`.
- `work.html?id=<id>` — one flexible detail template (not a separate file per project) driven by the same JSON. Content order: title/role/tools metadata → credits → awards slot → five-beat insight passage (what / problem / audience / process / result) → full-bleed media.
- `contact.html` — public email (academic + business, see `docs/contact.md`), LinkedIn, CV download slot (no file yet).
- Nav is a placeholder v1 (plain text links). Frank's long-term concept is a literal branching node-tree diagram as the nav — planned upgrade, not required for launch. Don't build it speculatively without checking in first, it's a real design task on its own.

## Design system (see docs/style-direction.md for full rationale)
- Palette: strictly black/white, but "open book" — off-white paper (`--paper: #f5f2ea`), near-black ink (`--ink: #16140f`), not pure `#FFFFFF`/`#000000`. No accent color.
- Type: split-role system. Serif (`"Times New Roman", Times, Georgia, serif`) for headlines/bio/narrative — literary voice. Grotesk (`"Helvetica Neue", Helvetica, Arial, sans-serif`) small/functional for nav/labels/metadata — structural voice. Both are literal system fonts on purpose (unstyled/default look is part of the brutalist-editorial statement) — don't swap in a webfont without asking.
- Scale: large overall register, but restrained/consistent jumps between sizes — don't make headlines dramatically larger than body copy, the boldness lives in layout, not type scale.
- Grid: deliberately asymmetric/broken (12-col grid, intentional uneven spans) — this is where "unconventional" energy belongs, since type and motion stay calm.
- Media: full color, full-bleed, no contained frames.
- Motion: smooth/fluid easing, not snappy/abrupt. Scroll reveals and hover effects are the main interaction vocabulary. Respect `prefers-reduced-motion`.
- North star for any visual judgment call: does this make the homepage feel like "a filmmaker made this," not like a generic design-student portfolio site.

## Content model
All project content lives in `data/works.json` — one entry per project (id, title, type, year, commercial, featured, role, tools, credits, awards, insight {what/problem/audience/process/result}, media[]). Adding or editing a project is editing this file; no new HTML per project. Current entries are placeholders clearly marked `PLACEHOLDER` — real content (Frank's actual projects, images/video, headshot) has not been delivered yet as of this repo's creation.

## Known gaps / next steps
- Real work-sample content (3–6 projects) and headshot still need to be added to `data/works.json` / `assets/`.
- CV file not yet provided — `contact.html` has a placeholder slot.
- Homepage carousel is native scroll-snap for now; Frank plans to bring in an external carousel library — markup hooks (`.carousel`, `.carousel__track`, `.carousel__item`) are there so this should be a styling swap, not a rebuild.
- Node-tree navigation is unbuilt by design (v2).
- Two small open questions from the brief (docs/creative-brief.md, sections 3 and 9) were answered with Claude's stated default assumptions — flagged inline, worth confirming with Frank rather than silently changing.

## Working style
Frank reviews and gives direction; explain non-obvious technical decisions in plain terms rather than assuming familiarity with the codebase. No build tools/framework by design (plain HTML/CSS/JS) — keep it that way unless Frank explicitly asks to add one.

# Site Map

## Pages
- **Homepage** — the anchor page, and as of Sept 8 2026 it is *only* the node-tree canvas: a full-viewport blank sheet with the draggable branching diagram on it, plus four quiet corner marks (name, role line, drag hint, email). No hero, no sections, no footer, no scroll. The hero line and the `#work-grid` slot were both removed when the canvas replaced them.
- **About** — headshot + expanded/longer bio.
- **Works** — grid of all works, with filtering by: type (design/film/etc.), year, and commercial vs. non-commercial. Each item links to its own dedicated work/case-study page.
  - **Work detail (per project)** — one flexible template that adapts per project (film short vs. UI/UX case study need different content blocks: video/credits vs. process shots/write-up). Content should stay tidy, concise, and skimmable — Frank expects recruiters to skim rather than read in depth, so the template should favor visual/structural clarity over long text.
- **Contact** — contact info (see docs/contact.md): email, LinkedIn, CV download slot.

## Navigation rule
Every page must retain a way back to the Homepage — still true, now via `.page-head`: the nameplate and a single `← Node tree` link, on every page that isn't the canvas. There is no list menu anywhere on the site as of Sept 8 2026; the canvas is the menu.

## Works grid filters (decided)
Filter by: type, year, commercial/non-commercial.

## Work detail template (decided)
One flexible/adaptive template, not fully custom per project. Design priority: tidy, concise, straight to the point — built for skimming, not reading.

Content per project, in order:
1. Title, role, tools/discipline metadata.
2. Credits (important to Frank).
3. Awards/accolades slot (none yet, but reserve the space in the template).
4. A short insight passage, structured in five beats: what is the work? → what is it trying to solve? → who is it meant for? → how did I do it? → what was the result? Each beat should be presented as a short, clearly labeled/skimmable unit (not a dense paragraph) to stay consistent with "recruiters skim" — likely needs typographic treatment (e.g. each beat as its own short block) rather than running prose.
5. Images/video, full-bleed.

## Homepage carousel (SUPERSEDED Sept 8 2026 — removed; a third-party grid goes in the `#work-grid` slot instead)
A `featured` flag (+ optional order field) on each Works entry — the carousel pulls flagged entries rather than maintaining a separately curated list. Frank plans to use an external/third-party carousel component — will likely need restyling to match the black-and-white editorial system rather than keeping default plugin styling.

## Node-tree menu (BUILT Sept 8 2026 — shipped as one of two menu display modes, toggled by the visitor; see docs/style-direction.md)
Frank's concept: a literal branching diagram the visitor clicks through, replacing/supplementing conventional nav. Confirmed as a "nice to have to design well" rather than a v1 blocker — v1 ships with a simpler placeholder nav (still on-brand), node-tree becomes a defined future upgrade rather than something solved before launch.

# Visual Style Direction (see docs/creative-brief.md for the full original Q&A)

Frank's stated direction:

- Unconventional, minimal, humanistic, straight to the point — confirmed as still accurate.
- Brutalism as the core stylistic theme, but a considered/editorial version of it, not raw or chaotic.
- Animations and media assets are still included — just not as the dominant visual language; typography leads.

## Art-direction revision (Sept 2026)
After the first full draft, Frank asked to push the layout further toward brutalist/unconventional, referencing this case study: https://styles.refero.design/style/5a7ba5ff-0476-4f3f-99f9-0b920534dde5 (Leonid Kostetskyi's site — full-bleed no-max-width layout, monumental display type jumping straight to tiny utility labels with nothing in between, sharp/no-radius edges, stark hairline borders, one chromatic accent color).

Two decisions from that reference conflicted with earlier calls — Frank resolved both explicitly:
- **Type scale: go monumental.** Overrides the earlier "restrained and consistent scale" decision. Headline/page-title sizes were pushed hard toward the reference's 135-188px range (see --step-3/--step-4 in css/style.css); body/reading copy and functional labels stay where they were, since a working multi-page site still needs a legible reading tier the single-hero reference doesn't have to account for.
- **Color: stay strictly black and white.** Frank did NOT adopt the reference's single chromatic accent (oxblood) — the earlier "strictly black and white, no accent" decision holds. Everything else from the reference (layout, scale, restraint, hairlines) was adopted against the existing B&W palette instead.

What changed in the build as a result: `--max-w` is now `none` (full-bleed grid, no centered container cap), `--line` now resolves to ink (stark black hairlines everywhere instead of a soft tan `--line` color), `.site-nav` dropped its sticky/bordered/backgrounded bar in favor of unboxed floating type, and `.media-frame` gained a 1px ink hairline border (square-cornered, no shadows) to match the reference's bordered work frames.

## Art-direction revision, deepened (Sept 2026, second pass)
The first revision above was based on the reference's overall look. This second pass pulled its actual published DESIGN.md, its Tailwind v4 `@theme` block, and its raw CSS custom properties (colors, exact px sizes, line-heights, letter-spacing, spacing scale, radii) and compared them line-by-line against our own tokens. Result: three things already matched exactly (0 border-radius everywhere, no box-shadows/gradients anywhere, hairlines-not-shadows as the separation mechanism). The rest split into a numeric-tightening pass and a real layout change, both applied:

- **Line-height on monumental type: 0.98 → 0.86.** Matches the reference's `--leading-display`/`--leading-heading-lg` exactly. Applies to `.hero__line` and `.work-detail__title`.
- **Letter-spacing on monumental type: -0.015em → -0.022em.** Splits the difference in the reference's -0.020em to -0.025em range. Same two selectors.
- **`--step-3` max nudged 6.5rem → 7.5rem** (104px → 120px), pushing page titles further into the reference's 135-188px "monumental" band. `--step-4` (hero) nudged 10rem → 10.5rem (160px → 168px), already close to the reference's 165px display size.
- **New `--section-gap` token**, `clamp(3rem, 11vw, 12.5rem)`, replacing `.section`'s old fixed `clamp(3rem, 8vw, 7rem)` padding. Named and scoped after the reference's literal `--section-gap: 200px`, adapted down — 200px between every section on every page of a multi-page site reads as excessive; ours tops out around 200px only on very wide viewports and stays reasonable on laptop-width screens.
- **Homepage hero restructured into a diagonal composition**, adapted from the reference's four-zone layout (nameplate upper-left / nav upper-right / caption lower-left / role title lower-right). Our global nav already sits top-right on every page, so it wasn't duplicated in the hero. Inside the hero itself: `.hero__line` (the headline) now anchors top-left across columns 1–8; `.hero__meta` (role labels) sits at the bottom of that same row across columns 9–12; `.hero__slate` (name/location/year facts) and `.hero__actions` (the two CTA links) sit in a second row, bottom-left and bottom-right respectively. No new copy was written — this is a rearrangement of the four blocks that were already there.

Two bugs surfaced and were fixed during this pass, worth knowing about before touching hero or footer CSS again:
- `.hero__slate` and `.hero__line` originally shared both a grid row *and* overlapping columns while both using `align-self: end` — they collided visually. Fixed by giving `.hero__slate` its own grid row below the headline instead of trying to share the headline's row.
- `.site-footer__mail` reuses `--step-3` for its size (so the footer email reads at "monumental" scale too). The `--step-3` bump above made it too wide for its old `grid-column: 1 / span 8`, and it wrapped mid-word ("gmail.c" / "om") because the string has no spaces to break at. Fixed by widening it to `grid-column: 1 / -1`. If `--step-3` gets pushed larger again in the future, re-check this element specifically.

## Redesign pass (Sept 8 2026, third) — Frank's direction
Four instructions from Frank, all applied:

- **Paper is now pure `#FFFFFF`.** This REVERSES the long-standing "not stark/clinical, open-book off-white" call recorded below — Frank asked for it directly, so the old `--paper: #f5f2ea` is gone. Two knock-on changes were made to keep the sheet coherent: `--paper-dim` (media placeholder fill) went from warm tan `#ece7da` to neutral `#f1f1f1`, and `--ink-soft` (labels/metadata) from warm olive `#55503f` to neutral `#5c5a55`, because the warm grays read as dirty against pure white. `--ink` stays `#16140f` — a near-black, so the page still reads as printed rather than clinical. If Frank wants the warm grays back, those are two token lines.
- **Node-tree navigation shipped, as a display mode rather than a replacement.** The menu now has a toggle — `List` (classic inline links) vs `Tree` (a literal branching diagram in a full-page panel). The choice persists in `localStorage` under `nav-mode`, and an inline script in each page's `<head>` applies it before first paint so tree mode doesn't flash the list first. The tree is built from `data/works.json` by `js/nav.js`: root (Frank Le) → About / Works / Contact, with Works branching into type nodes (Film / Design / Photography, each showing a count and deep-linking to `works.html?type=…`) which expand in place to the projects themselves. Connectors are CSS hairline elbows, not SVG, so they reflow with the type at any width. The plain `<ul>` links stay in the HTML, so with JS off the site still has working navigation.
- **Homepage work highlights removed.** The featured carousel and the full text index are both gone — Frank is embedding a third-party grid component there instead. `index.html` keeps an empty `<section id="work-grid">` as the marked embed point (`.section:empty` zeroes its padding so it costs nothing until filled). The `.carousel*` CSS and `js/home.js` were deleted with it; the "keep the carousel markup hooks for a library swap" plan below is therefore obsolete.
- **Dead copy and duplicate sections cut.** The homepage hero slate (name / "Film & Design" / location / "Portfolio 2026") duplicated the nameplate and the headline; the footer's "Open to design internships and film collaborations" line and its repeated page links duplicated the nav; the About page's selected-work index duplicated Works (the node tree covers that job now); the Contact page's aside note restated its own labels. All removed. The footer is now the email at monumental scale, LinkedIn, and a copyright line.

Motion added in this pass follows a split: content entering on scroll keeps the slow editorial `--ease` curve, while anything the visitor operates directly (menu toggle, tree panel, expand buttons, filters) uses a new `--ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) at 140–220ms, with exits faster than entries and `scale(0.97)` press feedback. Hover effects are gated behind `@media (hover: hover) and (pointer: fine)` so they stop firing on tap.

Still no framework: React/Next were authorized for this pass, but Node isn't installed on Frank's machine, and a five-page static site whose only stateful piece is this menu doesn't need one. See CLAUDE.md.

## Canvas rebuild (Sept 8 2026, fourth pass)
Frank's direction: bring the hero line back down, delete the list menu entirely, make the node tree the site's navigation and its main feature on a blank canvas with draggable nodes, use a single typeface throughout, and take the boxes off buttons. Worked against the `emil-design-eng` design-engineering skill.

- **Typography is now a single family.** `--font` (Times) sets everything — headlines, labels, metadata, the tree. The split serif/grotesk system is retired. This is the harder discipline: with no second family to signal "this is structural", hierarchy has to come from size, case and letter-spacing alone. Small tracked caps in the serif do the job the grotesk used to.
- **Scale came down.** The monumental 135-188px tier is gone; `--step-3`/`--step-4` sit in a normal editorial range. The site's boldness now lives in the canvas being the first thing you meet, not in type size. This reverses the second and third passes above.
- **No boxes on anything pressable.** Filters and the CV slot lost their borders and their filled selected state; a rule under the word and a shift to full ink carry state instead.
- **Navigation is spatial, not a list.** See the Navigation section below.

## Color (decided)
Strictly black and white — no accent color, reaffirmed during the Sept 2026 revisions above. Paper is pure `#FFFFFF` as of Sept 8 2026 (Frank's direct instruction — this replaced the earlier off-white "open book paper" value; see the third revision pass above). Ink remains a near-black `#16140f` rather than `#000000`. Hairlines/borders now use that same ink tone directly (`--line: var(--ink)`) rather than a softer gray, for more graphic contrast.
Assumed (Claude default, unconfirmed): no functional meaning for color — interactive states are shown via weight/underline/motion instead, since there's no accent color to spare.

## Typography (decided — single family as of Sept 8 2026)
- Split-role system:
  - Serif, used big/blunt/unstyled (Times New Roman-like), for headlines/bio/narrative content — the literary/humanist voice.
  - Neutral grotesk (Helvetica-family), small and functional, for nav/filters/captions/metadata — the structural voice.
- Personality: refined editorial typography (not a loud poster/condensed/grid-breaking face).
- Scale (revised Sept 2026): monumental display vs. quiet labels, with an extreme jump between them rather than a graduated staircase — see the Art-direction revision note above. This reverses the original "restrained and consistent" call; the boldness now lives in BOTH layout and type scale.
- Implemented in code as: `"Times New Roman", Times, Georgia, serif` (--serif) and `"Helvetica Neue", Helvetica, Arial, sans-serif` (--sans) — literal system fonts, deliberately unstyled/default rather than a licensed webfont, which is itself part of the brutalist-editorial statement.

## Layout & Grid (decided)
- Deliberately "broken"/asymmetric grid — this is where the "unconventional" energy lives.
- Full-bleed: no max-width cap on the content container as of the Sept 2026 revision (`--max-w: none`) — content runs edge to edge within the responsive gutter, rather than being capped and centered.
- Generous white space — keeps the broken grid feeling considered rather than cluttered.
- Implemented as a 12-column CSS grid with intentional asymmetric spans (see css/style.css — `.work-card:nth-child` rules, hero column offsets).

## Imagery & Media (decided)
- Full color photography/video (only source of color on an otherwise B&W site — makes the work itself the visual focus).
- Full-bleed (edge to edge), not contained in soft frames — but as of the Sept 2026 revision, every media frame has a 1px ink hairline border and square corners, matching the reference's "bordered, no-radius" work frames.
- Headshot: ready (Frank has the file — not yet delivered to this repo, see assets/).

## Motion & Interaction (decided)
- Scroll behaviors and hover effects as the main interaction language (implemented as IntersectionObserver-based `.reveal` fades, see js/site.js).
- Smooth/fluid motion (not snappy/abrupt) — this did NOT change in the Sept 2026 revision; the reference's brutalism comes from layout/type/hairlines, not from abrupt motion.
- Homepage highlights were removed entirely in the Sept 8 2026 pass (see above) — the carousel and its markup hooks are gone, and a third-party grid component goes into the `#work-grid` slot instead.

## Navigation (decided — node-tree canvas IS the site, Sept 8 2026)
The homepage is a blank canvas holding a branching node diagram. Nodes can be dragged anywhere; clicking a branch reveals its children, clicking a leaf opens that page. It is generated from `data/works.json`, so the menu and the work stay in sync automatically. There is no list menu anywhere on the site — inner pages carry a nameplate and one link back to the canvas.

Motion decisions behind it (all from the design-engineering framework): children grow outward from the parent that spawned them rather than fading in where they land; entering takes 260ms and leaving 170ms, because expanding is the visitor deciding and collapsing is the system responding; dragging has no transition at all so a node tracks the hand exactly; press feedback is a 0.97 scale on the label; hover rules are gated to fine pointers; and under `prefers-reduced-motion` nodes still appear and disappear, they just don't travel to do it.

### Superseded — the previous panel version

- Nameplate + controls float on the paper: no sticky bar, background, or border.
- Two display modes, chosen by the visitor and remembered (`localStorage` key `nav-mode`):
  - **List** — the classic inline text links. The default, and the no-JS fallback.
  - **Tree** — the literal branching node diagram Frank has wanted since the start, opened as a full-page panel. Root → About / Works / Contact; Works expands into type branches, which expand into the projects.
- Built in `js/nav.js`; styles under "Nav" and "Node-tree panel" in `css/style.css`. The tree reads `data/works.json`, so adding a project adds a node — nothing to maintain by hand.

## Reference sites
Sourced Sept 2026 — worth spot-checking as brutalist sites redesign often:
- **Mike Lamont** (mikelamont.co) — white bg/black type, plain index-style layout, everything visible with minimal clicking. Closest match to "straight to the point."
- **Balenciaga.com** — monospace type, hard edges, restrained palette; brutalism read as premium/considered rather than raw, fits "humanistic."
- **Are.na** — structure/typography as the visual language itself, no illustration or color needed.
- **Bloomberg Businessweek** (editorial) — oversized typography, confident scale/hierarchy jumps.
- **Leonid Kostetskyi** (via refero.design case study linked above) — the direct reference for the Sept 2026 revision: full-bleed layout, monumental-vs-label type contrast, stark hairlines, no soft edges. Adopted for layout/scale/hairlines; NOT adopted for its single accent color.

## Assets status
Headshot and project images/video are ready on Frank's end but not yet placed into this repo's /assets folder or referenced in data/works.json.

## Success criterion for look & feel
The test for any specific choice: does it make the finished homepage feel like "a filmmaker made this" (Frank's stated target reaction), not like a generic design-student portfolio.

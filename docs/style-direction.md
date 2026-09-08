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

## Color (decided)
Strictly black and white — no accent color, reaffirmed during the Sept 2026 revision above. Specifically not stark/clinical digital pure white/black: Frank's reference is the paper of an open book — white to fairly off-white paper with black ink. Hairlines/borders now use that same ink tone directly (`--line: var(--ink)`) rather than a softer gray, for more graphic contrast.
Assumed (Claude default, unconfirmed): no functional meaning for color — interactive states are shown via weight/underline/motion instead, since there's no accent color to spare.

## Typography (decided)
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
- Frank plans to use an external/third-party carousel component for the homepage highlight carousel — current build uses native CSS scroll-snap with markup hooks (`.carousel`/`.carousel__track`/`.carousel__item`) designed to make swapping in a library later a styling change, not a rebuild.

## Navigation (decided)
- Long-term concept: a literal branching node-tree diagram the visitor clicks through, as the site's nav pattern.
- v1 (current build, revised Sept 2026): a simple text nav with no sticky bar, background, or border — just nameplate + links floating on the paper, no boxed chrome. Closer to the reference's "no conventional UI chrome" nav, short of actually building the node-tree diagram (still a v2 upgrade, not a launch blocker).

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

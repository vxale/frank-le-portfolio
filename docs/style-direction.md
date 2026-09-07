# Visual Style Direction (nearly complete — see docs/creative-brief.md for full Q&A)

Frank's stated direction:

- Unconventional, minimal, humanistic, straight to the point — confirmed as still accurate.
- Brutalism as the core stylistic theme, but a considered/editorial version of it, not raw or chaotic.
- Animations and media assets are still included — just not as the dominant visual language; typography leads.

## Color (decided)
Strictly black and white — no accent color. Specifically not stark/clinical digital pure white/black: Frank's reference is the paper of an open book — white to fairly off-white paper with black ink. This should inform the actual color values used (an off-white background, not #FFFFFF) rather than a generic "black on white" digital look.
Assumed (Claude default, unconfirmed): no functional meaning for color — interactive states are shown via weight/underline/motion instead, since there's no accent color to spare.

## Typography (decided)
- Split-role system:
  - Serif, used big/blunt/unstyled (Times New Roman-like), for headlines/bio/narrative content — the literary/humanist voice.
  - Neutral grotesk (Helvetica-family), small and functional, for nav/filters/captions/metadata — the structural voice.
- Personality: refined editorial typography at large scale (not a loud poster/condensed/grid-breaking face).
- Scale: restrained and consistent — large overall register, modest jumps between heading/body sizes. Boldness lives in layout, not type scale.
- Implemented in code as: `"Times New Roman", Times, Georgia, serif` (--serif) and `"Helvetica Neue", Helvetica, Arial, sans-serif` (--sans) — literal system fonts, deliberately unstyled/default rather than a licensed webfont, which is itself part of the brutalist-editorial statement.

## Layout & Grid (decided)
- Deliberately "broken"/asymmetric grid — this is where the "unconventional" energy lives, since type and motion both stay calm/restrained.
- Generous white space — keeps the broken grid feeling considered rather than cluttered.
- Implemented as a 12-column CSS grid with intentional asymmetric spans (see css/style.css — .work-card:nth-child rules, hero column offsets).

## Imagery & Media (decided)
- Full color photography/video (only source of color on an otherwise B&W site — makes the work itself the visual focus).
- Full-bleed (edge to edge), not contained in frames — consistent with the broken-grid approach.
- Headshot: ready (Frank has the file — not yet delivered to this repo, see assets/).

## Motion & Interaction (decided)
- Scroll behaviors and hover effects as the main interaction language.
- Smooth/fluid motion (not snappy/abrupt) — consistent with restrained type scale; disruption stays in layout, not in type or motion.
- Frank plans to use an external/third-party carousel component for the homepage highlight carousel — current build uses native CSS scroll-snap with markup hooks (`.carousel`/`.carousel__track`/`.carousel__item`) designed to make swapping in a library later a styling change, not a rebuild.

## Navigation (decided)
- Long-term concept: a literal branching node-tree diagram the visitor clicks through, as the site's nav pattern.
- v1 (current build): a simpler, on-brand text nav; node-tree is a defined future upgrade, not a launch blocker.

## Reference sites (Claude-proposed, sourced Sept 2026 — worth spot-checking as brutalist sites redesign often)
- **Mike Lamont** (mikelamont.co) — white bg/black type, plain index-style layout, everything visible with minimal clicking. Closest match to "straight to the point."
- **Balenciaga.com** — monospace type, hard edges, restrained palette; brutalism read as premium/considered rather than raw, fits "humanistic."
- **Are.na** — structure/typography as the visual language itself, no illustration or color needed.
- **Bloomberg Businessweek** (editorial) — oversized typography, confident scale/hierarchy jumps (reference for type scale, not for its color use).

## Assets status
Headshot and project images/video are ready on Frank's end but not yet placed into this repo's /assets folder or referenced in data/works.json.

## Success criterion for look & feel
The test for any specific choice: does it make the finished homepage feel like "a filmmaker made this" (Frank's stated target reaction), not like a generic design-student portfolio.

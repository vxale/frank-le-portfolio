# Project context — Frank Le portfolio site

Read this before making changes. It's the compressed version of a longer planning conversation (Cowork, Sept 2026) — the `docs/` folder has the full detail on any point below.

## Who this is for
Lê Vũ Xuân Anh ("Frank Le") — 4th-year Global Business & Digital Arts student at Waterloo, filmmaker (director/writer/editor) and UI/UX designer. Not a high-level code writer — prefers to direct/review, wants changes explained plainly. See `docs/bio.md`.

## What this site is
A single unified portfolio (not split by discipline) covering both his design work and his filmmaking, aimed at landing design job/internship opportunities and film-industry contacts. Recruiters are expected to skim, not read deeply — content and layout should favor skimmability over density.

## Structure (see docs/sitemap.md for full detail)
- `index.html` — Homepage: the node-tree canvas, which is also the site's only menu. Root "Frank Le" (portrait slot + the statement line as its caption) branches to: About → about.html, Moving Image / Design / Photography (each expanding straight to its projects — there is deliberately no "Works" level in between), All works → works.html, and Contact. Structure comes from `data/works.json`; see `js/node-tree.js`.
- `about.html` — headshot + expanded bio + a skimmable facts capsule.
- `works.html` — grid of all works, filterable by type / year / commercial, reads `data/works.json`.
- `work.html?id=<id>` — one flexible detail template (not a separate file per project) driven by the same JSON. Content order: title/role/tools metadata → credits → awards slot → five-beat insight passage (what / problem / audience / process / result) → full-bleed media → next-project pager.
- `contact.html` — public email (academic + business, see `docs/contact.md`), LinkedIn, CV download slot (no file yet).
- Nav: **the node-tree canvas is the navigation.** There is no list menu on any page. Inner pages carry `.page-head` — nameplate plus a single `← Node tree` link home. See "Canvas rebuild" below.

## Design system (see docs/style-direction.md for full rationale)
- Palette: strictly black/white. **Paper is pure `#FFFFFF` as of Sept 8 2026** (Frank's direct instruction — this reversed the earlier off-white `#f5f2ea` "open book paper" value; don't restore it). Ink stays near-black `--ink: #16140f`, and the two grays (`--paper-dim`, `--ink-soft`) were retoned neutral at the same time so they don't read dirty on a white sheet. No accent color. Hairlines/borders (`--line`) resolve to ink directly.
- Type: **one typeface, every job** (`--font`, Times) as of Sept 8 2026. The old split serif/grotesk system is gone and `--serif`/`--sans` no longer exist. Small tracked caps in the serif carry what the grotesk used to. Still a system font on purpose — don't swap in a webfont without asking, and don't add a second family.
- Scale: **one modular ladder, ratio 1.2, nine rungs (`--step-0` … `--step-8`), anchored on body at `--step-2`.** Rebuilt Sept 8 2026 — see "Type scale" in `docs/style-direction.md` for the table and the reasoning. There are no hand-picked font-sizes left in the stylesheet and there should never be another one: pick a rung, and note that steps 3, 5 and 7 are deliberately spare so there is always somewhere to go. Sizes barely moved in the rebuild (every old token became the one at double its index); the monumental tier had already been removed on Frank's instruction before it.
- Grid: deliberately asymmetric/broken (12-col grid, intentional uneven spans) AND full-bleed as of Sept 2026 (`--max-w: none` — no centered max-width container).
- Media: full color, full-bleed, but every `.media-frame` now has a 1px ink hairline border and square corners (no radius, no soft edges) as of Sept 2026.
- Motion, split by purpose: content entering on scroll keeps the slow editorial curve (`--ease`, ~0.7-0.9s, via `js/site.js`'s IntersectionObserver `.reveal`); anything the visitor operates directly — menu toggle, tree panel, expand buttons, filters — uses `--ease-out` at 140-220ms with exits faster than entries and `scale(0.97)` press feedback. Hover rules are gated behind `@media (hover: hover) and (pointer: fine)` so they don't stick on touch. Respect `prefers-reduced-motion`.
- North star for any visual judgment call: does this make the homepage feel like "a filmmaker made this," not like a generic design-student portfolio site.

## Art-direction revision (Sept 2026)
After the first full draft, Frank referenced this case study for a more brutalist/unconventional direction: https://styles.refero.design/style/5a7ba5ff-0476-4f3f-99f9-0b920534dde5 — full details and the reasoning behind what was and wasn't adopted are in `docs/style-direction.md` under "Art-direction revision." Short version: monumental type scale was adopted, full-bleed layout was adopted, stark ink hairlines were adopted, the reference's single accent color was explicitly NOT adopted (site stays strictly black and white).

A second, deeper pass ("Art-direction revision, deepened" in `docs/style-direction.md`) pulled the reference's actual DESIGN.md/tokens rather than just its look, and tightened line-height (0.86), letter-spacing (-0.022em), added a `--section-gap` token for a more spacious inter-section rhythm, and restructured the homepage hero into a diagonal composition (headline top-left, facts/actions bottom-left, role meta bottom-right) — all using existing copy, no new content. Read that doc section before touching `.hero__*` or `--step-3` again: it also documents two bugs found and fixed along the way (a hero element collision, and the footer email wrapping mid-word once `--step-3` grew), both easy to reintroduce if these values move again without checking.


## Canvas rebuild (Sept 8 2026, fourth pass) — READ THIS FIRST
Frank's direction, after living with the previous draft: the big hero line "wasn't working" and should come down; the list menu goes away **entirely** and the node tree becomes the site's navigation and its main feature, on a blank canvas, with nodes the visitor can drag; one typeface for everything; no boxes around buttons. Built against the `emil-design-eng` skill's decision framework.

What that means concretely, and what NOT to undo:
- **`index.html` IS the node tree.** No hero, no sections, no footer, no scroll — a full-viewport canvas (`js/node-tree.js`) with two quiet corner marks (drag hint, email — the name and role marks were folded into the root node). The old hero and the `#work-grid` slot are both gone.
- **There is no list menu anywhere on the site.** Inner pages get `.page-head`: nameplate plus one `← Node tree` link back. `js/nav.js`, the list/tree mode toggle and its `localStorage` key are deleted — don't reintroduce any of them.
- **One typeface.** `--font` (Times) does headlines, labels, metadata and the tree alike; `--serif`/`--sans` no longer exist. Hierarchy is size, case and spacing only. A second family undoes the whole idea.
- **The monumental scale is reversed.** `--step-3`/`--step-4` came back down to a normal editorial range. This supersedes the "don't quietly revert to smaller headline sizes" instruction from the earlier passes — Frank reversed it himself.
- **Nothing pressable has a box.** Filters and the CV slot use a rule under the word and full-ink color for their selected state, never a fill or a border.

Node-tree implementation notes worth knowing before editing `js/node-tree.js`:
- Structure is generated from `data/works.json` (root → About / Works / Contact, Works → type branches → projects, plus an "All works" leaf). Adding a project adds a node; nothing is hand-placed.
- Children are created at the parent's position and animate outward, so a branch visibly grows from where it came from. Entering is 260ms, leaving is 170ms — exits are faster than entries on purpose.
- **Drag uses window-level pointer listeners and deliberately does NOT call `setPointerCapture`.** Capturing retargets the press, so the browser fires the click on the node wrapper instead of the link/button inside it, and every click on the tree silently stops working. This was hit and fixed during the build; don't "improve" it back.
- A press only counts as a drag past 4px of movement, and a drag suppresses the click that would otherwise follow it — one press either moves a node or opens it, never both.
- Edges are trimmed to each label's bounding box rather than drawn centre-to-centre, so a connector never runs through the word it points at.
- **The paper is 1.75× the viewport** (`PAPER` in `pads()`, Sept 12 2026), not one screen's worth. Confining nodes to the k=1 viewport predates pan/zoom and deadlocked the separation pass the first time a branch carried three tall frames: they could not all fit in one screen height, `relax()` shoved them apart, `clampPosition()` shoved them back, twelve passes, still overlapping. The camera can zoom out to a third, so a larger paper is always showable, and `fitTo()` frames whatever spreads. The left margin is unchanged — the root's home is a composition.
- **`relax()`, `clampPosition()` and `markObstacles()` measure in world units** — screen size divided by `view.k` — like everything else that touches `node.x`/`node.y`. Read raw, a zoomed-out view under-measured every box, and the marks' world positions were simply wrong. Same date.
- With JS off the tree can't exist, so `index.html` carries a `<noscript>` list of the three page links. It is not a visible menu — it's the dead-end guard.

## Canvas pages and drift (Sept 9 2026)
`about.html`, `contact.html` and `work.html` were rebuilt as scrolling canvases so they stop reading as a different website from the node tree. Full reasoning in `docs/style-direction.md` under "Canvas pages" and "Ambient drift". The short version, all of which is easy to undo by accident:

- **No rules, no boxes, no columns** anywhere on these pages — and the works grid lost its media borders too, because that is a site-wide art-direction rule now. Layout comes from an invisible 12-column placement grid.
- **Work pages lead with media**, writing after and quieter. This reverses the original template order in `docs/sitemap.md` on Frank's instruction.
- **`js/drag.js`** is the shared drag: a transform offset from the layout position, so nothing reflows. It repeats the node tree's two rules — window listeners, no `setPointerCapture`, 4px threshold, drag suppresses the click.
- **Drift** is 2–4px over 9–15s, paused on hover/focus/drag, off under reduced motion, on its own transform layer. Do not raise the amplitude: these are click targets.
- `js/node-tree.js` still has its **own** drag implementation, older than `js/drag.js`. They should converge next time the tree is touched; it was left alone here to avoid regressing recent work on it.


## The root node (Sept 10 2026)
The canvas opens on Frank's name, and it carries three things in a fixed relationship:

- **`Lê Vũ Xuân Anh`** at `--step-6` — the name on his passport, and the node's label.
- **`Frank Le`** beside it at `--step-4` — the name he works under, on the same baseline and two rungs down, so it reads as an alias rather than a second heading. It comes from the root spec's `alias` field in `js/node-tree.js`.
- **The statement** below both, at `--step-3`, breaking across two lines. Copy lives in `ROOT_CAPTION` at the top of `js/node-tree.js` so it can be edited without reading layout code.

Two things here are easy to break:

`.node__caption` must keep **`display: block`**. As a bare `<span>` it is inline, so it sat on the same line as the names, ran the full width of the canvas, and silently ignored its `max-width` — inline boxes don't take one. That is exactly the "occupying too much space" problem it was rebuilt to fix.

Its measure is **tuned to the current copy** to break in two lines. If `ROOT_CAPTION` changes materially, re-check the wrap; the number is fitted to the sentence, not derived from a rule.

## Content model
All project content lives in `data/works.json` — one entry per project (id, title, type, year, commercial, featured, role, tools, credits, awards, insight {what/problem/audience/process/result}, media[], optional thumb).

`type` is a key, not a label: `film`, `design`, `photography`. The word shown on every surface — node tree, filter bar, filter cue, card meta, project marks — comes from `typeLabel()` in `js/site.js`, where `film` reads as **Moving Image** (Frank, Sept 12 2026). The key stayed `film` so existing `?type=film` links keep working and the data stays short to type; rename it there and the label, not the data, is where to change it.

`thumb` is optional. The node tree prefers it (`thumb`, else `media[0]`, above the title); the works-grid card goes the other way (`media[0]`, else `thumb`), so a project whose only clip is a node thumb still gets it on its card rather than a placeholder (Frank's instruction, Sept 12 — Gái Đẹp was the case). The project page draws `media[]` only. No media, no frame — the node stays type-only. The root "Frank Le" node has its own portrait slot, set by the `ROOT_MEDIA` constant at the top of `js/node-tree.js` (a path in `/assets`; empty means no frame). Both accept `{ type: "image" | "video", src, width, height, alt }`, plus `poster` and `webm` for video. Node clips autoplay muted (hover/focus-only under reduced motion).

**Every imported file is shown at its native aspect ratio — Frank's standing rule, Sept 12 2026.** Put the file's pixel `width` and `height` on the media object and the node frame takes those proportions before a byte has loaded, so the tree's separation pass measures the true box; leave them off and `js/node-tree.js` reads the ratio from the file once its metadata arrives and re-settles the tree around it. Frames are sized by their **longer** edge (`--edge`, 12em on a project node, 9.6em on the root), so a portrait clip and a landscape one carry the same visual weight and neither is cropped. Get the numbers with `sips -g pixelWidth -g pixelHeight <file>` (images) or `mdls -name kMDItemPixelWidth -name kMDItemPixelHeight <file>` (video).

The rule is applied on the canvas **and on the project page** (Sept 12 2026, with Vision of Love — five 9:16 clips, the first project where the lead frame's 16:9 crop would have cut the dresses off). A frame whose media carries `width`/`height` renders as `.shot--native` at the file's ratio; portrait **and square** media (`height >= width`) is capped by *height* (`.floater--upright`, `min(78vh, 56rem)`) and its width follows — a square slipped past the original `>` test and rendered 1008px tall in the lead slot (Gái Đẹp's cover art, Sept 13), so a 9:16 clip across nine columns is ~395×700 rather than 1700px tall. Entries without dimensions — today, the placeholders — keep the composed shapes. **The works grid follows the same rule** (Frank, Sept 12 2026, after seeing Vision of Love cropped there): `cardMarkup()` puts `--ratio` on the frame with `.media-frame--native`, portrait media gets `.media-frame--upright` and is capped by height (`min(70vh, 48rem)`), landscape takes the card's full width. The composed crops by grid position now apply only to entries without pixels. Two things hold it together: the ratio rides on `--ratio` and **not** an inline `aspect-ratio`, because `sendHome()` (Tidy up) clears `style.aspectRatio`; and the height cap is `width`, not `max-width`, so the resize grip's inline width can still take a frame larger. Verified: resize holds 0.5625 exactly, Tidy up returns to the native box. The rule is now applied everywhere media is shown. Adding or editing a project is editing this file; no new HTML per project. Four entries are real (see Known gaps); the rest are placeholders clearly marked `PLACEHOLDER`, and the composed crops on the grid apply only to those. Stills: flat graphics with type stay PNG as delivered (the FCI recap slides, 0.7–2.1 MB each); photographic print masters are brought down to web size as JPEG (the Winter Cries posters came as 3792×4740 PNGs at 9–13 MB and went in at 1600×2000 JPEG q92, ~0.5–0.7 MB — the masters stay in `~/HANIFF/`, outside the repo). Native ratio either way.

## Known gaps / next steps
- Six real projects are in (Gái Đẹp Không Phải Buồn, TẤM CÁM BY MẢNH, Vision of Love — Moving Image; FCI Monthly News Recap, Winter Cries as It Says Goodbye — Poster Design, and Gái Đẹp Không Phải Buồn — Key Visuals — Design). Six `PLACEHOLDER` entries remain alongside them and the headshot is still to come.
- CV file not yet provided — `contact.html` has a placeholder slot.
- **Open question for Frank:** the homepage `#work-grid` slot (where a third-party grid component was going to be embedded) no longer exists, because the homepage is now the canvas. The grid on `works.html` is unaffected. If he still wants a third-party grid, it needs a home — `works.html`, or a new page.
- ~~Node-tree navigation is unbuilt~~ — built Sept 8 2026 as a nav display mode (see Structure above).
- Two small open questions from the brief (docs/creative-brief.md, sections 3 and 9) were answered with Claude's stated default assumptions — flagged inline, worth confirming with Frank rather than silently changing.
- One piece of drafted copy still needs Frank's sign-off: the About page facts capsule (disciplines / studying / tools / based in). The other drafted lines (footer availability line, Contact aside) were cut in the Sept 8 2026 pass. Bio, contact details and page structure all come from `docs/`.
- A literal vertical corner-stacked nav (closer to the refero.design reference) is still unbuilt; the horizontal nav plus the tree panel covers the ground for now.

## Working style
Frank reviews and gives direction; explain non-obvious technical decisions in plain terms rather than assuming familiarity with the codebase. No build tools/framework (plain HTML/CSS/JS). Frank authorized React/Next on Sept 8 2026 and it was declined for two concrete reasons, both still true: **Node isn't installed on his machine** (`node`/`npm`/`npx` all absent, no nvm), so anything with a build step couldn't be run or previewed there without setting that up first; and the only stateful piece in a five-page static site is the nav menu, which is ~200 lines of vanilla JS. Revisit only if the site grows something a framework actually earns — and install Node first.


## The view corner and the colour-mode crossfade (Sept 11 2026)

**The zoom bar** lives in the lower left of the canvas, above `Reset view`, and it both reports the scale and sets it. Four things about it are decisions rather than defaults:

- It is a real `<input type="range">`. A styled `<div>` with pointer handlers would have looked identical and cost arrow keys, Home/End, page-up/down, press-anywhere-on-the-track, and the screen-reader announcement. The price is a page of vendor pseudo-elements in `css/style.css`; it is worth paying. `aria-valuetext` is set on every change, or a screen reader reads the track position (`52`) instead of the scale it stands for (`100 per cent`).
- **The track is logarithmic.** 0.33x-1x and 1x-3x feel like the same amount of zooming but are very different spans of `k`; a linear track would spend most of its length on magnification nobody uses.
- **`MIN_K` is `1 / 3`, not `0.3`.** That makes the limits symmetric in log terms, which is what puts 1x exactly at the midpoint of the bar — slider 50 is scale 1.000, not 0.993. The tick under the track marks that midpoint and is positioned from `--zoom-home`, written by `js/node-tree.js` from the same two constants the slider maps, so it cannot drift if the limits ever change.
- **Dragging the bar zooms about the centre of the screen**, not the pointer: the pointer is on the control, not on the paper, so there is no point under the cursor worth holding still.

Everything reports through `syncZoom()`, called from `applyView`, so wheel, pinch, keyboard, a branch opening and reset all reach the bar by one path.

**`Reset view` now fades instead of vanishing**, and keeps its row in the grid whether shown or not. `[hidden]` cannot be transitioned (`display: none`), and a button that appeared by shoving the zoom bar upward made the corner twitch every time the paper moved. `js/node-tree.js` toggles `.is-shown` on the button itself — `resetMark` is the button now, not the corner it sits in, because the corner has a permanent occupant.

**Light/dark crossfades** rather than cutting. Two paths, in `js/theme.js`:

1. **A view transition** where the browser has one. It snapshots the page, applies the change, and dissolves old into new on the compositor — free for the main thread, which on this page is already drawing edges and drifting nodes every frame.
2. **Registered custom properties** where it does not. `@property` with `syntax: "<color>"` is what makes `transition: --ink` mean anything at all; unregistered, a custom property is just a string and will not interpolate. This path recalculates style for the whole document every frame, so the class that carries it is added for the length of the fade and taken off again.

Both run at **260ms linear**. Linear is not laziness: a crossfade composites two layers, and easing either one makes their opacities sum to something other than 1 through the middle, which shows as a bright or dark pulse halfway across. There is deliberately **no `prefers-reduced-motion` override** — nothing moves, it is a blend of two colour states, which is already the gentle variant that override would ask for.


## Inner-page chrome: the Navigate cue (Sept 11 2026)

Every inner page carried a `Frank Le` nameplate top-left and a `← Node tree` link top-right, and `work.html` added a `← All works` link of its own. All three are gone. The header now holds one thing, the colour mode, held to the right.

Navigation is a single cue fixed to the **lower right**: the word `Navigate` at 0.4 opacity, which grows a short branch upward when asked — `Navigate` → `All works` → `Home`. It is the node tree's own logic folded into a corner, and it is built in `js/navcue.js` + the "Navigate cue" block in `css/style.css`.

Five things here are decisions, not defaults:

- **The open state is a class, not `:hover`.** A touch browser fires a synthetic hover on tap that never leaves, which strands a CSS-only hover menu open on a phone. `js/navcue.js` opens on pointer only where `(hover: hover) and (pointer: fine)` matches and `pointerType !== 'touch'`, on `focusin` for the keyboard, and on click everywhere. Escape closes and returns focus to the trigger; a pointerdown outside closes.
- **The trigger is first in the markup and the column is `flex-direction: column-reverse`.** That is what makes the tab order run `Navigate → All works → Home`, bottom to top, the same direction the branch reads. Put the list first and the keyboard walks it backwards.
- **The rungs are folded into the trigger when closed** — each sits `--i × 0.8rem` lower than its open position, so opening *unfolds* rather than sliding a finished list into view. The hairline between rungs is a real edge, scaled from `transform-origin: 50% 100%`, so it grows upward out of the node below it exactly like the tree's edges grow out of a parent.
- **260ms out, 170ms back, 45ms stagger, `--ease-out`** — the same figures `js/node-tree.js` expands and collapses on, because it is the same gesture. Opening staggers upward from the trigger; closing runs the other way.
- **No halo.** The cues used to carry a five-stop `text-shadow` in `--paper` to stay legible over content; over a picture it read as a white glow around the letters, and Frank had it removed (Sept 12). Instead, **a cue with media under it turns white** — `.is-over-media`, set by `js/navcue.js` from measured geometry (trigger box, plus the rungs while open, against every `.media-frame` / `.floater` on the page), rechecked on `cards:moved`, live while a button is held, on scroll and on resize, rAF-throttled. The rest-state 0.4 opacity lifts to 1 in that state, or 40% white on a mid-tone frame would be invisible. Same white in both colour modes.

Two knock-on changes came with it:

- **`works.html` lost the inverted footer slab** and closes on `.end-marks` like every other page. It was the last piece of the pre-canvas design still standing, and it is also a full-width dark field the cue would have vanished into. Its CSS is deleted; git has it.
- **`.end-marks` now holds both marks to the left** instead of at opposite ends. The lower right belongs to the cue, and a branch opening on top of the copyright is worse than an asymmetry nobody will notice.


## Header geometry, and the works grid you can handle (Sept 11 2026)

**The colour-mode control now sits in the same place on every page.** `.page-head` was padded `1.5rem` at the top while the homepage holds its mark at `top: var(--gutter)`, so Light/Dark jumped 14px the moment you left the canvas. `.page-head` uses `var(--gutter)` on all sides now — measured at 1280px, the control's top edge is 38.39px and its right edge 53.39px on all five pages. If either figure is ever changed, change it in both places.

**`works.html` lost its section head and both rules** — the one under the heading and the one under the filter row. The `<h1>` survives as `.visually-hidden` text, because a page with no heading at all is a hole for anything reading structure rather than looking at it. `.section-head` and `.section-head__link` are deleted; works.html was their last user.

**The Navigate branch has three rungs**: `Back to top`, `All works`, `Home`, bottom to top. Rung count lives in `--rungs` on `.navcue` and the stagger maths reads it, so a fourth rung is a `:nth-child` line and a number, not a rewrite. `Back to top` is a `<button>` styled identically to the two links; it scrolls smoothly (instantly under reduced motion) and closes the branch behind itself.

### The works card

The card is no longer one big `<a>`. The media is something the visitor picks up and resizes now, so it cannot also be a link waiting to fire on mouseup; **the caption carries the link**, the way a node's label does on the homepage.

It is four nested elements, and the nesting is load-bearing — four things want a transform, and two on one element means the second silently wins:

| element | transform | owner |
| --- | --- | --- |
| `.work-card` | drag offset | `js/drag.js` |
| `.work-card__body` | scroll reveal | `js/site.js` |
| `.media-frame__move` | scroll parallax | CSS view timeline |
| `img` / `video` | hover scale | CSS |

Four things to know before touching it:

- **The view timeline is declared on `.media-frame`, not on the layer that uses it.** `.media-frame` has `overflow: hidden`, which makes it a scroll container — a `view()` timeline created *inside* it measures the layer against the frame, which never scrolls, and sits frozen at 50% progress forever. That was the first version, and it looked exactly like working code. Declared on the frame as `view-timeline-name: --card-view`, it measures against the page. Verified: progress runs 0.29 → 1.00 as a card crosses the viewport, moving the media about 33px.
- **Longhands, not the `animation` shorthand.** `animation: name linear both` sets `animation-duration: 0s`, and a progress-based timeline needs it left at `auto`.
- **Dragging is attached only where `(hover: hover) and (pointer: fine)` matches.** A drag needs `touch-action: none` on the card, and the cards cover most of this page — on a phone that would be a grid you cannot scroll past. Resizing is safe everywhere: only the small grip takes the press.
- **The resize grip calls `stopPropagation`**, which is what keeps one press from being a resize and a card drag at once. It clears `aspect-ratio` on first move (or the ratio rule fights the height) and clamps between 120px and 92% of the viewport width, so a frame can never push a horizontal scrollbar across the page.


## Resize, the filter cue, and one footer (Sept 11 2026)

**Resizing a work card's media holds its shape.** The frame's ratio is a composition decision made in CSS — 16:9, 3:4, 4:3, 1:1 by position in the grid — and letting a corner drag squash it would let anyone distort the work by accident. `makeResizable` in `js/drag.js` now projects the pointer onto the frame's own diagonal instead of reading dx and dy as two independent numbers: `along = (dx·r + dy) / (r² + 1)`, then `width = w₀ + along·r` and `aspect-ratio` does the height. Moving along the diagonal scales at full speed, moving across it barely counts, and a purely vertical pull still resizes rather than feeling dead. Verified across four drag directions: the ratio holds to four decimal places.

**The filter bar has a corner cue.** Scroll past it on `works.html` and `Filter` appears in the **lower left**, opening upward into the three filter groups; scroll back and it stands down and closes. Two things about it:

- It is **the same component as Navigate**, not a lookalike. `js/navcue.js` exports `setupCue` and wires anything carrying `data-cue`; the filter cue reuses `.navcue`'s classes and adds `.navcue--filter`, which is a pure horizontal mirror — lower left instead of lower right, edges hanging off the left of a rung instead of the right. Geometry, folding and direction all come from `.navcue` unchanged, so anything fixed in one is fixed in both.
- It holds **a second set of buttons, not a mirror of the state**. `makeButton`'s handler writes to `active` and then re-presses every `.filter-btn` on the page carrying that key, so both sets stay in step without a line of code that knows the other exists. Verified: clicking Moving Image in the corner presses Moving Image in the bar and filters the grid.

The two lower corners are where this site keeps the things you reach for rather than read, and a pair that behave identically is easier to learn than two that each have their own idea about which way a branch goes.

The cue also stands down when the **foot of the page** arrives, not only when the filter bar returns: it shares the lower left with the closing marks, and reaching the end of the works is finishing with them. `js/works.js` observes both `.filters` and `.end-marks` and shows the cue only while the first is gone and the second has not appeared.

**The project counter is gone.** The grid is short enough to see, and a running total is a database's idea of a portfolio.

**Every page closes the same way.** Four different footers had grown up: About and Works had the large address plus a quiet second line, Contact had only a copyright, and work pages had all three marks squeezed into one small line rendered by `js/work-detail.js` inside the field grid. All four now use the same static `<footer class="end-marks">`; `.end-marks__inline` and the JS that produced it are gone. Contact repeats its own address at the foot as a result — a small redundancy accepted so that every page ends identically.


## The works bar: options on hover, sort, tidy (Sept 11 2026)

**The filter bar rests as three pairs.** `TYPE ALL`, `YEAR ALL`, `MADE FOR ALL` — each group shows its name and its current answer, and the alternatives arrive when the pointer does. The hidden options **keep their space**, so a group never changes width and the row never shifts under the hand: measured, the Type group is 341px both at rest and hovered. Two scopes matter and are easy to get wrong:

- **`.filters` only.** Inside the corner cue the whole branch is already hover-revealed; a second hover inside the first would be a door behind a door, so the cue shows every option as soon as it opens.
- **Fine pointers only.** On touch there is nothing to reveal them with, so they stay out.

**Sort is a glyph and nothing else** (Frank's call — no text indication). An arrow that turns over: down is newest first, which is where it starts, up is oldest first. The half-turn is the whole control, so it is the one thing in that row that has to read as movement rather than a swap — 200ms, `--ease-out`. The accessible name carries what the arrow cannot say out loud and updates with the state. Sorting runs on a **copy**; `works` keeps the order `data/works.json` gives it, which is the order Frank maintains by hand.

**Tidy up appears only once something has been moved.** `js/drag.js` fires a `cards:moved` event when a drag or a resize finishes, and `window.sendHome(card)` puts one card back. Two details:

- **The journey home is animated; the crop is not.** Transitioning a frame's width would animate the height of the grid row it sits in, and through that the position of everything below — a page-wide reflow at 60fps to make a corner snap look smooth. The eye follows the card travelling and does not miss the rest. 320ms `--ease-in-out`, because this is a thing crossing the screen rather than arriving or leaving.
- The button **holds its place while hidden**, so the end of the row does not jump the first time a card is picked up.

**`.section` now opens like every other page.** Since the works heading and rules came out there was nothing at the top of the page to justify `--section-gap`, and the filter bar started 60px lower than the first line of every other page. `.section` uses `.field`'s figures now — `clamp(2rem, 7vw, 5rem)` top — and the gap below the header is 80px on works, contact and work pages alike. Change one, change both.


## Four corrections (Sept 11 2026)

**The tools hang off nothing.** The sort arrow and Tidy up sit above the filter branch with no edge joining them to it — `.navcue__item--tools::after { content: none }`. Sorting and tidying are things you do *to* the grid, not filters on the work in it, so the branch stops at the last filter group.

**Contact joins the Navigate branch**, between Back to top and All works. Bottom to top it now reads `Navigate → Back to top → Contact → All works → Home`. `--rungs` on `.navcue` is 4 and `:nth-child(4)` carries `--i: 4`; both cues use the same figures, so the filter cue's own override is gone.

**The media opens the project too.** `.media-frame` is an `<a>` on the works grid, so the card has two ways in. Two things hold it together:

- **Both manipulations swallow their own click.** `js/drag.js` already suppressed the click after a real drag; `makeResizable` now does the same after a resize, with its own guard rather than the drag's shared one — dragging is only attached on fine pointers, and a resize works everywhere. Verified: a click synthesised straight after a drag does not navigate, nor after a resize, and a plain click does.
- **The media link is `tabindex="-1"`.** It goes to the same place as the caption a line below it, and seven cards' worth of pressing Tab twice for one destination is a keyboard tax with nothing on the other side of it.

**The awards slot waits until there is an award.** It used to print "Awards & screenings — None listed yet" on every project, which is a page telling you what it hasn't got. The block is now conditional and still reads `awards` from `data/works.json`, so the first one added brings it back with no code change.


## Five more (Sept 11 2026)

**works.html and work.html sign off short** — copyright only, no address and no LinkedIn. This is a deliberate exception to "every page closes the same way" from earlier the same day, made on Frank's instruction (works.html Sept 11, the project pages Sept 12): those pages are the work itself, the ways to reach him are one rung up the Navigate branch in the corner, and repeating them under a project was a second ending to a page that already had one. About and Contact keep the full sign-off. **Do not "fix" it back.**

**Back to top is not a rung while you are at the top.** `js/navcue.js` toggles `.is-off` on it from a passive scroll listener, guarded so it only writes to the DOM when the boolean actually flips. `display: none` rather than a fade, so the branch closes up behind it and the hairline above it reaches the trigger instead of a gap. The threshold is 40px, not zero — a page can sit a hair off the top after a reload or a rubber-band, and a rung that flickers in and out of a menu is worse than one that waits a moment. The remaining rungs keep their `--i` from `:nth-child`, so the stagger starts 45ms in rather than at 0 when the rung is away; that is below noticing and not worth the machinery to fix.

**Choosing a filter settles its group.** The alternatives used to stay open after a click until the pointer moved off and back. `js/works.js` adds `.is-settled` on a real press (`event.detail > 0`, so a keyboard activation does not) and clears it on `pointerleave`. The CSS took two passes to get right, and both mistakes are worth knowing:

- The guard is **`:not(:has(:focus-visible))`, not `:not(:focus-within)`.** Clicking a button focuses it, so `:focus-within` is true after every mouse click — which held the group open and was precisely the bug the rule existed to fix.
- The **reveal** rule had the same problem in reverse and now reads `:has(:focus-visible)` too. With `:focus-within` there, moving the pointer away after a click left the options open, because the button you clicked still had focus.

`:focus-visible` is the one that means a keyboard is standing there, and a keyboard user must never have the thing under their focus hidden. Verified through the whole cycle: rest → hover → click → move away → hover again → Tab in.

**The CV moved from Contact to About**, beside the facts list rather than under it — same row, other side of the page (`.reach--cv`, column 7). It belongs where a recruiter is already reading, not on the page they go to afterwards.

**The email addresses carry the outward mark.** A `mailto:` leaves this site as surely as a link to LinkedIn does — it hands you to another application — and a reader who has learned what the mark means on one line should not have to relearn it on the next. No `target` (that would be wrong on a mailto); the hidden text says "opens your email app" rather than "opens in a new tab".


## Embedded video (Sept 12 2026)

`data/works.json` entries can carry an `embed` object — `{ type, id, url, author, authorUrl, music, musicUrl, label }`. Two hosts are implemented, `tiktok` and `youtube` (the latter added Sept 13 2026 for Gái Đẹp Không Phải Buồn's visualizer), and that is deliberate: another host means another branch in `js/work-detail.js`, **not** a general-purpose field holding iframe HTML. Pasting arbitrary markup out of a content file is how a data file turns into a security problem. When Frank pastes an embed code, take the video id out of it and discard the rest.

**YouTube** is the simpler of the two: a plain `<iframe>` built in code from `embed.id`, on `youtube-nocookie.com`, with the `allow`/`referrerpolicy`/`allowfullscreen` attributes YouTube's generator emits. Three things are decisions: the `?si=` share token YouTube appends is **dropped** (it identifies who shared the link and does nothing for playback); the frame takes nine columns at 16:9 rather than TikTok's 325px column, because a landscape player in a portrait slot is a postage stamp; and it keeps **square corners** — the 24px radius below is for TikTok's rounded card, and YouTube's player has no ears to hide. `loadEmbedScript()` runs for TikTok only. Unlike TikTok, YouTube is reachable from the test environment, so this player has been seen loading, not only reasoned about.

It is **TikTok's own published embed** — the `blockquote.tiktok-embed` plus `embed.js`, which Frank supplied — not a hand-rolled iframe. Four things to know:

- **The `<script>` cannot live in the template string.** `innerHTML` does not execute script tags. It is appended as a real element after the page is written (`loadEmbedScript`), guarded so it is added once and only on a project that has an embed. Verified: exactly one request to `embed.js` on this project, none at all on the other one.
- **The inline `max-width`/`min-width` moved into the stylesheet, and the width is 325px, not the 605px the generator suggests.** TikTok builds a fixed ~325px card whatever width it is given and centres it, painting the rest of the iframe white — invisible on white paper, a 605px white slab with the player in the middle of it in dark mode (Frank spotted it, Sept 12). Sized to the card there is nothing left over to paint. Measured 325px at 1440 and at 375, no overflow. The card's own caption strip under the video is TikTok's chrome inside a cross-origin frame and stays white in both modes; that part cannot be restyled from here.
- **The embed has a 24px radius — the one rounded corner on the site** (Frank's call, Sept 12). TikTok's card has rounded corners of its own, and at each one the iframe's white body showed through as a small white ear, plain in dark mode. `.tiktok-embed` and the iframe are clipped to 24px so nothing of the iframe body shows. The "0 border-radius everywhere" rule holds for everything we draw ourselves.
- **An embed replaces the `media[]` frames on the project page.** `js/work-detail.js` skips `frames` when `embed` exists — the loop and the published cut are the same film, and a page showing it twice reads as a mistake. `media[]` still feeds the works-grid card and the node-tree frame, which is where a silent loop earns its keep. If a project ever has an embed *and* stills that are not the same thing, that one line is where to change it.
- **The fallback inside `<section>` is trimmed** to the account, the title and the track. TikTok's generator puts the entire caption there — the credits again in handle form, plus five hashtags — which is invisible while the script works and a wall of duplicated text the moment it does not. The credits on the page are the ones Frank wrote out in full names; they do not need a second, shorter, differently-spelled edition above them.
- **The "Watch on TikTok" link under it is not decoration.** An embed is among the first things strict tracking protection blocks.

We add no border and no tint of our own — the embed brings enough chrome with it already. The player neither drags nor drifts, the one frame on these pages that doesn't: an iframe swallows pointer events, so a drag would only catch its edges, and a player that wanders while you are trying to watch it is worse than a still one.

**Not verifiable from here:** tiktok.com is unreachable from the environment these pages are checked in — robots rules block fetching it, and the test browser cannot load it. Markup, sizing, placement, script injection and the fallback are all verified; **the player rendering has only been reasoned about, not seen.** Open the page on a real machine to confirm it loads and fits.

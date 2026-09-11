# Project context — Frank Le portfolio site

Read this before making changes. It's the compressed version of a longer planning conversation (Cowork, Sept 2026) — the `docs/` folder has the full detail on any point below.

## Who this is for
Lê Vũ Xuân Anh ("Frank Le") — 4th-year Global Business & Digital Arts student at Waterloo, filmmaker (director/writer/editor) and UI/UX designer. Not a high-level code writer — prefers to direct/review, wants changes explained plainly. See `docs/bio.md`.

## What this site is
A single unified portfolio (not split by discipline) covering both his design work and his filmmaking, aimed at landing design job/internship opportunities and film-industry contacts. Recruiters are expected to skim, not read deeply — content and layout should favor skimmability over density.

## Structure (see docs/sitemap.md for full detail)
- `index.html` — Homepage: the node-tree canvas, which is also the site's only menu. Root "Frank Le" (portrait slot + the statement line as its caption) branches to: About → about.html, Film / Design / Photography (each expanding straight to its projects — there is deliberately no "Works" level in between), All works → works.html, and Contact. Structure comes from `data/works.json`; see `js/node-tree.js`.
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

`thumb` is optional and only affects the node tree: a project node shows `thumb` if present, otherwise `media[0]`, beside its title. No media, no frame — the node stays type-only. The root "Frank Le" node has its own portrait slot, set by the `ROOT_MEDIA` constant at the top of `js/node-tree.js` (a path in `/assets`; empty means no frame). Both accept `{ type: "image" | "video", src, alt }`; videos play on hover/focus rather than autoplaying. Adding or editing a project is editing this file; no new HTML per project. Current entries are placeholders clearly marked `PLACEHOLDER` — real content (Frank's actual projects, images/video, headshot) has not been delivered yet as of this repo's creation.

## Known gaps / next steps
- Real work-sample content (3–6 projects) and headshot still need to be added to `data/works.json` / `assets/`.
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
- **`text-shadow` in `--paper`** on the trigger and links. Invisible on an empty corner; on a narrow screen a fixed control has nowhere to open except over the text beneath it, and this keeps the words legible without a scrim or a box.

Two knock-on changes came with it:

- **`works.html` lost the inverted footer slab** and closes on `.end-marks` like every other page. It was the last piece of the pre-canvas design still standing, and it is also a full-width dark field the cue would have vanished into. Its CSS is deleted; git has it.
- **`.end-marks` now holds both marks to the left** instead of at opposite ends. The lower right belongs to the cue, and a branch opening on top of the copyright is worse than an asymmetry nobody will notice.

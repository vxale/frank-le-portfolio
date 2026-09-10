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

## Canvas revision (Sept 8 2026, fourth) — Frank's direction
Three changes to the canvas homepage and the node tree:

- **Branch counts removed.** Nodes were reading "Works 6", "Film 2". Frank cut them — the tree shows what it contains by branching, so the number was restating the diagram.
- **The bio line is back, top right.** The full sentence ("Lê Vũ Xuân Anh (Frank Le) is a young Vietnamese filmmaker and designer…") returns to the canvas as `.mark--line`, right-aligned in the top-right corner opposite the nameplate. Unlike the other corner marks it is set in reading case at `--step-1` rather than as uppercase micro-type, because it is the one full sentence on the page. Note it repeats the name already in the top-left `.mark--name`; that duplication is deliberate on Frank's instruction, not an oversight.
- **Nodes can carry a still or a clip beside the title.** Project nodes take `thumb` from `data/works.json` if present, otherwise `media[0]`; the root node takes the `ROOT_MEDIA` constant at the top of `js/node-tree.js`, intended for Frank's portrait. Frames are sized in `em`, so they scale with the node's depth automatically — the root's is a 3:4 portrait, everything below is 4:3 landscape. Images are decorative (`alt=""`, the node's own text names the thing) and non-draggable, or the browser would drag the picture instead of the node. Videos are muted/looped and play on hover or focus rather than autoplaying: a canvas of running clips is a lot of moving parts for a menu, and on touch the poster frame stands in. A node with no media renders as type only, so the canvas stays clean until real assets land.

Two supporting changes fell out of the media work:
- **Node separation now measures the boxes** instead of treating every node as a point 92px across. A node with a picture in it is a box, not a word, and long project titles were already wide enough to overlap. Separation is axis-aligned and resolves along whichever axis needs the smaller shove.
- **The corner marks push nodes away.** They join the same separation pass as fixed obstacles, so an auto-placed node no longer lands on top of the bio or the email. Nodes the visitor has dragged are exempt — putting one wherever you like is the point of the canvas.

## Canvas revision (Sept 8 2026, fifth) — Frank's direction
Structural pass on the tree and the canvas furniture:

- **The "Works" level is gone.** Film, Design and Photography hang off the root directly. That middle node only ever contained other nodes, so it cost a click and told the visitor nothing. "All works" survives as a root-level leaf so `works.html` — the filterable grid — stays reachable.
- **The bio is a node now, not a corner mark.** It replaces the old "About" node: the full sentence sits on the canvas as a passage node and expands to a single child, "Get to know more", which opens `about.html`. The `.mark--line` block added in the previous pass was removed in the same move — the bio exists once, as a node.
- **Two corner marks removed.** The top-left nameplate went (the root node says the name), and the role line went (it became the root's caption, below).
- **The root has a caption.** "Creative Direction · Filmmaking · Screenwriting · Design", replacing the old "Director · Screenwriter · Editor / UI/UX Designer" corner mark. It sits inside the node element, below the name, so separation and edge-drawing account for it automatically. Kept to two lines (`max-width: min(18rem, 62vw)`); wider and it drags the root's centring off, narrower and it breaks into five cramped lines.

Three things the passage node forced, worth knowing before touching this again:
- A branch node is a `<button>`, and buttons centre their text. Fine for one word, wrong for a paragraph — `.node--passage .node__hit` sets `text-align: left` explicitly.
- The passage needs a measure (`max-width: 30ch`, `white-space: normal`) since every other node is a nowrap label, and `align-items: flex-end` so the +/− settles with the last line instead of floating beside the first.
- **Children aimed off the paper now mirror their angle** instead of being flattened by the position clamp. The bio node is tall and sits high in the fan, so its child was landing hard against the top edge, close enough to its parent that the connector was suppressed — it read as a label floating loose from the tree. `layoutChildren` now tries the vertically mirrored angle first and only clamps if that is off-paper too.

## Canvas revision (Sept 8 2026, sixth) — root placement
The root node's home is now hard left, vertically centred: its left edge sits on the canvas margin (`padX`, the same inset the nodes are clamped to) and its centre on the vertical midline. This replaces the earlier deliberately off-centre placement (`0.28w / 0.34h`, with a separate `0.5w / 0.22h` case under 720px) — one rule at every width now.

Three details behind it:
- Nodes are drawn centred on their coordinates (`translate(-50%, -50%)`), so "left edge on the margin" means offsetting by half the node's own width. That width is **measured**, not assumed, because the caption and the portrait slot both change it — which is why `createElement(root)` now runs before `placeRoot()` at startup.
- The transition is suppressed for that first placement, or the root visibly slides in from the top-left corner on load.
- The root is an anchor in the separation pass: it holds its position and the rest of the tree arranges itself around it. Without that, expanding a branch could shove the root off its home.

Resize still re-places it, and a root the visitor has dragged still stays where they put it — the existing `if (!root.pinned) placeRoot()` rule is unchanged.


## Type scale (rebuilt Sept 8 2026 — this is the whole system)
One modular ladder, ratio **1.2**, nine rungs, anchored on body text at `--step-2` (15px on a phone, 16.5px on a desktop). Every step is 1.2x the one below **at both ends of its clamp**, so the ratio holds at every viewport width rather than only at one.

| token | size | used for |
|---|---|---|
| `--step-0` | 11.1 – 12.2px | tracked uppercase labels, metadata |
| `--step-1` | 13.3 – 14.6px | controls (filters, CV link, back links), small text, leaf node labels |
| `--step-2` | 16.0 – 17.5px | body copy |
| `--step-3` | 19.2 – 21.0px | the root's statement |
| `--step-4` | 23.0 – 25.2px | branch nodes, card titles, pager, the "Frank Le" alias |
| `--step-5` | 27.6 – 30.2px | *spare* |
| `--step-6` | 33.2 – 36.3px | root node name, section titles |
| `--step-7` | 39.8 – 43.6px | *spare* |
| `--step-8` | 47.8 – 52.3px | page titles, footer email |

**The anchor has moved twice.** It shipped at 16–18px, came down to 15–16.5px when the site read too large, and went back to 16–17.5px on Sept 10 2026 when it read too small to sit and read. 16px is the floor for body copy and the reason it went back up — below that, prose is a squint. Because every rung derives from the base, that one edit moved all nine and left the proportions identical — which is the entire point of anchoring a ladder. If the site ever needs to get bigger or smaller as a whole, this is the only value to touch. If a label ever strains, move that element up a rung rather than inflating the rung itself.

**The lesson from the second move.** The complaint that triggered it was "the hero line is visibly small" — but the base was only part of it. The root's statement was set on `--step-0`, the *label* rung, three steps below body copy: the most important sentence on the site was the size of a metadata tag. Re-anchoring the whole ladder would have papered over that. When something reads too small, check which rung it is standing on before moving the ladder underneath it.

**Why it was rebuilt.** The previous version had five tokens *and* thirty-three hand-picked `font-size` values, nine of them clustered between 0.7rem and 0.95rem — differences of half a pixel that nobody could see and no rule explained. The scale existed on paper while the CSS ignored it. All thirty-two of those (one `em` value stayed, correctly) now resolve to a rung.

**The range didn't change; the rungs got denser.** Every old token maps to the new one at double its index — old `--step-0` is now `--step-2`, old `--step-3` is now `--step-8` — so sizes barely moved. What's new is the odd-numbered rungs in between, which is what a tighter ratio buys you. The old `--step-4` (the last survivor of the monumental era, 64px) was referenced by nothing and is gone.

**Rules for adding type.** Use a rung. If none fits, the answer is almost always that the wrong rung was chosen for a neighbouring element, not that the ladder needs a new value — three spares exist precisely so there is somewhere to go. A raw `rem` font-size anywhere in `css/style.css` is a bug.

## Canvas revision (Sept 8 2026, seventh) — untangling the expanded tree
The type scale rebuilt in "one 1.2 ladder" left the tree crowded: with nodes on step-6/4/2, an expanded branch put 330px-wide project titles about 56px apart vertically — exactly the minimum the separation pass allowed — so they stacked like lines of a paragraph and neighbouring branches interleaved, crossing their own connectors. Four geometry changes, no type changes:

- **Longer branches.** Reach went from `0.3/0.26` of the smaller viewport dimension to `0.34/0.32`, floor 120 → 150. Distance between levels is what makes a diagram legible; these labels are words, not dots.
- **A wider fan at the root, tighter cones below.** Spread went from `0.34(n-1)+0.55` to `0.4(n-1)+0.6`, but everything below the root now takes 55% of that. Two neighbouring branches each opening a wide cone throw their children into the same band of the page — narrowing the cone is what stops Film's projects and Design's projects interleaving.
- **Lopsided separation padding**, 12/10 → 18/26. These boxes are wide and short, so they end up stacked vertically, and it is the vertical gap that reads as air between nodes.
- **`clampPosition` clamps the box, not the centre.** Nodes are drawn centred on their coordinates, so clamping the centre to the margins let a 230px-wide project title hang half off the right edge on a phone — visible as soon as the longer reach pushed nodes outward. A node too wide to fit between the margins is now centred rather than pushed off one side.

Result at 1440x900 with every branch open: 13 nodes, no overlaps, nothing off-canvas. At 375x812 nothing runs off the edge; two nodes sit close enough to touch, which is what the drag is for.

## Canvas revision (Sept 8 2026, eighth) — the bio node and its child
- **The tree loads closed.** No level opens itself; the root sits alone with its "+" and the corner hint carries the instruction.
- **"Get to know more" sits beside the bio, not under it.** A node's children normally fan out along the direction the parent itself came from, which sent the bio's single child diagonally down under the paragraph. A passage node now fans horizontally (base angle 0), so its child lands level with the text. Gated to viewports ≥720px: on a phone the paragraph and its child side by side are wider than the paper, so below that the child goes back to following the fan.
- **The bio's measure is wider** — 30ch → 42ch (28ch on mobile), four lines instead of six.
- **Branch length now clears both boxes.** Reach is measured centre to centre, so a wide parent used to start its branch inside itself: at 493px the bio left roughly 6px between its own edge and its child. `layoutChildren` now takes the larger of the nominal reach and (parent extent + child extent + 56px) along the branch angle. This helps every wide node, not just the bio.

Note that the child is level *as placed*; with several branches open the separation pass may nudge it by about a line to keep clear of a neighbouring project title. That is the pass doing its job — pinning the child's y would trade a tidy line-up for an overlap.

## Canvas revision (Sept 9 2026, ninth) — the statement becomes the caption
Frank's direction: the bio node goes, About comes back, and the root's caption carries a new statement line instead of the discipline list.

- **`ROOT_CAPTION` is now the statement**: "Vietnamese indie filmmaker and designer visualizing stories of cultures, brands, and most importantly, humans." It replaces "Creative Direction · Filmmaking · Screenwriting · Design".
- **The bio passage node and its "Get to know more" child are gone**, replaced by a plain `About` leaf pointing at about.html — which is where the tree started, three revisions ago. All the passage machinery went with it: the `passage` flag on nodes, the horizontal fan special case in `layoutChildren`, and the `.node--passage` CSS. The clearance rule that pass introduced stays, and still earns its keep: the root carrying this caption is now the widest box on the canvas.
- **Caption styling: same rung, different voice.** Frank asked for no change to the type scale, so the caption is still `--step-0`. But it now carries a sentence rather than a list of labels, so the uppercase and the 0.14em label tracking came off — the house's small tracked caps are a label treatment, and this line has commas and a subordinate clause in it. Measure widened to `min(30rem, 60vw)`: two lines on desktop, three on a phone. 60vw rather than 70 because on a phone the root's box *is* the caption's width, and at 70vw it reached far enough across the canvas to collide with the branch beside it.

If the statement ever wants more presence than `--step-0` gives it, `--step-3` is one of the spare rungs — but that is a type-scale change and Frank ruled it out for this pass.


## Canvas pages (Sept 9 2026) — about, contact, work detail
Frank's read: against the node tree these three pages looked like a different website. They were conventional documents — a column of text, ruled sections, boxed media, an inverted footer slab. Rebuilt as scrolling canvases on the homepage's terms.

**The rules now, site-wide:**
- **No rule separates two things.** Space does it. There is no `<hr>`, no section border, no ruled `<dl>` anywhere in these layouts.
- **No box is drawn around anything.** The works grid lost its media borders at the same time — this is an art-direction rule, not a per-page one.
- **Nothing sits in a column.** An invisible 12-column grid places blocks so they step down and inward. The grid is a placement tool; if a border ever seems necessary to make the layout legible, the placement is wrong, not the border.
- **Media is a free object** — draggable anywhere via `js/drag.js`, drifting gently on its own.

**Work pages lead with the work.** The original template ran metadata → credits → awards → beats → media. That is reversed: title, a few marks, then the media at size, and the writing follows smaller and placed loosely. A recruiter should meet the film before the paragraph about the film.

**Dragging is a transform offset, not absolute positioning.** An element keeps its place in the document and the transform moves it visually, so nothing reflows and the page stays responsive. `js/drag.js` carries the two hard-won rules from the node tree: window-level pointer listeners with **no `setPointerCapture`** (capturing retargets the press and silently breaks every click), and a 4px threshold where a real drag suppresses the click that would follow.

**One placeholder caveat.** With no assets delivered, media shows as a light tint holding the aspect ratio. That tint is the one rectangle left on these pages, and it disappears the moment a real `src` exists in `data/works.json` — it is not a frame.

## Ambient drift (the floating motion)
Nodes and free media breathe rather than sitting dead still. Built against the `animate` skill's sequence, and the constraints are the design:

- **Amplitude is 2–4px, period 9–15s.** These are click targets. Anything larger starts moving the thing the visitor is reaching for, which is the one rule that outranks the effect.
- **It pauses on hover, on focus, and while anything is being dragged.** By the time you commit to a target it is holding still.
- **CSS animation, not JS** — predetermined, infinite, and off the main thread, so it stays smooth while images are still loading.
- **The easing is the built-in `ease-in-out`, deliberately not this file's `--ease-in-out`.** The strong curve is right for a one-shot move; on an infinite loop it reads as a lurch at each turn.
- **Off entirely under `prefers-reduced-motion`.** This is pure decoration, so reducing it means removing it.

Each drifting thing gets its own transform layer (`.node__drift`, `.drift`) so no two transforms ever land on one element: position on the outside, drift in the middle, press scale on the inside. Breaking that nesting is how you get a node that jumps when you press it.

Known consequence worth remembering: a permanently drifting element is never "stable", so automated tests must force hover/click on nodes rather than waiting for them to settle.

## The case study, as a chain (Sept 10 2026)
The five beats on a work page were labelled blocks — **What it is**, **The problem** and so on in tracked caps between the paragraphs. Frank's read: the headings chopped the reading. They are gone from the page, and the passages now run as a numbered chain.

- **The number is the whole handle.** `01`–`05` mark position in the sequence *and* fold their passage away. Without a heading there is nothing else short enough to be a node — a 130-character paragraph makes a sprawling hit target, and a bare "+" is a heading that says nothing.
- **Everything is open on arrival; clicking folds.** Reveal-by-default, hide-on-demand. Frank's call, and the right one for the audience: recruiters skim, and gating four of five passages behind clicks means a visitor with twenty seconds reads one paragraph and leaves. The interaction is for pruning, not unlocking.
- **A folded passage keeps its number**, so the sequence never renumbers itself under the reader.
- **The headings survive as accessible names.** Each button reads "Hide: The problem" to a screen reader, and `data/works.json` still asks the five questions — so the writing scaffold Frank designed is intact even though the labels are off the page.
- **No connecting lines.** Edges between short node labels read as a diagram; edges between paragraphs read as a flowchart of prose. Order is carried by the numbers and by each passage stepping further in than the last.
- Passage text moved from `--step-1` to `--step-2`. This is the body copy of the page and it was set at control size.

Why this is not the node-tree engine: a chain needs none of what makes `js/node-tree.js` 761 lines — no radial layout, no collision relaxation, no edge trimming. It is placement plus a collapse, so it lives in `js/work-detail.js` and cost no risk to the homepage.

The collapse animates `grid-template-rows` from `1fr` to `0fr`. That touches layout, which `transform` and `opacity` avoid — accordions are the one case with no transform equivalent, so it is the sanctioned exception. Opening takes 240ms, folding 180ms.

## Color (decided)
Strictly black and white — no accent color, reaffirmed during the Sept 2026 revisions above. Paper is pure `#FFFFFF` as of Sept 8 2026 (Frank's direct instruction — this replaced the earlier off-white "open book paper" value; see the third revision pass above). Ink remains a near-black `#16140f` rather than `#000000`. Hairlines/borders now use that same ink tone directly (`--line: var(--ink)`) rather than a softer gray, for more graphic contrast.
Assumed (Claude default, unconfirmed): no functional meaning for color — interactive states are shown via weight/underline/motion instead, since there's no accent color to spare.

## Typography (decided — single family as of Sept 8 2026)
This section describes the system as it stands. The dated revision notes above are the history of how it got here — where they disagree with this, this wins.

- **One typeface, every job.** `--font: "Times New Roman", Times, Georgia, serif`. The split serif/grotesk system is gone and the `--serif`/`--sans` tokens no longer exist — small tracked caps in the same face carry everything the grotesk used to do (labels, captions, metadata, the corner marks). Still a system font on purpose; don't swap in a webfont, and don't reintroduce a second family, without asking.
- **One modular ladder, ratio 1.2, nine rungs** (`--step-0` … `--step-8`), anchored on body at `--step-2`. There are no hand-picked font sizes left in the stylesheet — the only non-token size is the node tree's `+`/`−` glyph at `0.75em`, which is relative to its own node on purpose. Steps 3, 5 and 7 are deliberately spare. The full table and the reasoning are under "Type scale" above.
- **No monumental tier.** The 135–188px display sizes from the second and third revision passes were reversed on Frank's instruction; the ladder now tops out at `--step-8`, in a normal editorial range. (Deliberately not quoting the pixel values here — the ladder has been re-anchored more than once and the table above is the one place they should live.) Boldness lives in the canvas being the first thing you meet, not in type size.
- Personality: refined editorial typography (not a loud poster/condensed/grid-breaking face).

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

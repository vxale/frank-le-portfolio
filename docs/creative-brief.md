# Creative Brief — Portfolio Website Look & Feel
Lê Vũ Xuân Anh (Frank Le)

This brief sets the design norms and requirements we'll build against. Section 1 is a recap of what's already decided (no action needed — just confirm nothing's changed). Sections 2 onward are for you to fill in; use as few or as many words as you like, bullet fragments are fine, and "not sure yet" is a valid answer — we'll talk it through either way.

---

## 1. Project Snapshot (already decided — reference only)

- **Goal:** Land design job/internship opportunities and film-industry contacts, while showcasing personality and ideas.
- **Audience:** Recruiters/hiring teams (design) and industry contacts/collaborators (film) — expect skimming, not deep reading.
- **Structure:** One unified portfolio (design + film together). Homepage (hero + featured-work carousel) → About, Works (filterable grid: type / year / commercial), Contact. Every page links back to Homepage.
- **Stated aesthetic direction so far:** Unconventional, minimal, humanistic, straight to the point. White canvas, typography-dominant over heavy visuals/color. Brutalism as the core theme. Animation and media still present, just not the dominant visual language.

---

## 2. Aesthetic Keywords

- Do the four words above (unconventional / minimal / humanistic / straight to the point) still feel exactly right, or is there a word you'd swap or add?
- These words are still my direction.

- If you had to pick 3 existing brutalist or typography-led websites (or even print pieces, album covers, posters — anything visual) that feel close to what you want, what are they? If none come to mind, say so — I can propose references instead.
- Claude's proposed references (current as of this search — worth spot-checking, as brutalist sites redesign often):
  - **Mike Lamont** (mikelamont.co) — white background, black type, work laid out like a plain index/PDF so everything's visible with minimal clicking. Closest match to "straight to the point" and skimmable.
  - **Balenciaga.com** — monospace type, hard edges, restrained palette; proof brutalism can read as premium/considered rather than raw or DIY, which fits "humanistic" over aggressive.
  - **Are.na** — function-over-decoration, lets structure/typography *be* the visual language instead of illustration or color. Good reference for a minimal, content-first system.
  - **Bloomberg Businessweek** (editorial site) — oversized typography and bold hierarchy jumps; useful less for its color use and more as a reference for how confident, large-scale type can carry a page on its own.

---

## 3. Color

- Is the site strictly black/white/grayscale, or is there room for one accent color? If an accent, do you have one in mind (even a rough description like "a warm red" is enough)?
- Strictly black and white — but not stark/clinical: more like the paper of an open book, white to fairly off-white with black ink, rather than pure digital #FFFFFF/#000000.

- Does color ever carry meaning on the site (e.g. an accent used only for links/interactive elements, or to tag "film" vs "design" work), or is it purely decorative if used at all?
- (Claude's default, unconfirmed — flag if wrong) No functional meaning assumed: interactive/state changes will be shown through weight, underline, or motion rather than color, since there's no accent color to spare. Full-color photography/video remains the only color on the site.

---

## 4. Typography

- Type is the star here, per your direction — do you already have typefaces in mind (from Figma/Adobe work you like), or should I propose a system built around a strong display face + a quiet body face?
- Torn between two directions: a sans serif like Helvetica (fits the brutalist side), or a serif like Times New Roman (fits the humanist side). Open to Claude's read on reconciling this.
- **Claude's recommendation:** don't force a single choice — split the two roles you already have (director/writer vs. designer) across two typefaces instead of one. A Times-style serif, used oversized and unstyled/blunt (that "default browser font, unapologetically huge" look is itself a known move in current digital brutalism/editorial fashion sites), carries headlines, the bio, and anything narrative — this is your literary, humanist voice. A neutral grotesk in the Helvetica family stays small and strictly functional — nav labels, filters, captions, metadata — the "structure" layer. The contrast between the two becomes a feature, not a compromise: it visually states that you work in both registers. Reaction welcome — happy to go single-typeface instead if the split reads as fussy to you.

- Personality: should the type feel more like a bold headline/poster face (e.g. very brutalist, condensed/mono, grid-breaking), or more refined editorial typography that's just used at a large scale? These can look quite different even within "brutalism."
- Refined editorial typography, used at a large scale.

- Scale: should type sizes be dramatic (huge headlines, big jumps between sizes) or more restrained/consistent?
- Restrained and consistent.

---

## 5. Layout & Grid

- Brutalism can mean a rigid, exposed grid (visible structure, sharp edges) or a deliberately "broken"/asymmetric grid (misaligned elements, overlap, raw HTML-ish feel). Which direction, or somewhere between?
- A deliberately "broken"/asymmetric grid.

- Whitespace: generous and airy, or dense and packed (more "raw," less breathing room)?
- Generous white space.

---

## 6. Imagery & Media

- Photography/video treatment: full color, black & white, or duotone/high-contrast?
- Full color.

- Should images/video be full-bleed (edge to edge) or contained within a grid/frame (more consistent with a structured brutalist grid)?
- Full bleed.

- Headshot for About page — do you have one already, or does this need to be planned/shot? Any mood reference (serious, candid, on-set, etc.)?
- Already have it ready.

---

## 7. Motion & Interaction

- You mentioned animation stays, just not dominant. What should it actually do — subtle scroll reveals, hover/cursor effects, page-transition animations, or something more unexpected/experimental (fits "unconventional")?
- Mainly scroll behaviors and hover effects. Also planning to bring in an external carousel component for the homepage — open to seeing what that unlocks for animation/interaction once it's in place.

- Should motion feel snappy/abrupt (often reads as more "brutalist"/raw) or smooth/fluid (reads more polished/editorial)? These send different signals even with the same content.
- Smooth.

---

## 8. Navigation & the Node-Tree Idea

- Can you describe (or rough-sketch, even in words) how you picture the node-tree menu working? For example: is it a literal branching diagram the visitor clicks through, a persistent side element, or something that only appears on the Homepage as a visual/interactive centerpiece?
- A literal branching diagram the visitor clicks through.

- If node-tree nav turns out to be too complex for a first version, are you open to a simpler placeholder nav now with node-tree as a planned upgrade, or is it important enough to solve up front?
- Open to a simpler placeholder nav now, with node-tree as a planned upgrade.

---

## 9. Content Density (ties to "recruiters skim")

- On the Works detail template — beyond images/video, what's the minimum text you're comfortable with per project (e.g. title + role + one-line description + tools, and nothing more)?
- Credits are important, plus the basic info (title/role/tools etc.) as suggested, and space for awards/accolades once there are any to list (none yet). Beyond that, a short insight passage per project, structured as: what is the work? → what is it trying to solve? → who is it meant for? → how did I do it? → what was the result?

- Any text you know you want on every project page no matter what (credits, year, your role, client name if commercial)?
- (Claude's default, unconfirmed — flag if wrong) Assuming the section 9 answer above already covers this in full (title/role/tools, credits, awards slot, five-beat insight passage) — nothing additional required by default.

---

## 10. Assets & Status Check

- What do you currently have ready vs. not: headshot, project images, project videos, a CV file, a personal logo/wordmark/monogram?
- Headshot and project assets (images/video) are ready.

---

## 11. What "Done" Looks Like

- When you look at the finished homepage for the first time, what's the one reaction you want ("that's different," "that's clean," "that feels like a filmmaker made this," etc.)?
- "That feels like a filmmaker made this."

---

*Fill in as much or as little as you're ready for — send it back whole or in pieces, whichever's easier, and we'll keep talking through whatever's still open.*

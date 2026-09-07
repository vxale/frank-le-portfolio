# Frank Le — Portfolio

Personal portfolio site for Lê Vũ Xuân Anh (Frank Le) — filmmaker and designer. Plain HTML/CSS/JS, no build step or framework.

## Running locally
Browsers block `fetch()` on `file://` pages, and this site loads its content from `data/works.json`, so open it through a local server rather than double-clicking `index.html`:

```
python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.

## Structure
- `index.html`, `about.html`, `works.html`, `work.html`, `contact.html` — pages
- `css/style.css` — the whole design system (palette, type, grid, motion)
- `js/` — page behavior (fetches and renders `data/works.json`)
- `data/works.json` — all project content; edit this to add/update work samples
- `assets/` — images, video, headshot, CV (currently empty — placeholders in use)
- `docs/` — the full design brief, sitemap, bio, and contact content that shaped this build

See `CLAUDE.md` for a condensed project brief if you're picking this up with Claude Code.

/* Shared helpers used across pages. Vanilla JS, no build step —
   keeps this easy to edit or hand off later. */

async function fetchWorks() {
  const res = await fetch('data/works.json');
  if (!res.ok) throw new Error('Could not load works.json');
  return res.json();
}

/** Renders the contents of a .media-frame: a real <img>/<video> if a
    src is present, otherwise a labeled placeholder box so the layout
    stays visible before real assets are wired in. */
function mediaFrameInner(mediaItem, altFallback) {
  if (!mediaItem || !mediaItem.src) {
    return `<div class="media-placeholder">Image placeholder<br>— add path in data/works.json —</div>`;
  }
  const alt = mediaItem.alt || altFallback || '';
  if (mediaItem.type === 'video') {
    return `<video src="${mediaItem.src}" muted loop playsinline autoplay></video>`;
  }
  return `<img src="${mediaItem.src}" alt="${alt}">`;
}

function typeLabel(type) {
  const map = { film: 'Film', design: 'Design' };
  return map[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : '');
}

function workMetaLine(work) {
  const parts = [typeLabel(work.type), String(work.year), work.commercial ? 'Commercial' : 'Personal'];
  return parts.filter(Boolean).join(' · ');
}

/** Marks the current page's nav link with aria-current="page" based
    on data-nav-current set on <body>. */
document.addEventListener('DOMContentLoaded', () => {
  const current = document.body.dataset.navCurrent;
  if (!current) return;
  document.querySelectorAll('.site-nav__links a').forEach((a) => {
    if (a.dataset.nav === current) a.setAttribute('aria-current', 'page');
  });
});

/* Shared helpers used across pages. Vanilla JS, no build step —
   keeps this easy to edit or hand off later. */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Everything rendered below comes from data/works.json and is
    injected as HTML, so anything from the file gets escaped first. */
function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

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
  const src = esc(mediaItem.src);
  const alt = esc(mediaItem.alt || altFallback || '');
  if (mediaItem.type === 'video') {
    return `<video src="${src}" muted loop playsinline autoplay aria-label="${alt}"></video>`;
  }
  return `<img src="${src}" alt="${alt}" loading="lazy">`;
}

function typeLabel(type) {
  const map = { film: 'Film', design: 'Design', photography: 'Photography' };
  return map[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : '');
}

function workMetaLine(work) {
  const parts = [typeLabel(work.type), String(work.year), work.commercial ? 'Commercial' : 'Personal'];
  return parts.filter(Boolean).join(' · ');
}

/** Sequence numbers ("01", "02"…) — the site treats the body of work
    like a shot list, which is where a lot of its character comes from. */
function workNumber(index) {
  return String(index + 1).padStart(2, '0');
}

function workHref(work) {
  return `work.html?id=${encodeURIComponent(work.id)}`;
}

/** Shared card used by the homepage carousel and the works grid. */
function cardMarkup(work, index, className) {
  return `
    <a class="${className}" href="${workHref(work)}">
      <div class="media-frame">${mediaFrameInner(work.media && work.media[0], work.title)}</div>
      <div class="caption">
        <span class="caption__index">${workNumber(index)}</span>
        <span class="caption__title">${esc(work.title)}</span>
        <span class="caption__meta">${esc(workMetaLine(work))}</span>
      </div>
    </a>
  `;
}

/** Text-only row used by the homepage index list — every project
    visible without a click, per the "straight to the point" brief. */
function indexRowMarkup(work, index) {
  return `
    <li>
      <a href="${workHref(work)}">
        <span class="index-list__num">${workNumber(index)}</span>
        <span class="index-list__title">${esc(work.title)}</span>
        <span class="index-list__meta">${esc(workMetaLine(work))}</span>
      </a>
    </li>
  `;
}

/** Scroll reveals. The .reveal class is added here rather than in the
    HTML, so with JS off (or reduced motion on) nothing is ever hidden. */
function initReveals(root) {
  const els = (root || document).querySelectorAll('[data-reveal]:not(.reveal)');
  if (!els.length) return;

  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('reveal', 'is-in'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .forEach((entry, i) => {
        // Small stagger so a group of siblings arrives in sequence
        // rather than all at once.
        entry.target.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 0.09}s`);
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  els.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/** Marks the current page's nav link with aria-current="page" based
    on data-nav-current set on <body>. */
document.addEventListener('DOMContentLoaded', () => {
  const current = document.body.dataset.navCurrent;
  if (current) {
    document.querySelectorAll('.site-nav__links a').forEach((a) => {
      if (a.dataset.nav === current) a.setAttribute('aria-current', 'page');
    });
  }
  initReveals();
});

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
    const poster = mediaItem.poster ? ` poster="${esc(mediaItem.poster)}"` : '';
    return `<video src="${src}"${poster} muted loop playsinline autoplay aria-label="${alt}"></video>`;
  }
  return `<img src="${src}" alt="${alt}" loading="lazy">`;
}

function typeLabel(type) {
  // The key in data/works.json is still "film" — short to type, and
  // ?type=film links keep working. Only the word on the page changed
  // (Frank, Sept 12 2026).
  const map = { film: 'Moving Image', design: 'Design', photography: 'Photography' };
  return map[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : '');
}

/** Who a piece was made for: `madeFor` in data/works.json is one of
    commercial / personal / academic (Frank, Sept 17 2026 — Academic
    arrived with the GBDA 101 posters). The older `commercial: true /
    false` shape still reads correctly, so an entry can carry either. */
function madeForKey(work) {
  if (work.madeFor) return String(work.madeFor).toLowerCase();
  return work.commercial ? 'commercial' : 'personal';
}

const MADE_FOR = [
  ['commercial', 'Commercial'],
  ['personal', 'Personal'],
  ['academic', 'Academic'],
];

function madeForLabel(work) {
  const key = madeForKey(work);
  const found = MADE_FOR.find(([k]) => k === key);
  return found ? found[1] : key.charAt(0).toUpperCase() + key.slice(1);
}

function workMetaLine(work) {
  const parts = [typeLabel(work.type), String(work.year), madeForLabel(work)];
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

/** The works-grid card.

    Four nested elements, because four separate things want a transform
    and no two of them may share one - the last one written wins and
    the others silently stop:

      .work-card          drag offset        js/drag.js
      .work-card__body    scroll reveal      js/site.js
      .media-frame__move  scroll parallax    CSS view() timeline
      img / video         hover scale        CSS

    The media and the caption both open the project. The media also
    drags and resizes, so both of those have to be able to swallow the
    click they would otherwise end on: js/drag.js suppresses the click
    after a real drag, and makeResizable does the same after a resize.
    A press is a move, a re-crop, or an opening - never two of them.

    The media link is tabindex="-1" on purpose. It goes to the same
    place as the caption a line below it, and seven cards' worth of
    pressing Tab twice for one destination is a keyboard tax with
    nothing on the other side of it. */
function cardMarkup(work, index, className) {
  const item = (work.media && work.media[0]) || work.thumb;
  /* Native ratio, Frank's rule: a frame whose media declares its
     pixels takes the file's own shape; the composed crops in the CSS
     apply only to entries that don't (the placeholders). The ratio
     rides on --ratio rather than an inline aspect-ratio because Tidy
     up clears style.aspectRatio when it sends a card home. */
  const native = item && item.width && item.height;
  const frameClass = native
    ? `media-frame media-frame--native${item.height >= item.width ? ' media-frame--upright' : ''}`
    : 'media-frame';
  const frameStyle = native ? ` style="--ratio: ${Number(item.width)} / ${Number(item.height)}"` : '';
  return `
    <article class="${className}" data-stop>
      <div class="work-card__body" data-reveal>
        <a class="${frameClass}"${frameStyle} href="${workHref(work)}" tabindex="-1">
          <div class="media-frame__move">${mediaFrameInner(item, work.title)}</div>
          <span class="media-frame__grip" data-resize-grip aria-hidden="true"></span>
        </a>
        <a class="caption" href="${workHref(work)}">
          <span class="caption__index">${workNumber(index)}</span>
          <span class="caption__title">${esc(work.title)}</span>
          <span class="caption__meta">${esc(workMetaLine(work))}</span>
        </a>
      </div>
    </article>
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
        entry.target.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 0.06}s`);
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  els.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}


/** Spread ambient drift across a set of elements so they don't all
    breathe in unison. Negative delays start each one mid-cycle, so
    nothing waits for the loop to come round before it moves. Called
    by js/drag.js on load and by js/node-tree.js whenever the tree
    grows new nodes. */
function driftAll(elements) {
  if (REDUCED_MOTION) return;
  const variants = ['drift-a', 'drift-b', 'drift-c'];
  Array.from(elements).forEach((el, i) => {
    if (el.dataset.drifting === 'on') return;
    el.dataset.drifting = 'on';
    const dur = 9 + ((i * 2.7) % 6);            // 9s - 15s, deterministic
    el.style.animationName = variants[i % variants.length];
    el.style.animationDuration = `${dur.toFixed(2)}s`;
    el.style.animationDelay = `-${((i * 3.3) % dur).toFixed(2)}s`;
  });
}
window.driftAll = driftAll;

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

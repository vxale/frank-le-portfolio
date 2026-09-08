document.addEventListener('DOMContentLoaded', async () => {
  const track = document.querySelector('.carousel__track');
  const list = document.querySelector('.index-list');
  if (!track && !list) return;

  let works = [];
  try {
    works = await fetchWorks();
  } catch (err) {
    const message = `<p class="works-empty">Couldn't load work (${esc(err.message)}).</p>`;
    if (track) track.innerHTML = message;
    if (list) list.innerHTML = message;
    return;
  }

  // Featured carousel
  if (track) {
    const featured = works.filter((w) => w.featured);
    if (!featured.length) {
      track.innerHTML = '<p class="works-empty">No featured work yet — flag a project with "featured": true in data/works.json.</p>';
    } else {
      track.innerHTML = featured.map((w, i) => cardMarkup(w, i, 'carousel__item')).join('');
      initCarouselControls(track);
    }
  }

  // Full index
  if (list) {
    list.innerHTML = works.map((w, i) => indexRowMarkup(w, i)).join('');
  }

  initReveals();
});

/** Prev/next for the native scroll-snap track. Shown only when the
    track actually overflows; an external carousel component can
    replace this wholesale without touching the markup. */
function initCarouselControls(track) {
  const controls = document.querySelector('.carousel__controls');
  if (!controls) return;

  const prev = controls.querySelector('[data-carousel="prev"]');
  const next = controls.querySelector('[data-carousel="next"]');

  function step(direction) {
    const item = track.querySelector('.carousel__item');
    const distance = item ? item.getBoundingClientRect().width + 32 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * distance, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  }

  function syncState() {
    const overflowing = track.scrollWidth - track.clientWidth > 4;
    controls.hidden = !overflowing;
    if (!overflowing) return;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  }

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll', syncState, { passive: true });
  window.addEventListener('resize', syncState);
  syncState();
}

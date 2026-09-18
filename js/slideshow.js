/* ============================================================
   Slideshow — the project page's media, full screen, one at a time.

   Frank's brief (Sept 18 2026): click any frame on a project page to
   enter a full-screen slideshow, and a button that switches between
   the default page and the slideshow by hand.

   Two modes, one switch. The lower-left corner of a project page
   carries the word SLIDESHOW, in the family of the corner cues; inside
   the show the same corner reads DEFAULT. It is the same control
   changing its word, which is what "switch between modes" means. A
   click on a frame is the shortcut in; Escape, the corner word, or a
   press on the bare paper is the way out.

   Full screen means the browser's own: the show asks for the
   Fullscreen API on the way in (a click is the gesture it needs) and
   gives it back on the way out. Where the API is missing — iPhone
   Safari, for anything but a <video> — the show is a fixed layer that
   covers the viewport, which is the same picture without the chrome
   leaving. When the browser drops out of fullscreen on its own (Esc
   in Chrome, the banner in Safari) the show closes with it, so one
   press means one thing.

   The bottom row is the site's bottom row: the mode word lower left,
   `← 02 / 05 →` at the centre in the stepper's arrows turned on their
   side, and the sound switch lower right when the slide is a clip.
   The media sits above that row at its native ratio, as large as the
   space allows, never cropped — the same rule as everywhere else.

   Moving between slides: arrows, ← →, a click on the picture (next),
   or a swipe that tracks the finger 1:1 and lets go on velocity, the
   way the canvas does. Slides crossfade with a short push in the
   direction of travel; under reduced motion they cut.

   Clips in the show play from the start, muted, with the same SOUND
   OFF / SOUND ON switch as the page. The page's own clips are paused
   while the show is up — two copies of a loop decoding under a layer
   nobody can see is waste — and resume when it closes.
   ============================================================ */

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ARROW = '<svg viewBox="0 0 12 15" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="square" focusable="false"><path d="M6 1.5V13"/><path d="M2 9.5 6 13.5 10 9.5"/></svg>';
  const SLIDE_MS = 170;   // between slides: the site's exit figure
  const OPEN_MS = 220;    // the layer arriving
  const SWIPE_COMMIT = 0.22;   // of the stage width
  const SWIPE_FLICK = 450;     // px/s

  let items = [];
  let index = 0;
  let open = false;
  let show = null;
  let returnTo = null;
  let pausedClips = [];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const pad = (n) => String(n).padStart(2, '0');

  function build() {
    if (show) return show;
    show = document.createElement('div');
    show.className = 'show';
    show.setAttribute('role', 'dialog');
    show.setAttribute('aria-modal', 'true');
    show.setAttribute('aria-label', 'Slideshow');
    show.tabIndex = -1;
    show.hidden = true;
    show.innerHTML = `
      <div class="show__stage" data-show-stage></div>
      <button class="show__mode label" type="button" data-show-close>Default</button>
      <div class="show__step" role="group" aria-label="Slides">
        <button class="show__arrow show__arrow--prev" type="button" data-show-dir="-1" aria-label="Previous slide"><span class="show__glyph" aria-hidden="true">${ARROW}</span></button>
        <span class="show__count label" aria-live="polite"><span data-show-index>01</span> / <span data-show-total>01</span></span>
        <button class="show__arrow show__arrow--next" type="button" data-show-dir="1" aria-label="Next slide"><span class="show__glyph" aria-hidden="true">${ARROW}</span></button>
      </div>
      <button class="show__sound shot__sound" type="button" data-show-sound aria-pressed="false" aria-label="Turn sound on" hidden>Sound off</button>`;
    document.body.appendChild(show);

    // Wrapped, not `close` itself: a listener is handed the event, and
    // the first version of close() read its one argument as "the
    // browser already left fullscreen, don't ask it to". Wired bare,
    // Default closed the layer and left the window in fullscreen for
    // the visitor to Esc out of (Frank, Sept 18 2026). close() takes
    // no argument now, and this stays wrapped so it never can again.
    show.querySelector('[data-show-close]').addEventListener('click', () => close());
    show.querySelectorAll('[data-show-dir]').forEach((btn) => {
      btn.addEventListener('click', () => step(Number(btn.dataset.showDir)));
    });
    show.querySelector('[data-show-sound]').addEventListener('click', toggleSound);

    // The bare paper closes; the picture advances. A swipe that moved
    // is neither — the stage's own handler swallows that click.
    show.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      if (event.defaultPrevented) return;
      if (event.target.closest('.show__media')) step(1);
      else if (event.target === show || event.target.closest('[data-show-stage]') === event.target) close();
    });

    // The browser leaving fullscreen — by our request, or by its own
    // Esc or banner — is the moment the layer goes.
    document.addEventListener('fullscreenchange', () => {
      if (open && !document.fullscreenElement) finishClose();
    });

    setupSwipe(show.querySelector('[data-show-stage]'));
    return show;
  }

  /* ---- Slides ---------------------------------------------------- */

  function slideMarkup(item, i) {
    const ratio = item.width && item.height ? `--ratio: ${Number(item.width)} / ${Number(item.height)}` : '--ratio: 16 / 9';
    const alt = esc(item.alt || `Slide ${i + 1}`);
    const inner = item.type === 'video'
      ? `<video src="${esc(item.src)}"${item.poster ? ` poster="${esc(item.poster)}"` : ''} muted loop playsinline autoplay aria-label="${alt}"></video>`
      : `<img src="${esc(item.src)}" alt="${alt}">`;
    return `<figure class="show__media" style="${ratio}" data-slide="${i}">${inner}</figure>`;
  }

  function render(dir) {
    const stage = show.querySelector('[data-show-stage]');
    const item = items[index];
    const leaving = stage.querySelector('.show__media');
    const still = reduce.matches;

    const next = document.createElement('div');
    next.innerHTML = slideMarkup(item, index);
    const slide = next.firstElementChild;
    if (!still && dir) slide.classList.add(dir > 0 ? 'is-from-right' : 'is-from-left');
    stage.appendChild(slide);
    void slide.offsetWidth;                      // flush the start state
    slide.classList.remove('is-from-right', 'is-from-left');

    if (leaving) {
      const v = leaving.querySelector('video');
      if (v) v.pause();
      if (still) leaving.remove();
      else {
        leaving.classList.add(dir > 0 ? 'is-to-left' : 'is-to-right', 'is-leaving');
        window.setTimeout(() => leaving.remove(), SLIDE_MS + 40);
      }
    }

    show.querySelector('[data-show-index]').textContent = pad(index + 1);
    show.querySelector('[data-show-total]').textContent = pad(items.length);
    const soundBtn = show.querySelector('[data-show-sound]');
    soundBtn.hidden = item.type !== 'video';
    setSound(false);

    // Neighbours warm in the cache, so the next press is not a wait.
    [index + 1, index - 1].forEach((n) => {
      const it = items[(n + items.length) % items.length];
      if (it && it.type !== 'video') { const im = new Image(); im.src = it.src; }
    });
  }

  function step(dir) {
    if (!open || items.length < 2 || !dir) return;
    index = (index + dir + items.length) % items.length;
    render(dir);
  }

  /* ---- Sound ----------------------------------------------------- */

  function setSound(on) {
    const btn = show.querySelector('[data-show-sound]');
    const video = show.querySelector('.show__media:not(.is-leaving) video');
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    btn.textContent = on ? 'Sound on' : 'Sound off';
    if (!video) return;
    video.muted = !on;
    if (on) { const p = video.play(); if (p) p.catch(() => {}); }
  }

  function toggleSound() {
    const btn = show.querySelector('[data-show-sound]');
    setSound(btn.getAttribute('aria-pressed') !== 'true');
  }

  /* ---- Open and close -------------------------------------------- */

  function open_(at, from) {
    if (!items.length) return;
    build();
    index = Math.max(0, Math.min(items.length - 1, at || 0));
    returnTo = from || document.activeElement;
    open = true;

    // The page's own clips wait; the show has its own copy.
    pausedClips = [...document.querySelectorAll('.work-field video')].filter((v) => !v.paused);
    pausedClips.forEach((v) => v.pause());

    // Everything but the show leaves the tab order and the reading
    // order while it is up.
    [...document.body.children].forEach((el) => { if (el !== show) el.inert = true; });
    document.documentElement.classList.add('is-showing');

    show.hidden = false;
    show.querySelector('[data-show-stage]').innerHTML = '';
    render(0);
    void show.offsetWidth;
    show.classList.add('is-open');
    show.classList.toggle('show--single', items.length < 2);

    if (show.requestFullscreen) {
      const p = show.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.catch) p.catch(() => {});
    }
    show.focus({ preventScroll: true });
  }

  /* Closing has two halves when the browser is in fullscreen: ask it
     to leave, then take the layer down once it has — otherwise the
     page shows for half a second inside a window that is still
     fullscreen while the exit animates. A safety timer covers a
     browser that never answers. */
  let closing = null;
  function close() {
    if (!open || closing) return;
    if (document.fullscreenElement === show && document.exitFullscreen) {
      closing = window.setTimeout(finishClose, 1200);
      document.exitFullscreen().catch(() => finishClose());
      return;
    }
    finishClose();
  }

  function finishClose() {
    if (!open) return;
    open = false;
    window.clearTimeout(closing);
    closing = null;
    [...document.body.children].forEach((el) => { el.inert = false; });
    document.documentElement.classList.remove('is-showing');
    show.classList.remove('is-open');

    const finish = () => {
      show.hidden = true;
      show.querySelector('[data-show-stage]').innerHTML = '';
    };
    if (reduce.matches) finish(); else window.setTimeout(finish, SLIDE_MS + 20);

    pausedClips.forEach((v) => { const p = v.play(); if (p) p.catch(() => {}); });
    pausedClips = [];
    if (returnTo && returnTo.focus) returnTo.focus({ preventScroll: true });
    returnTo = null;
  }

  window.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    else if (event.key === 'Tab') {
      // The show is the whole page while it is up: Tab cycles inside it.
      const focusable = [...show.querySelectorAll('button:not([hidden])')];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      else if (!show.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
    }
  });

  /* ---- Swipe ----------------------------------------------------- */

  function setupSwipe(stage) {
    let drag = null;
    let swallowClick = false;

    stage.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button > 0) return;
      if (event.target.closest('button')) return;
      drag = { id: event.pointerId, x0: event.clientX, y0: event.clientY, moved: false, samples: [] };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });

    function current() { return stage.querySelector('.show__media:not(.is-leaving)'); }

    function onMove(event) {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x0;
      const dy = event.clientY - drag.y0;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { onUp(event); return; }   // a vertical pull is not a swipe
        drag.moved = true;
      }
      drag.samples.push({ t: performance.now(), x: event.clientX });
      while (drag.samples.length > 2 && performance.now() - drag.samples[0].t > 100) drag.samples.shift();
      const media = current();
      if (media) { media.style.transition = 'none'; media.style.transform = `translate3d(${dx}px, 0, 0)`; }
    }

    function onUp(event) {
      if (!drag || event.pointerId !== drag.id) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      const d = drag; drag = null;
      if (!d.moved) return;

      swallowClick = true;
      window.setTimeout(() => { swallowClick = false; }, 0);

      const dx = event.clientX - d.x0;
      const s = d.samples;
      const v = s.length >= 2 ? (s[s.length - 1].x - s[0].x) / Math.max(1, s[s.length - 1].t - s[0].t) * 1000 : 0;
      const width = stage.getBoundingClientRect().width || 1;
      const media = current();
      const commit = Math.abs(dx) > width * SWIPE_COMMIT || Math.abs(v) > SWIPE_FLICK;
      // Direction from velocity when there is one, else from position.
      const dir = commit ? -Math.sign(Math.abs(v) > SWIPE_FLICK ? v : dx) : 0;

      if (media) {
        media.style.transition = '';
        if (dir && items.length > 1) {
          // Carry on from where the finger left it, out the far side;
          // the inline transform outranks the class render() adds.
          media.style.transform = `translate3d(${-dir * width}px, 0, 0)`;
        } else {
          media.style.transform = '';               // back to centre
        }
      }
      if (dir && items.length > 1) step(dir);
    }

    stage.addEventListener('click', (event) => {
      if (swallowClick) { event.preventDefault(); event.stopPropagation(); swallowClick = false; }
    }, true);
  }

  /* ---- Wiring ---------------------------------------------------- */

  /** Called by js/work-detail.js once the page is rendered: `list` is
      the media[] drawn as frames, in order; `root` holds the frames. */
  window.setupSlideshow = function setupSlideshow(root, list) {
    items = (list || []).filter((m) => m && m.src);
    if (!items.length) return;

    root.querySelectorAll('[data-slide]').forEach((el) => {
      el.addEventListener('click', (event) => {
        if (event.defaultPrevented) return;              // a drag just ended here
        if (event.target.closest('[data-sound]')) return;
        event.preventDefault();
        open_(Number(el.dataset.slide) || 0, el.closest('.floater') || el);
      });
    });

    // The mode switch, lower left — the page's own corner word.
    const mark = document.createElement('button');
    mark.className = 'show-mark label';
    mark.type = 'button';
    mark.dataset.overMedia = '';
    mark.textContent = 'Slideshow';
    mark.setAttribute('aria-label', 'Open the slideshow');
    mark.addEventListener('click', () => open_(0, mark));
    document.body.appendChild(mark);
  };
})();

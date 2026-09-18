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

   Full screen is the layer: fixed, covering the viewport, the same
   on every device. The browser's own fullscreen is offered, not
   imposed — a FULL SCREEN word in the bottom row (Frank, Sept 18
   2026, after living with the first cut: the window swelling into
   fullscreen is the OS's animation, half a second we cannot shape,
   and run on top of our lift-off it made the whole thing feel rough;
   asked for by hand, it is the visitor's choice and no surprise).
   Where the API is missing — iPhone Safari, for anything but a
   <video> — the word is not offered. Leaving the browser's fullscreen
   (Esc, the banner, the word again) leaves only that; the show stays
   up, the way a player keeps playing when its window shrinks.

   The bottom row is the site's bottom row: the mode word lower left,
   `← 02 / 05 →` at the centre in the stepper's arrows turned on their
   side, and the sound switch lower right when the slide is a clip.
   The media sits above that row at its native ratio, as large as the
   space allows, never cropped — the same rule as everywhere else.

   It is a carousel (Frank, Sept 18 2026, second brief): with more
   than one asset the slide before and the slide after stand either
   side of the current one, smaller and dimmed, so the visitor can see
   what is coming and what they passed. Every slide is mounted once
   and placed by its distance from the current one — 0 is centre and
   full size, ±1 is a preview, ±2 is off the edge and invisible — and
   a step moves the whole row at once. Moving: arrows, ← →, a press
   on a preview (goes there) or on the current picture (next), or a
   swipe that drags the row 1:1 and lets go on velocity, the way the
   canvas does. Under reduced motion the row does not travel; slides
   dissolve in place.

   Clips in the show play from the start, muted, with the same SOUND
   OFF / SOUND ON switch as the page. The page's own clips are paused
   while the show is up — two copies of a loop decoding under a layer
   nobody can see is waste — and resume when it closes.
   ============================================================ */

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ARROW = '<svg viewBox="0 0 12 15" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="square" focusable="false"><path d="M6 1.5V13"/><path d="M2 9.5 6 13.5 10 9.5"/></svg>';
  /* Timing. The switch between modes is a shared element: the picture
     the visitor pressed lifts off its frame and grows into the show,
     and on the way back the show's picture lands on the frame it
     belongs to. That is a move across the screen, so it gets the
     site's entrance figure in and a quicker exit out — the paper
     arrives underneath at the same time. Between slides the pair
     cross-fade with a 4% push in the direction of travel, over the
     dropdown range; a slide change happens tens of times in a sitting
     and must not feel like waiting. All --ease-out: every one of
     these is something arriving or leaving. */
  /* Slower than the site's UI figures, deliberately: Frank tried the
     first cut (260 / 200 / 220) and asked for more. These are the
     canvas's camera figures — a picture crossing the screen is a
     camera move, not a menu opening. The row between slides moves
     on --ease-in-out (it is on-screen movement); lift-off and landing
     stay on --ease-out (they arrive and leave). */
  const OPEN_MS = 600;    // the picture lifting off its frame (Frank, Sept 18: slower again)
  const CLOSE_MS = 480;   // and landing back on it (exits faster)
  const SLIDE_MS = 380;   // the row moving one slide along
  const PEEK_SCALE = 0.55;                                   // a preview's size against its own
  const PEEK_GAP = () => (window.innerWidth < 600 ? 20 : 40); // between the current and a preview
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
      <div class="show__tools">
        <button class="show__sound shot__sound" type="button" data-show-sound aria-pressed="false" aria-label="Turn sound on" hidden>Sound off</button>
        <button class="show__full shot__sound" type="button" data-show-full aria-pressed="false" aria-label="Enter full screen" hidden>Full screen</button>
      </div>`;
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

    /* The browser's fullscreen, on request. Offered only where the API
       exists; the word reads as a status the way SOUND does. */
    const full = show.querySelector('[data-show-full]');
    full.hidden = !show.requestFullscreen;
    full.addEventListener('click', () => {
      if (document.fullscreenElement === show) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      } else if (show.requestFullscreen) {
        const p = show.requestFullscreen({ navigationUI: 'hide' });
        if (p && p.catch) p.catch(() => {});
      }
    });

    // The bare paper closes; the picture advances. A swipe that moved
    // is neither — the stage's own handler swallows that click.
    show.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      if (event.defaultPrevented) return;
      const hit = event.target.closest('.show__media');
      if (hit) { const i = Number(hit.dataset.slide); if (i === index) step(1); else goTo(i); }
      else if (event.target === show || event.target.closest('[data-show-stage]') === event.target) close();
    });

    // Whichever way fullscreen changes — the word, Esc, the banner —
    // the word says where things stand; and if the show was on its way
    // out when the browser left fullscreen, this is the moment it goes.
    document.addEventListener('fullscreenchange', () => {
      const on = document.fullscreenElement === show;
      full.setAttribute('aria-pressed', String(on));
      full.setAttribute('aria-label', on ? 'Leave full screen' : 'Enter full screen');
      if (closing && !document.fullscreenElement) finishClose();
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

  let slides = [];

  /** Every slide, once. Clips start paused; only the current one plays. */
  function mount() {
    const stage = show.querySelector('[data-show-stage]');
    stage.innerHTML = items.map(slideMarkup).join('');
    slides = [...stage.querySelectorAll('.show__media')];
    slides.forEach((el) => { const v = el.querySelector('video'); if (v) { v.autoplay = false; v.pause(); } });
    show.querySelector('[data-show-total]').textContent = pad(items.length);
  }

  /** Signed distance from the current slide, the short way round. */
  function offsetOf(i) {
    const n = items.length;
    let off = ((i - index) % n + n) % n;
    if (off > n / 2) off -= n;
    return off;
  }

  /** Where each slide stands for the current index. Positions are
      built outward from the centre from the slides' own widths, so a
      wide preview beside a narrow current one still leaves the gap.
      `dragX` shifts the whole row while a finger holds it. */
  function layout(dragX = 0) {
    const n = items.length;
    const gap = PEEK_GAP();
    const cur = slides[index];
    const half = cur.offsetWidth / 2;
    const place = (el, off) => {
      const w = el.offsetWidth;
      let x = 0;
      if (off !== 0) {
        const sign = Math.sign(off);
        x = sign * (half + gap);
        // Walk past the previews between here and the centre.
        for (let k = 1; k < Math.abs(off); k++) {
          const between = slides[(index + sign * k + n) % n];
          x += sign * (between.offsetWidth * PEEK_SCALE + gap);
        }
        x += sign * (w * PEEK_SCALE) / 2;
      }
      const scale = off === 0 ? 1 : PEEK_SCALE;
      el.style.transform = `translate3d(${(x + dragX).toFixed(2)}px, 0, 0) scale(${scale})`;
      el.classList.toggle('is-current', off === 0);
      el.classList.toggle('is-peek', Math.abs(off) === 1);
      el.classList.toggle('is-far', Math.abs(off) > 1);
      el.setAttribute('aria-hidden', String(off !== 0));
    };
    slides.forEach((el, i) => place(el, offsetOf(i)));
  }

  function goTo(i, viaDrag) {
    if (!open || !slides.length) return;
    const was = index;
    index = ((i % items.length) + items.length) % items.length;
    if (!viaDrag) slides.forEach((el) => { el.style.transition = ''; });
    layout();
    if (was !== index) {
      const v0 = slides[was].querySelector('video');
      if (v0) v0.pause();
    }
    const v = slides[index].querySelector('video');
    if (v) {
      const play = () => { const p = v.play(); if (p) p.catch(() => {}); };
      play();
      // A clip that has no data yet plays when it does, if it is still
      // the one in the middle by then.
      if (v.readyState < 2) v.addEventListener('loadeddata', () => { if (slides[index] === v.closest('.show__media')) play(); }, { once: true });
    }
    show.querySelector('[data-show-index]').textContent = pad(index + 1);
    show.querySelector('[data-show-sound]').hidden = items[index].type !== 'video';
    setSound(false);
  }

  /** The transform that lays an element's current box over a target
      rectangle: translate the centres together, then scale about the
      centre. transform-origin is the default centre, so this is the
      whole FLIP — measure both, apply, release. */
  function fitTo(box, target) {
    const sx = target.width / box.width;
    const sy = target.height / box.height;
    const dx = (target.left + target.width / 2) - (box.left + box.width / 2);
    const dy = (target.top + target.height / 2) - (box.top + box.height / 2);
    return `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  }

  function currentMedia() { return slides[index] || null; }

  /** A slide's box as laid out, before any transform: a FLIP has to be
      computed against this, not against getBoundingClientRect — if
      the slide is mid-move when the show closes, the client rect is
      the transformed one and the landing would miss. The slides are
      absolutely positioned in the stage, so offsetLeft/Top are stage
      coordinates. */
  function layoutBox(el) {
    const st = el.offsetParent.getBoundingClientRect();
    return { left: st.left + el.offsetLeft, top: st.top + el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
  }
  function shotFor(i) { return document.querySelector(`.work-field [data-slide="${i}"]`); }

  /** A clip in flight should show the same frame on both sides of the
      hand-off, or the picture changes mid-air. */
  function syncClip(from, to) {
    const a = from && from.querySelector('video');
    const b = to && to.querySelector('video');
    if (a && b && Number.isFinite(a.currentTime)) { try { b.currentTime = a.currentTime; } catch (e) { /* not seekable yet */ } }
  }

  function step(dir) {
    if (!open || items.length < 2 || !dir) return;
    goTo(index + dir);
  }

  /* ---- Sound ----------------------------------------------------- */

  function setSound(on) {
    const btn = show.querySelector('[data-show-sound]');
    const video = currentMedia() && currentMedia().querySelector('video');
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
    show.classList.toggle('show--single', items.length < 2);
    show.classList.toggle('show--many', items.length > 1);
    mount();
    slides.forEach((el) => { el.style.transition = 'none'; });
    layout();
    goTo(index);
    void show.offsetWidth;
    slides.forEach((el) => { el.style.transition = ''; });

    /* Lift-off. The show's picture starts exactly over the frame on
       the page — same box, same clip frame — and grows to its place
       while the paper comes up underneath. Under reduced motion the
       paper simply fades up with the picture already in place. */
    const media = currentMedia();
    const source = shotFor(index);
    if (media && source && !reduce.matches) {
      syncClip(source, media);
      media.style.transition = 'none';
      media.style.transform = fitTo(layoutBox(media), source.getBoundingClientRect());
      void media.offsetWidth;
      media.style.transition = `transform ${OPEN_MS}ms var(--ease-out)`;
      layout();                                   // back to its place: identity at the centre
      window.setTimeout(() => { if (media.isConnected) media.style.transition = ''; }, OPEN_MS + 20);
    }
    show.classList.add('is-open');
    show.focus({ preventScroll: true });
  }

  /* Closing has two halves when the visitor took the browser into
     fullscreen: ask it to leave, then take the layer down once it has
     — otherwise the page shows for half a second inside a window that
     is still fullscreen while the exit animates. A safety timer
     covers a browser that never answers. */
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

    /* Landing. The picture goes back to the frame it belongs to — the
       current slide's, which is not always the one that was pressed —
       so the page underneath is first scrolled, unseen, to put that
       frame in view, and the clip is set to the same moment. */
    const media = currentMedia();
    const target = shotFor(index);
    if (media && target && !reduce.matches) {
      const r = target.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) target.scrollIntoView({ block: 'center', behavior: 'instant' });
      syncClip(media, target);
      media.style.transition = `transform ${CLOSE_MS}ms var(--ease-out)`;
      media.style.transform = fitTo(layoutBox(media), target.getBoundingClientRect());
    }
    show.classList.remove('is-open');

    const finish = () => {
      show.hidden = true;
      show.querySelector('[data-show-stage]').innerHTML = '';
      slides = [];
    };
    window.setTimeout(finish, (reduce.matches ? SLIDE_MS : CLOSE_MS) + 20);

    pausedClips.forEach((v) => { const p = v.play(); if (p) p.catch(() => {}); });
    pausedClips = [];
    if (returnTo && returnTo.focus) returnTo.focus({ preventScroll: true });
    returnTo = null;
  }

  window.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') {
      // In the browser's fullscreen, Esc is the browser's: it leaves
      // fullscreen and the show stays. The next Esc closes.
      if (document.fullscreenElement) return;
      event.preventDefault(); close();
    }
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

    function onMove(event) {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x0;
      const dy = event.clientY - drag.y0;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { onUp(event); return; }   // a vertical pull is not a swipe
        drag.moved = true;
        slides.forEach((el) => { el.style.transition = 'none'; });
      }
      drag.samples.push({ t: performance.now(), x: event.clientX });
      while (drag.samples.length > 2 && performance.now() - drag.samples[0].t > 100) drag.samples.shift();
      // The whole row follows the finger, previews and all.
      layout(items.length > 1 ? dx : dx * 0.3);
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
      const commit = Math.abs(dx) > width * SWIPE_COMMIT || Math.abs(v) > SWIPE_FLICK;
      // Direction from velocity when there is one, else from position.
      const dir = commit ? -Math.sign(Math.abs(v) > SWIPE_FLICK ? v : dx) : 0;

      // Transitions back on: the row travels from wherever the finger
      // left it to the new positions, or home.
      slides.forEach((el) => { el.style.transition = ''; });
      if (dir && items.length > 1) goTo(index + dir, true);
      else layout();
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

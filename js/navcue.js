/* ============================================================
   Corner cues.

   A cue is a quiet word in a corner that grows a short branch of
   nodes when asked. There are two of them:

   - Navigate, lower right on every inner page. Inner pages used to
     carry a nameplate and a way back in the top corners; both are
     gone, because the name is the root of the node tree one click
     away and a masthead repeated on every page is the thing this site
     is built to avoid.

   - Filter, upper left on the works page, which js/works.js builds
     and shows only once the real filter bar has scrolled away.

   They behave identically, so they are one component: anything
   carrying data-cue gets set up here.

   The open state lives in a class rather than in :hover, deliberately.
   Touch browsers fire a synthetic hover on tap that never leaves, so a
   CSS-only hover menu strands itself open on a phone. Here the pointer
   opens it only where there is a real pointer to open it with, and on
   touch the tap is the only way in.
   ============================================================ */

(() => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  function setupCue(cue) {
    if (!cue || cue.dataset.cueReady === 'on') return;
    const trigger = cue.querySelector('.navcue__trigger');
    if (!trigger) return;
    cue.dataset.cueReady = 'on';

    function open(state) {
      cue.classList.toggle('is-open', state);
      trigger.setAttribute('aria-expanded', String(state));
    }

    trigger.addEventListener('click', () => {
      open(!cue.classList.contains('is-open'));
    });

    cue.addEventListener('pointerenter', (event) => {
      if (fine.matches && event.pointerType !== 'touch') open(true);
    });

    cue.addEventListener('pointerleave', (event) => {
      if (fine.matches && event.pointerType !== 'touch') open(false);
    });

    /* Focus anywhere inside opens it, so a keyboard reaches the branch
       the same way a pointer does. On the Navigate cue that is also
       why the trigger comes first in the markup and the column is
       reversed in CSS - the tab order then runs bottom to top, the way
       the branch reads. */
    cue.addEventListener('focusin', () => open(true));
    cue.addEventListener('focusout', () => {
      // The next focus target is not known until after this event.
      window.setTimeout(() => {
        if (!cue.contains(document.activeElement)) open(false);
      }, 0);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && cue.classList.contains('is-open')) {
        open(false);
        trigger.focus();
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (!cue.contains(event.target)) open(false);
    });

    // A link to the page you are already standing on is not a link.
    const here = window.location.pathname.split('/').pop() || 'index.html';
    cue.querySelectorAll('.navcue__link').forEach((link) => {
      if (link.getAttribute('href') === here) link.setAttribute('aria-current', 'page');
    });
  }

  /* ---- Over media ------------------------------------------------
     A cue with a picture under it turns white (see the CSS). Whether
     one is under it is measured: the trigger's box - plus the rungs'
     boxes while the branch is open - against every media frame on the
     page. Checked when a drag or resize lands (cards:moved), live
     while a button is held so the words change as the frame arrives,
     on scroll (a fixed corner passes over a page that moves), and on
     resize. rAF-throttled, so the cost is a handful of rects a frame
     at most, and nothing at all while the pointer is idle. */
  const cues = new Set();
  let checkPending = false;

  function cueBoxes(cue) {
    const parts = [cue.querySelector('.navcue__trigger')];
    if (cue.classList.contains('is-open')) {
      parts.push(...cue.querySelectorAll('.navcue__link, .filter-btn, .filter-group__label'));
    }
    return parts.map((el) => el.getBoundingClientRect()).filter((b) => b.width && b.height);
  }

  function overlaps(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function checkOverMedia() {
    checkPending = false;
    const media = [...document.querySelectorAll('.media-frame, .floater')]
      .map((el) => el.getBoundingClientRect())
      .filter((b) => b.width && b.height);
    cues.forEach((cue) => {
      const boxes = cueBoxes(cue);
      const over = media.some((m) => boxes.some((b) => overlaps(m, b)));
      cue.classList.toggle('is-over-media', over);
    });
    // Anything else that asks for it — the section stepper — gets the
    // same check on its own box, so the bottom row changes together.
    document.querySelectorAll('[data-over-media]').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (!b.width) return;
      el.classList.toggle('is-over-media', media.some((m) => overlaps(m, b)));
    });
  }

  function requestCheck() {
    if (checkPending) return;
    checkPending = true;
    requestAnimationFrame(checkOverMedia);
  }

  window.addEventListener('cards:moved', requestCheck);
  window.addEventListener('scroll', requestCheck, { passive: true });
  window.addEventListener('resize', requestCheck);
  window.addEventListener('pointermove', (event) => {
    if (event.buttons) requestCheck(); // a held button is a drag or a resize in progress
  }, { passive: true });

  // js/works.js builds its filter cue after this file has run, so the
  // setup function is shared rather than kept inside this closure.
  window.setupCue = (cue) => {
    setupCue(cue);
    if (cue && cue.dataset.cueReady === 'on') { cues.add(cue); requestCheck(); }
  };
  document.querySelectorAll('[data-cue]').forEach(window.setupCue);
})();

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
      // The rungs unfold over ~400ms and land somewhere new; each word
      // is re-measured every frame until the branch has settled.
      requestCheck(650);
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
     A word with a picture under it turns white (see the CSS). Whether
     one is under it is measured, and it is measured PER WORD (Sept 17
     2026): the trigger, and while the branch is open every rung, every
     filter button and every group label, each against every media
     frame on the page, each carrying its own state. The first version
     kept one state for the whole cue — if any part touched a picture
     the lot went white — and Frank found the two ways that fails: a
     branch opens upward from a trigger on paper and its top rungs
     land on a picture and stay ink, invisible; or one rung touches a
     picture and the trigger on white paper goes white with it. A
     hairline edge takes the state of the rung it hangs off.

     Checked when a drag or resize lands (cards:moved), live while a
     button is held so the words change as the frame arrives, on
     scroll (a fixed corner passes over a page that moves), on resize,
     and — the case the first version missed — for the ~400ms after a
     cue opens or closes, while the rungs are still unfolding to where
     they will be measured. rAF-throttled, so the cost is a handful of
     rects a frame at most, and nothing at all while idle. */
  const cues = new Set();
  const WORDS = '.navcue__trigger, .navcue__link, .filter-btn, .filter-group__label, .tool-btn';
  let checkPending = false;
  let checkUntil = 0;

  function overlaps(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function overAny(el, media) {
    const b = el.getBoundingClientRect();
    return Boolean(b.width && b.height) && media.some((m) => overlaps(m, b));
  }

  function checkOverMedia() {
    checkPending = false;
    const media = [...document.querySelectorAll('.media-frame, .floater')]
      .map((el) => el.getBoundingClientRect())
      .filter((b) => b.width && b.height);

    cues.forEach((cue) => {
      const open = cue.classList.contains('is-open');
      cue.querySelectorAll(WORDS).forEach((el) => {
        /* An open cue stands on its frosted sheet (the ::before in the
           CSS), which washes whatever is under it towards the paper —
           so its words read best in plain ink, and the white-over-
           media treatment is for the closed trigger alone, the one
           word that sits straight on the page. A folded rung is under
           nothing: its state clears with the cue. */
        const counts = !open && el.classList.contains('navcue__trigger');
        el.classList.toggle('is-over-media', counts && overAny(el, media));
      });
      cue.querySelectorAll('.navcue__item').forEach((item) => {
        const lit = [...item.querySelectorAll(WORDS)].some((w) => w.classList.contains('is-over-media'));
        item.classList.toggle('is-over-media', lit);
      });
    });

    // Anything else that asks for it — each of the section stepper's
    // arrows — gets the same check on its own box.
    document.querySelectorAll('[data-over-media]').forEach((el) => {
      el.classList.toggle('is-over-media', overAny(el, media));
    });

    if (performance.now() < checkUntil) requestCheck();
  }

  /** Check on the next frame; with `forMs`, keep checking every frame
      for that long — for anything that is still moving into place. */
  function requestCheck(forMs) {
    if (forMs) checkUntil = Math.max(checkUntil, performance.now() + forMs);
    if (checkPending) return;
    checkPending = true;
    requestAnimationFrame(checkOverMedia);
  }

  window.addEventListener('cards:moved', () => requestCheck());
  window.addEventListener('scroll', () => requestCheck(), { passive: true });
  window.addEventListener('resize', () => requestCheck());
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

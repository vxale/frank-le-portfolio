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

    /* Back to top is a rung like the others, and the nearest one to
       the trigger: the cheapest thing the branch offers and the one
       most often wanted on a long page. It closes the branch behind
       itself - the visitor asked to go somewhere, not to keep looking
       at a menu. */
    const toTop = cue.querySelector('[data-scroll-top]');
    if (toTop) {
      toTop.addEventListener('click', () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        open(false);
      });

      /* And it is not a rung at all while you are already at the top.
         The rung is removed from the layout rather than faded, so the
         branch closes up behind it and the hairline above it reaches
         down to the trigger instead of to a gap.

         40px rather than zero: a page can sit a hair off the top after
         a reload or a rubber-band, and a rung that flickers in and out
         of a menu is worse than one that waits a moment. */
      const rung = toTop.closest('.navcue__item');
      let wasScrolled = null;

      function syncToTop() {
        const scrolled = window.scrollY > 40;
        if (scrolled === wasScrolled) return;   // nothing to write
        wasScrolled = scrolled;
        if (rung) rung.classList.toggle('is-off', !scrolled);
      }

      window.addEventListener('scroll', syncToTop, { passive: true });
      syncToTop();
    }

    // A link to the page you are already standing on is not a link.
    const here = window.location.pathname.split('/').pop() || 'index.html';
    cue.querySelectorAll('.navcue__link').forEach((link) => {
      if (link.getAttribute('href') === here) link.setAttribute('aria-current', 'page');
    });
  }

  // js/works.js builds its filter cue after this file has run, so the
  // setup function is shared rather than kept inside this closure.
  window.setupCue = setupCue;
  document.querySelectorAll('[data-cue]').forEach(setupCue);
})();

/* Section stepper: two arrows at the bottom centre of every scrolling
   page that move the screen one section at a time. Sections are the
   elements marked data-stop, plus the top of the page, which is always
   the first stop. Each page marks its own — the CV and the closing
   nodes on About, every card on the grid, the facts / passages /
   credits / next project on a project page — and pages that don't
   scroll get no stepper at all.

   Built once, from here, so no page carries the markup. It shares the
   bottom row with the two corner cues and takes the same treatment
   over media (data-over-media, read by js/navcue.js), so the three
   controls read as one family. */
(() => {
  const ARROW =
    '<svg viewBox="0 0 12 15" fill="none" stroke="currentColor" ' +
    'stroke-width="1.1" stroke-linecap="square" focusable="false">' +
    '<path d="M6 1.5V13"/><path d="M2 9.5 6 13.5 10 9.5"/></svg>';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const nav = document.createElement('nav');
  nav.className = 'stepper';
  nav.setAttribute('aria-label', 'Sections');
  nav.dataset.overMedia = '';
  nav.hidden = true;
  nav.innerHTML = `
    <button class="stepper__btn stepper__btn--up" type="button" data-dir="-1"
            aria-label="Previous section"><span class="stepper__glyph" aria-hidden="true">${ARROW}</span></button>
    <button class="stepper__btn stepper__btn--down" type="button" data-dir="1"
            aria-label="Next section"><span class="stepper__glyph" aria-hidden="true">${ARROW}</span></button>`;
  document.body.appendChild(nav);
  const up = nav.querySelector('[data-dir="-1"]');
  const down = nav.querySelector('[data-dir="1"]');

  /* A section lands with the same air above it that the first one has
     under the header — the field's own top padding, read from the
     page rather than guessed, so the stepper agrees with the layout
     it is stepping through. */
  function landing() {
    const field = document.querySelector('.field, .work-field, .section');
    return field ? parseFloat(getComputedStyle(field).paddingTop) || 0 : 0;
  }

  function stops() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pad = landing();
    const tops = [...document.querySelectorAll('[data-stop]')]
      .map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY - pad))
      .filter((t) => t > 0);
    // The top of the page is always a stop, and nothing sits past the
    // furthest the page can scroll.
    const all = [...new Set([0, ...tops.map((t) => Math.min(t, max))])].sort((a, b) => a - b);
    /* A step should move the screen, not nudge it. Any stop within
       four-tenths of a screen of the one already kept is folded into
       it — on the grid the cards come in staggered pairs about 110px
       apart, so this makes one stop per row rather than one per card,
       and the first card, which is already in view at the top, folds
       into the top. Measured against the viewport, so a phone (where
       the cards stack) and a desktop get the right answer each. */
    const minGap = window.innerHeight * 0.4;
    const kept = [];
    all.forEach((t) => { if (!kept.length || t - kept[kept.length - 1] >= minGap) kept.push(t); });
    // The very end is always reachable, whatever the spacing.
    if (max > 0 && kept[kept.length - 1] !== max && max - kept[kept.length - 1] > 4) kept.push(max);
    return kept;
  }

  /* Where the page is heading, while a smooth scroll is still on its
     way. Two quick presses used to move one section, not two: the
     second press read the live scroll position, which mid-flight was
     still short of the first target, and re-targeted the same stop.
     A press while travelling now steps from the stop being travelled
     to. The memory clears when the page arrives, when the visitor
     takes over (wheel, touch, keyboard), and on a timer in case the
     browser's smooth scroll never quite lands. */
  let heading = null;
  let headingTimer = null;
  function forget() {
    heading = null;
    window.clearTimeout(headingTimer);
  }

  function go(dir) {
    const y = heading !== null ? heading : Math.round(window.scrollY);
    const list = stops();
    // A few pixels of slack: a smooth scroll can settle a pixel short
    // of its target, and that must not count as "still here".
    const target = dir > 0
      ? list.find((t) => t > y + 4)
      : [...list].reverse().find((t) => t < y - 4);
    if (target === undefined) return;
    heading = target;
    window.clearTimeout(headingTimer);
    headingTimer = window.setTimeout(forget, 1500);
    window.scrollTo({ top: target, behavior: reduce.matches ? 'auto' : 'smooth' });
  }

  ['wheel', 'touchstart', 'keydown'].forEach((type) => {
    window.addEventListener(type, (event) => {
      // Enter or Space on the arrows themselves is a press, not a takeover.
      if (type === 'keydown' && nav.contains(event.target)) return;
      forget();
    }, { passive: true });
  });

  up.addEventListener('click', () => go(-1));
  down.addEventListener('click', () => go(1));

  /* At either end the arrow that has nowhere to go fades rather than
     disappears, so the pair holds its shape and the other arrow does
     not slide into the middle. The whole control hides on a page that
     cannot scroll at all. */
  let pending = false;
  function sync() {
    pending = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    // A page that scrolls less than a couple of hundred pixels has no
    // sections to step through — Contact on a large screen, say — and
    // a pair of arrows for one small hop would be clutter.
    nav.hidden = max < 200;
    if (nav.hidden) return;
    const y = Math.round(window.scrollY);
    if (heading !== null && Math.abs(y - heading) <= 4) forget();   // arrived
    const list = stops();
    const hasPrev = list.some((t) => t < y - 4);
    const hasNext = list.some((t) => t > y + 4);
    up.classList.toggle('is-end', !hasPrev);
    down.classList.toggle('is-end', !hasNext);
    up.setAttribute('aria-disabled', String(!hasPrev));
    down.setAttribute('aria-disabled', String(!hasNext));
  }
  function requestSync() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(sync);
  }

  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync);
  window.addEventListener('load', requestSync);
  // Pages that render their stops from JSON (the grid, project pages)
  // finish after this file runs; watch for them.
  new MutationObserver(requestSync).observe(document.body, { childList: true, subtree: true });
  requestSync();
})();

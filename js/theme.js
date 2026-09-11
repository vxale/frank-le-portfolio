/* ============================================================
   Light / dark.

   Three states, not two: light, dark, and "whatever the machine
   says". The site starts in the third — an explicit choice only
   exists once the visitor makes one, and it is remembered from then
   on. That is why the CSS keys off both prefers-color-scheme AND a
   data-theme attribute, and why a one-line script in each <head>
   sets the attribute before first paint: without it the page renders
   light for a frame and then flips, which is worse than either mode.

   Dark here is a print negative, not a different design — the same
   ink and paper, swapped. Media is left alone: the work is the work.
   ============================================================ */

(() => {
  const KEY = 'theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');

  function stored() {
    try {
      const v = localStorage.getItem(KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch (err) {
      return null;                    // private mode — fine, no memory
    }
  }

  /** What is actually on screen, whoever decided it. */
  function active() {
    return stored() || (system.matches ? 'dark' : 'light');
  }

  function paint() {
    const choice = stored();
    if (choice) root.dataset.theme = choice;
    else delete root.dataset.theme;   // back to following the machine

    const now = active();
    document.querySelectorAll('[data-set-theme]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.setTheme === now));
    });
  }

  let fadeTimer = 0;

  /* Crossfade rather than cut. Two ways, in order of preference:

     1. A view transition. The browser snapshots the page as it is,
        applies the change, and dissolves the old picture into the new
        one on the compositor. One texture fading over another - the
        canvas, the type, the video frames and all - at no cost to the
        main thread, which on this page is already drawing edges and
        drifting nodes every frame.

     2. Failing that, the four colour tokens are transitioned
        directly. Custom properties only interpolate once they are
        registered with @property, which css/style.css does. This
        recalculates style for the whole document on every frame, so
        it is the fallback and not the plan, and the class comes off
        again as soon as the fade is done.

     Both are linear on purpose: a crossfade is a constant-rate blend,
     and an eased one lets the two layers overlap unevenly in the
     middle - a visible dip or flash halfway through the change. */
  function swap(apply) {
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(apply);
      return;
    }
    root.classList.add('is-theme-fading');
    apply();
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(
      () => root.classList.remove('is-theme-fading'), 340);
  }

  function set(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (err) { /* nothing to do — the page still switches */ }
    swap(paint);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-set-theme]').forEach((btn) => {
      btn.addEventListener('click', () => set(btn.dataset.setTheme));
    });
    paint();
  });

  // If the visitor never chose, follow the machine when it changes.
  system.addEventListener('change', () => { if (!stored()) paint(); });
})();

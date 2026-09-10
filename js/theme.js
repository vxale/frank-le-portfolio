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

  function set(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (err) { /* nothing to do — the page still switches */ }
    paint();
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

/* ============================================================
   The Navigate cue.

   Inner pages used to carry a nameplate and a way back in the top
   corners. Both are gone: the name is the root of the node tree one
   click away, and a masthead repeated on every page is the thing this
   site is built to avoid. What is left is one quiet word in the lower
   right that grows a short branch upward when asked.

   The open state lives in a class rather than in :hover, deliberately.
   Touch browsers fire a synthetic hover on tap that never leaves, so a
   CSS-only hover menu strands itself open on a phone. Here the pointer
   opens it only where there is a real pointer to open it with, and on
   touch the tap is the only way in.
   ============================================================ */

(() => {
  const cue = document.querySelector('.navcue');
  if (!cue) return;

  const trigger = cue.querySelector('.navcue__trigger');
  if (!trigger) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

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
     the same way a pointer does: tab to Navigate, and All works and
     Home are the next two stops. That is also why the trigger comes
     first in the markup and the column is reversed in CSS - the tab
     order then runs bottom to top, the way the branch reads. */
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
})();

/* The behind-the-scenes pile on about.html: one click spreads it,
   another stacks it. The stage is the control — role=button, so it
   takes Enter and Space like a real one — and aria-pressed carries the
   state the CSS reads. Drifting comes from js/site.js like every
   other .drift. No drag: the two gestures would fight, and a pile you
   spread with one tap is the whole idea. */
(() => {
  const stage = document.querySelector('.pile__stage');
  if (!stage) return;

  const toggle = () => {
    const open = stage.getAttribute('aria-pressed') !== 'true';
    stage.setAttribute('aria-pressed', String(open));
    stage.setAttribute('aria-label',
      `Behind the scenes: three photos from set. ${open ? 'Stack them' : 'Spread them out'}`);
  };

  stage.addEventListener('click', toggle);
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
})();

/* The behind-the-scenes pile on about.html. Dragging and drifting
   come from js/drag.js and js/site.js like every other .floater; this
   file adds the two things a pile needs on top of that:

   - The print you last touched comes to the top. Resting order is DOM
     order, but once you've pulled one out and dropped it, it should
     stay above the ones it was under, or it slides back beneath them
     on release and the pile looks like it swallowed your move.
   - A Stack control, shown only once something has moved, that sends
     every print home. window.sendHome animates the trip (320ms,
     --ease-in-out, the works grid's Tidy up), so the prints travel
     back rather than snap. */
(() => {
  const pile = document.querySelector('.pile');
  if (!pile) return;

  const items = [...pile.querySelectorAll('.pile__item')];
  const stack = pile.querySelector('[data-stack]');
  let top = items.length;

  items.forEach((el) => {
    // pointerdown, not click: a drag never produces a click, and the
    // reorder has to happen before the drag begins.
    el.addEventListener('pointerdown', () => {
      top += 1;
      el.style.setProperty('--z', String(top));
    });
  });

  // js/drag.js fires this when any drag ends with the element moved.
  window.addEventListener('cards:moved', () => {
    if (stack) stack.hidden = false;
  });

  if (stack) {
    stack.addEventListener('click', () => {
      // Home position AND resting order: a stacked pile should look
      // put away, not like the last print you held is still on top.
      items.forEach((el) => { window.sendHome(el); el.style.removeProperty('--z'); });
      top = items.length;
      stack.hidden = true;
    });
  }
})();

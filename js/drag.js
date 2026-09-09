/* ============================================================
   Shared drag — anything on a canvas page can be picked up.

   Dragging here is a TRANSFORM OFFSET from wherever the layout
   already put the element. Nothing is absolutely positioned and
   nothing reflows: the element keeps its place in the document,
   and the transform moves it visually. That is what lets a work
   page stay responsive while its images float free.

   Two details carried over from building the node tree, both of
   which are easy to break by "improving" them:

   - The move/up listeners go on the window and NOTHING calls
     setPointerCapture. Capturing retargets the press, so the
     browser fires the click on the wrapper instead of the link
     inside it — every click silently stops working.
   - A press only becomes a drag past DRAG_THRESHOLD, and a real
     drag suppresses the click that would otherwise follow. One
     press either moves a thing or opens it, never both.

   Usage: makeDraggable(element) — the element gets .is-dragging
   while held, and remembers where it was dropped.
   ============================================================ */

(() => {
  const DRAG_THRESHOLD = 4;

  let active = null;        // one pointer at a time, page-wide
  let suppressClick = false;

  function currentOffset(el) {
    return {
      x: parseFloat(el.dataset.dragX || '0') || 0,
      y: parseFloat(el.dataset.dragY || '0') || 0,
    };
  }

  function paint(el, x, y) {
    el.dataset.dragX = x;
    el.dataset.dragY = y;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function onPointerDown(event, el) {
    if (active) return;                                   // ignore extra fingers
    if (event.button !== undefined && event.button > 0) return;

    const start = currentOffset(el);
    active = {
      el,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: start.x,
      originY: start.y,
      moved: false,
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(event) {
    if (!active || event.pointerId !== active.pointerId) return;
    const dx = event.clientX - active.startX;
    const dy = event.clientY - active.startY;

    if (!active.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      active.moved = true;
      active.el.classList.add('is-dragging');
      document.body.classList.add('is-dragging-something');
    }

    paint(active.el, active.originX + dx, active.originY + dy);
  }

  function onPointerUp(event) {
    if (!active || event.pointerId !== active.pointerId) return;
    const { el, moved } = active;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    el.classList.remove('is-dragging');
    document.body.classList.remove('is-dragging-something');
    active = null;

    suppressClick = moved;
    if (moved) window.setTimeout(() => { suppressClick = false; }, 0);
  }

  window.makeDraggable = function makeDraggable(el) {
    if (!el || el.dataset.draggable === 'on') return;
    el.dataset.draggable = 'on';
    paint(el, currentOffset(el).x, currentOffset(el).y);
    el.addEventListener('pointerdown', (event) => onPointerDown(event, el));
    el.querySelectorAll('a, img, video').forEach((child) => {
      child.draggable = false;                            // no native link/image drag
    });
    el.addEventListener('click', (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      suppressClick = false;
    }, true);
  };

  // driftAll() lives in site.js, because the node tree needs it too
  // and this file isn't loaded on the homepage.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-drag]').forEach((el) => window.makeDraggable(el));
    window.driftAll(document.querySelectorAll('.drift'));
  });
})();

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
    if (moved) announceMoved();
  }

  /* Anything that offers to put things back needs to know something
     was taken out of place. One event, no knowledge of who listens. */
  function announceMoved() {
    window.dispatchEvent(new CustomEvent('cards:moved'));
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

  /* ----------------------------------------------------------
     Resize, for media that the visitor is allowed to re-crop.

     Same two house rules as the drag above: window listeners, and
     nothing calls setPointerCapture. The grip stops the event from
     reaching the card, so one press is either a resize or a move,
     never both.

     Sizes are clamped at both ends. A frame small enough to vanish
     or wide enough to push a scrollbar across the page is not a
     composition, it is a broken layout.
     ---------------------------------------------------------- */

  const MIN_SIZE = 120;

  window.makeResizable = function makeResizable(frame) {
    if (!frame || frame.dataset.resizable === 'on') return;
    const grip = frame.querySelector('[data-resize-grip]');
    if (!grip) return;
    frame.dataset.resizable = 'on';

    let sizing = null;

    function onMove(event) {
      if (!sizing || event.pointerId !== sizing.id) return;

      /* The crop is fixed: only the size changes. The frame's shape is
         a composition decision made in the CSS (16:9, 3:4, 4:3, 1:1
         by position in the grid) and letting a drag squash it would
         let anyone distort the work by accident.

         So the pointer is projected onto the frame's own diagonal
         rather than read as two independent numbers. Moving along the
         diagonal scales at full speed; moving across it barely counts,
         which is exactly how a constrained corner-drag should feel.
         Both axes still contribute, so the frame never feels dead to
         a vertical pull. */
      const dx = event.clientX - sizing.x;
      const dy = event.clientY - sizing.y;
      const r = sizing.ratio;
      const along = (dx * r + dy) / (r * r + 1);

      const maxW = document.documentElement.clientWidth * 0.92;
      const maxH = document.documentElement.clientHeight * 1.2;

      let w = sizing.w + along * r;
      w = Math.max(MIN_SIZE, Math.min(maxW, maxH * r, w));

      // aspect-ratio does the height. Setting it explicitly here would
      // be a second source of truth for the same number.
      frame.style.aspectRatio = String(r);
      frame.style.height = 'auto';
      frame.style.width = w + 'px';
    }

    function onUp(event) {
      if (!sizing || event.pointerId !== sizing.id) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      frame.classList.remove('is-resizing');
      document.body.classList.remove('is-dragging-something');
      sizing = null;
      announceMoved();
    }

    grip.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button > 0) return;
      event.preventDefault();
      event.stopPropagation();

      const box = frame.getBoundingClientRect();
      sizing = {
        id: event.pointerId,
        x: event.clientX, y: event.clientY,
        w: box.width, h: box.height,
        ratio: box.height > 0 ? box.width / box.height : 1,
      };
      frame.classList.add('is-resizing');
      document.body.classList.add('is-dragging-something');

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
  };

  /* Put one thing back where the layout wanted it.

     The journey home is animated; the crop is not. Transitioning a
     frame's width would animate the height of the grid row it sits in,
     and through that the position of everything below it - a page-wide
     reflow, sixty times a second, to make a corner snap look smooth.
     The eye follows the card travelling and does not miss the rest. */
  const HOME_MS = 320;

  window.sendHome = function sendHome(el) {
    if (!el) return;
    const frame = el.querySelector ? el.querySelector('.media-frame') : null;
    if (frame) {
      frame.style.width = '';
      frame.style.height = '';
      frame.style.aspectRatio = '';
      frame.style.removeProperty('width');
    }
    if (el.dataset.draggable !== 'on') return;
    const at = currentOffset(el);
    if (!at.x && !at.y) return;
    el.classList.add('is-homing');
    paint(el, 0, 0);
    window.setTimeout(() => el.classList.remove('is-homing'), HOME_MS + 40);
  };

  // driftAll() lives in site.js, because the node tree needs it too
  // and this file isn't loaded on the homepage.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-drag]').forEach((el) => window.makeDraggable(el));
    window.driftAll(document.querySelectorAll('.drift'));
  });
})();

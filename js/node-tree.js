/* ============================================================
   Node tree — the site's navigation, and the homepage itself.

   A branching diagram on blank paper. Every node can be dragged
   anywhere on the canvas. Clicking a branch reveals its children;
   clicking a leaf opens that page. There is no list menu anywhere
   on the site — this is the menu.

   Structure comes from data/works.json, so adding a project adds a
   node. Nothing here is hand-placed:

     Frank Le
       ├── About                    → about.html
       ├── Works                    (branch)
       │     ├── Film (n)           (branch) → each project
       │     ├── Design (n)         (branch) → each project
       │     ├── Photography (n)    (branch) → each project
       │     └── All works          → works.html
       └── Contact                  → contact.html

   Motion notes (see docs/style-direction.md): children grow out of
   their parent rather than fading in where they land — nothing
   appears from nothing. Expanding is slightly slower than
   collapsing, because expanding is the visitor deciding and
   collapsing is the system responding. Dragging has no transition
   at all, so a node tracks the pointer exactly.
   ============================================================ */

(() => {
  const canvas = document.querySelector('[data-node-canvas]');
  if (!canvas) return;

  const svg = canvas.querySelector('.canvas__edges');
  const layer = canvas.querySelector('.canvas__nodes');
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = () => motionQuery.matches;

  const ENTER_MS = 260;   // under 300ms — this is UI, not marketing
  const EXIT_MS = 170;    // exits are faster than entrances
  const STAGGER_MS = 45;
  const DRAG_THRESHOLD = 4; // px of movement before a press becomes a drag

  const allNodes = [];
  const edges = [];
  let root = null;
  let dragging = null;
  let suppressClick = false;

  // ---------- Building the tree data ----------

  let nextId = 0;
  function makeNode({ label, href, count, children, navKey }) {
    const node = {
      uid: `n${nextId++}`,
      label,
      href: href || null,
      count: count === undefined ? null : count,
      navKey: navKey || null,
      childSpecs: children || [],
      children: [],
      parent: null,
      depth: 0,
      x: 0,
      y: 0,
      pinned: false,   // true once the visitor has dragged it
      expanded: false,
      el: null,
      hit: null,
    };
    allNodes.push(node);
    return node;
  }

  function specToTree(spec, parent) {
    const node = makeNode(spec);
    node.parent = parent;
    node.depth = parent ? parent.depth + 1 : 0;
    return node;
  }

  async function buildData() {
    let works = [];
    try {
      works = await fetchWorks();
    } catch (err) {
      works = []; // page branches still work without project data
    }

    const types = [...new Set(works.map((w) => w.type))];
    const typeSpecs = types.map((type) => ({
      label: typeLabel(type),
      count: works.filter((w) => w.type === type).length,
      children: works
        .filter((w) => w.type === type)
        .map((w) => ({ label: w.title, href: workHref(w) })),
    }));

    const worksChildren = typeSpecs.concat(
      works.length ? [{ label: 'All works', href: 'works.html', navKey: 'works' }] : []
    );

    root = specToTree({
      label: 'Frank Le',
      children: [
        { label: 'About', href: 'about.html', navKey: 'about' },
        { label: 'Works', count: works.length, children: worksChildren },
        { label: 'Contact', href: 'contact.html', navKey: 'contact' },
      ],
    }, null);
  }

  // ---------- Geometry ----------

  function bounds() {
    const r = canvas.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  /** Nodes never leave the canvas, and never sit tight against an
      edge — the padding is what keeps this feeling like paper with
      margins rather than a viewport with things jammed into it. */
  function clampPosition(node) {
    const { w, h } = bounds();
    const padX = Math.min(140, w * 0.12);
    const padY = Math.min(90, h * 0.12);
    node.x = Math.max(padX, Math.min(w - padX, node.x));
    node.y = Math.max(padY, Math.min(h - padY, node.y));
  }

  function placeRoot() {
    const { w, h } = bounds();
    // Deliberately off-centre — the asymmetry is the house style.
    root.x = w * (w < 720 ? 0.5 : 0.28);
    root.y = h * (w < 720 ? 0.22 : 0.34);
    clampPosition(root);
  }

  /** Children fan out along an arc pointing away from the parent's
      own parent, so the tree keeps growing outward instead of
      doubling back over itself. */
  function layoutChildren(parent) {
    const kids = parent.children;
    if (!kids.length) return;

    const { w, h } = bounds();
    const base = parent.parent
      ? Math.atan2(parent.y - parent.parent.y, parent.x - parent.parent.x)
      : 0.35; // root fans right and slightly down

    const spread = Math.min(Math.PI * 0.85, 0.34 * (kids.length - 1) + 0.55);
    const reach = Math.max(120, Math.min(w, h) * (parent.depth === 0 ? 0.3 : 0.26));

    kids.forEach((kid, i) => {
      if (kid.pinned) return;
      const t = kids.length === 1 ? 0.5 : i / (kids.length - 1);
      const angle = base - spread / 2 + spread * t;
      kid.x = parent.x + Math.cos(angle) * reach;
      kid.y = parent.y + Math.sin(angle) * reach;
      clampPosition(kid);
    });

    relax();
  }

  /** A few passes of pushing overlapping nodes apart. Not physics —
      just enough to stop labels landing on top of each other. */
  function relax() {
    const live = allNodes.filter((n) => n.el);
    const minGap = 92;
    for (let pass = 0; pass < 12; pass++) {
      let moved = false;
      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i];
          const b = live[j];
          if (a.pinned && b.pinned) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          if (dist >= minGap) continue;
          const push = (minGap - dist) / 2;
          const ux = (dx / dist) * push;
          const uy = (dy / dist) * push;
          if (!a.pinned) { a.x -= ux; a.y -= uy; clampPosition(a); }
          if (!b.pinned) { b.x += ux; b.y += uy; clampPosition(b); }
          moved = true;
        }
      }
      if (!moved) break;
    }
  }

  // ---------- Painting ----------

  function applyPosition(node) {
    node.el.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) translate(-50%, -50%)`;
  }

  /** Edge endpoints are read from where the nodes actually are on
      screen this frame, not from their target coordinates — that way
      the lines stay attached mid-animation and mid-drag. */
  function centreOf(node) {
    const r = node.el.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();
    return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 };
  }

  /** Where a line leaving `centre` in direction (dx, dy) crosses the
      edge of that node's box. Lines are drawn between these points
      rather than between centres, so a connector never runs through
      the word it is pointing at. */
  function exitPoint(centre, box, dx, dy, pad) {
    const hw = box.width / 2 + pad;
    const hh = box.height / 2 + pad;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax < 0.001 && ay < 0.001) return centre;
    const t = Math.min(ax ? hw / ax : Infinity, ay ? hh / ay : Infinity);
    return { x: centre.x + dx * t, y: centre.y + dy * t };
  }

  function drawEdges() {
    edges.forEach((edge) => {
      if (!edge.parent.el || !edge.child.el) return;
      const pb = edge.parent.el.getBoundingClientRect();
      const cb = edge.child.el.getBoundingClientRect();
      const a = centreOf(edge.parent);
      const b = centreOf(edge.child);
      const dx = b.x - a.x;
      const dy = b.y - a.y;

      const from = exitPoint(a, pb, dx, dy, 6);
      const to = exitPoint(b, cb, -dx, -dy, 6);

      // If the two labels are close enough that the trimmed line would
      // double back on itself, draw nothing rather than a stray mark.
      const overlap = (to.x - from.x) * dx + (to.y - from.y) * dy <= 0;
      edge.line.style.display = overlap ? 'none' : '';
      if (overlap) return;

      edge.line.setAttribute('x1', from.x);
      edge.line.setAttribute('y1', from.y);
      edge.line.setAttribute('x2', to.x);
      edge.line.setAttribute('y2', to.y);
    });
  }

  let rafId = null;
  let syncUntil = 0;
  function requestSync(durationMs) {
    syncUntil = Math.max(syncUntil, performance.now() + (durationMs || 0));
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }
  function tick(now) {
    drawEdges();
    if (dragging || now < syncUntil) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  // ---------- Node elements ----------

  function createElement(node) {
    const el = document.createElement('div');
    el.className = `node node--d${Math.min(node.depth, 3)}`;
    el.dataset.uid = node.uid;

    const isBranch = node.childSpecs.length > 0;
    const hit = document.createElement(isBranch ? 'button' : 'a');
    hit.className = 'node__hit';

    if (isBranch) {
      hit.type = 'button';
      hit.setAttribute('aria-expanded', 'false');
    } else if (node.href) {
      hit.href = node.href;
      hit.draggable = false;
      if (node.navKey) hit.dataset.nav = node.navKey;
    }

    const label = document.createElement('span');
    label.className = 'node__label';
    label.textContent = node.label;
    hit.appendChild(label);

    if (node.count !== null) {
      const count = document.createElement('span');
      count.className = 'node__count';
      count.textContent = node.count;
      hit.appendChild(count);
    }

    if (isBranch) {
      const glyph = document.createElement('span');
      glyph.className = 'node__glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = '+';
      hit.appendChild(glyph);
    }

    el.appendChild(hit);
    node.el = el;
    node.hit = hit;

    if (isBranch) {
      hit.addEventListener('click', (event) => {
        if (consumeDragClick(event)) return;
        toggle(node);
      });
    } else {
      hit.addEventListener('click', (event) => { consumeDragClick(event); });
    }

    el.addEventListener('pointerdown', (event) => onPointerDown(event, node));
    layer.appendChild(el);
    applyPosition(node);
    return el;
  }

  function createEdge(parent, child) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('class', 'canvas__edge');
    svg.appendChild(line);
    const edge = { parent, child, line };
    edges.push(edge);
    return edge;
  }

  function removeNodeElement(node) {
    for (let i = edges.length - 1; i >= 0; i--) {
      if (edges[i].child === node || edges[i].parent === node) {
        edges[i].line.remove();
        edges.splice(i, 1);
      }
    }
    if (node.el) {
      node.el.remove();
      node.el = null;
      node.hit = null;
    }
  }

  // ---------- Expand / collapse ----------

  function toggle(node) {
    if (node.expanded) collapse(node);
    else expand(node);
  }

  function expand(node) {
    if (node.expanded || !node.childSpecs.length) return;
    node.expanded = true;
    node.hit.setAttribute('aria-expanded', 'true');
    node.el.querySelector('.node__glyph').textContent = '−';

    if (!node.children.length) {
      node.children = node.childSpecs.map((spec) => specToTree(spec, node));
    }

    const still = reduceMotion();

    node.children.forEach((kid) => {
      // Start life at the parent: children grow out of where they
      // came from rather than materialising in open space. Set the
      // position before the element exists so the browser never
      // paints them at 0,0 first.
      kid.x = node.x;
      kid.y = node.y;
      createElement(kid);
      createEdge(node, kid);
      kid.el.classList.add('is-entering');
    });

    layoutChildren(node);

    // Flush the starting position before the transition is allowed on.
    void layer.offsetHeight;

    node.children.forEach((kid, i) => {
      kid.el.style.transitionDelay = still ? '0ms' : `${i * STAGGER_MS}ms`;
      kid.el.classList.remove('is-entering');
      applyPosition(kid);
    });

    // Nodes already on screen may have been nudged by relax().
    allNodes.forEach((n) => { if (n.el && !node.children.includes(n)) applyPosition(n); });

    requestSync(ENTER_MS + node.children.length * STAGGER_MS + 80);
  }

  function collapse(node) {
    if (!node.expanded) return;
    node.expanded = false;
    node.hit.setAttribute('aria-expanded', 'false');
    node.el.querySelector('.node__glyph').textContent = '+';

    const doomed = [];
    (function gather(n) {
      n.children.forEach((kid) => {
        gather(kid);
        doomed.push(kid);
      });
      if (n !== node) {
        n.expanded = false;
        if (n.hit) {
          n.hit.setAttribute('aria-expanded', 'false');
          const glyph = n.el && n.el.querySelector('.node__glyph');
          if (glyph) glyph.textContent = '+';
        }
      }
    })(node);

    doomed.forEach((kid) => {
      if (!kid.el) return;
      kid.pinned = false;
      kid.el.classList.add('is-leaving');
      // Retreat into the parent that spawned them.
      const home = kid.parent;
      kid.el.style.transform =
        `translate3d(${home.x}px, ${home.y}px, 0) translate(-50%, -50%)`;
    });

    const finish = () => doomed.forEach(removeNodeElement);
    if (reduceMotion()) finish();
    else window.setTimeout(finish, EXIT_MS);

    requestSync(EXIT_MS + 60);
  }

  // ---------- Dragging ----------

  /* The move/up listeners go on the window rather than on the node,
     and nothing calls setPointerCapture. Capturing the pointer would
     retarget the press, so the browser would fire the click on the
     node wrapper instead of the link or button inside it — which
     silently breaks every click on the tree. Window listeners give
     the same "keep dragging even when the pointer outruns the
     element" behaviour with native click semantics intact. */
  function onPointerDown(event, node) {
    if (dragging) return;                       // ignore extra fingers
    if (event.button !== undefined && event.button > 0) return;

    dragging = {
      node,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: node.x,
      originY: node.y,
      moved: false,
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const dx = event.clientX - dragging.startX;
    const dy = event.clientY - dragging.startY;

    if (!dragging.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      dragging.moved = true;
      dragging.node.el.classList.add('is-dragging');
      canvas.classList.add('is-dragging');
      requestSync(0);
    }

    const node = dragging.node;
    node.x = dragging.originX + dx;
    node.y = dragging.originY + dy;
    node.pinned = true;
    clampPosition(node);
    applyPosition(node);
  }

  function onPointerUp(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const { node, moved } = dragging;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    node.el.classList.remove('is-dragging');
    canvas.classList.remove('is-dragging');
    dragging = null;

    // A drag that ends on the node would otherwise fire a click and
    // navigate. One press is either a move or an open, never both.
    suppressClick = moved;
    if (moved) window.setTimeout(() => { suppressClick = false; }, 0);
    requestSync(120);
  }

  function consumeDragClick(event) {
    if (!suppressClick) return false;
    event.preventDefault();
    suppressClick = false;
    return true;
  }

  // ---------- Resize ----------

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      // Anything the visitor placed by hand stays where they put it;
      // everything else re-flows to the new canvas.
      if (!root.pinned) placeRoot();
      (function relayout(n) {
        if (n.expanded) { layoutChildren(n); n.children.forEach(relayout); }
      })(root);
      allNodes.forEach((n) => { if (n.el) { clampPosition(n); applyPosition(n); } });
      requestSync(120);
    }, 120);
  });

  // ---------- Start ----------

  (async () => {
    await buildData();
    canvas.classList.add('is-ready');
    placeRoot();
    createElement(root);
    // Open one level immediately: a single word on a blank page
    // doesn't read as a menu.
    expand(root);
    requestSync(600);
  })();
})();

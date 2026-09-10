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

  /* Small portrait shown beside the root node. Put a file in /assets
     and name it here; leave src empty and the root stays type-only.
     Videos work too — { type: 'video', src: 'assets/reel.mp4' } — and
     play on hover rather than autoplaying. */
  const ROOT_MEDIA = { type: 'image', src: '', alt: '' };

  /* The statement under the root's name. It is copy, so it lives here
     where it can be edited without reading the layout code. */
  const ROOT_CAPTION =
    'Vietnamese indie filmmaker and designer visualizing stories of ' +
    'cultures, brands, and most importantly, humans.';

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
  function makeNode({ label, alias, href, media, caption, children, navKey }) {
    const node = {
      uid: `n${nextId++}`,
      label,
      alias: alias || null,
      href: href || null,
      media: media && media.src ? media : null,
      caption: caption || null,
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
      children: works
        .filter((w) => w.type === type)
        // A project shows a still or clip beside its title as soon as
        // one exists: "thumb" if the entry names one, otherwise its
        // first media item. No media, no frame — the node is just type.
        .map((w) => ({
          label: w.title,
          href: workHref(w),
          media: w.thumb || (w.media && w.media[0]),
        })),
    }));

    /* Film / Design / Photography sit directly under the root: the
       "Works" node in between was a level that only ever held other
       nodes, so it cost a click and said nothing. "All works" keeps
       works.html — the filterable grid — reachable from the canvas. */
    root = specToTree({
      label: 'Lê Vũ Xuân Anh',
      alias: 'Frank Le',
      media: ROOT_MEDIA,
      caption: ROOT_CAPTION,
      children: [
        { label: 'About', href: 'about.html', navKey: 'about' },
        ...typeSpecs,
        ...(works.length ? [{ label: 'All works', href: 'works.html', navKey: 'works' }] : []),
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
  function pads() {
    const { w, h } = bounds();
    return { w, h, padX: Math.min(140, w * 0.12), padY: Math.min(90, h * 0.12) };
  }

  function clampPosition(node) {
    const { w, h, padX, padY } = pads();

    /* Clamp the node's BOX inside the margins, not its centre point.
       A node is drawn centred on its coordinates, so clamping the
       centre let a 230px-wide project title hang half off the right
       edge on a phone. A node too wide to fit between the margins
       gets centred instead of pushed off one side. */
    const r = node.el ? node.el.getBoundingClientRect() : null;
    const hw = r ? r.width / 2 : 0;
    const hh = r ? r.height / 2 : 0;

    const minX = Math.min(padX + hw, w / 2);
    const maxX = Math.max(w - padX - hw, w / 2);
    const minY = Math.min(padY + hh, h / 2);
    const maxY = Math.max(h - padY - hh, h / 2);

    node.x = Math.max(minX, Math.min(maxX, node.x));
    node.y = Math.max(minY, Math.min(maxY, node.y));
  }

  function onPaper(x, y) {
    const { w, h, padX, padY } = pads();
    return x >= padX && x <= w - padX && y >= padY && y <= h - padY;
  }

  /** The root's home, and where it returns on any resize: hard left,
      vertically centred, its left edge sitting on the canvas margin.
      Nodes are drawn centred on their coordinates, so "left edge on
      the margin" means offsetting by half the node's own width —
      measured rather than assumed, because the caption and the
      portrait slot both change how wide the root is. */
  function placeRoot() {
    const { w, h, padX } = pads();
    const half = root.el ? root.el.getBoundingClientRect().width / 2 : 0;
    root.x = Math.min(padX + half, w * 0.5);
    root.y = h * 0.5;
    clampPosition(root);
  }

  /** How far a node's own box reaches in a given direction. */
  function extentAlong(el, angle) {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.abs(Math.cos(angle)) * (r.width / 2)
      + Math.abs(Math.sin(angle)) * (r.height / 2);
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

    /* Longer branches and a wider fan than the tree started with. The
       labels are words, not dots — "PLACEHOLDER — Identity / Brand
       System" is 330px wide — so siblings an old-style 120px apart
       read as a tangle no matter how the separation pass shuffles
       them afterwards. Distance between levels is what makes a
       diagram legible. */
    const spread = Math.min(Math.PI * 0.9, 0.4 * (kids.length - 1) + 0.6)
      // Deeper levels fan tighter. The root wants a wide sweep, but two
      // neighbouring branches each opening a wide cone throws their
      // children into the same band of the page, and the lines cross
      // over each other. Narrow cones keep a branch's children reading
      // as that branch's children.
      * (parent.depth === 0 ? 1 : 0.55);
    const reach = Math.max(150, Math.min(w, h) * (parent.depth === 0 ? 0.34 : 0.32));

    kids.forEach((kid, i) => {
      if (kid.pinned) return;
      const t = kids.length === 1 ? 0.5 : i / (kids.length - 1);
      const angle = base - spread / 2 + spread * t;
      /* Long enough to clear both boxes, not just to satisfy the
         nominal reach. Measuring from centre to centre means a wide
         parent — the root, carrying its caption, is the widest box on
         the canvas — would otherwise start its branch inside itself. */
      const clearance = extentAlong(parent.el, angle) + extentAlong(kid.el, angle) + 56;
      const radius = Math.max(reach, clearance);
      let x = parent.x + Math.cos(angle) * radius;
      let y = parent.y + Math.sin(angle) * radius;

      /* A child aimed off the paper gets its angle mirrored back
         across the horizontal instead of being flattened against the
         edge by the clamp. A node pressed into the ceiling sits too
         close to its parent to keep a connector, so it reads as
         floating loose rather than as part of the tree. */
      if (!onPaper(x, y)) {
        const mx = parent.x + Math.cos(-angle) * radius;
        const my = parent.y + Math.sin(-angle) * radius;
        if (onPaper(mx, my)) { x = mx; y = my; }
      }

      kid.x = x;
      kid.y = y;
      clampPosition(kid);
    });

    relax();
  }

  /** A few passes of pushing overlapping nodes apart. Not physics —
      just enough to stop nodes landing on top of each other. Sizes are
      measured rather than assumed: a long title is a wide node, and a
      node with a picture in it is a box, not a word. */
  /** The corner marks — name, bio, role, email — are page furniture
      rather than tree, but a node landing on top of the bio reads as
      a bug. They join the separation pass as obstacles that push and
      are never pushed. A node the visitor has dragged is left alone;
      putting one wherever they like is the point. */
  function markObstacles() {
    const marks = document.querySelectorAll('.canvas__marks .mark');
    if (!marks.length) return [];
    const c = canvas.getBoundingClientRect();
    const out = [];
    marks.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return; // hidden at this breakpoint
      out.push({
        node: null,
        pinned: true,
        x: r.left - c.left + r.width / 2,
        y: r.top - c.top + r.height / 2,
        hw: r.width / 2 + 14,
        hh: r.height / 2 + 12,
      });
    });
    return out;
  }

  function relax() {
    const live = allNodes.filter((n) => n.el);
    const items = live.map((n) => {
      const r = n.el.getBoundingClientRect();
      // The root is an anchor: it holds its home position and the rest
      // of the tree arranges itself around it.
      /* Padding is deliberately lopsided. These boxes are wide and
         short, so they mostly end up stacked vertically, and it is
         the vertical gap that reads as air between nodes — 10px of
         it left them looking like lines of a paragraph. */
      return {
        node: n,
        pinned: n.pinned || n === root,
        hw: r.width / 2 + 18,
        hh: r.height / 2 + 26,
      };
    }).concat(markObstacles());

    // Real nodes keep their coordinates on the node itself; obstacles
    // carry their own. Either way the box has .x/.y.
    const at = (item) => item.node || item;

    for (let pass = 0; pass < 12; pass++) {
      let moved = false;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          if (a.pinned && b.pinned) continue;

          const pa = at(a);
          const pb = at(b);
          const dx = pb.x - pa.x;
          const dy = pb.y - pa.y;
          // How far the two boxes overlap on each axis.
          const gapX = a.hw + b.hw - Math.abs(dx);
          const gapY = a.hh + b.hh - Math.abs(dy);
          if (gapX <= 0 || gapY <= 0) continue;

          // Separate along whichever axis needs the smaller shove.
          let ux = 0;
          let uy = 0;
          if (gapX < gapY) ux = (dx >= 0 ? 1 : -1) * gapX / 2;
          else uy = (dy >= 0 ? 1 : -1) * gapY / 2;

          // One side being fixed means the other takes the whole move.
          const share = (a.pinned || b.pinned) ? 2 : 1;
          if (!a.pinned) { pa.x -= ux * share; pa.y -= uy * share; clampPosition(pa); }
          if (!b.pinned) { pb.x += ux * share; pb.y += uy * share; clampPosition(pb); }
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

    if (node.media) {
      hit.classList.add('node__hit--media');
      hit.appendChild(mediaFrame(node.media, hit));
    }

    /* Name, alias and glyph share one row, and that row is a single
       child of the hit. It has to be wrapped: the hit is a column now
       (media above, naming below), so without this the glyph would
       stack under the label instead of sitting beside it. */
    const line = document.createElement('span');
    line.className = 'node__line';

    const label = document.createElement('span');
    label.className = 'node__label';
    label.textContent = node.label;
    line.appendChild(label);

    if (node.alias) {
      const alias = document.createElement('span');
      alias.className = 'node__alias';
      alias.textContent = node.alias;
      line.appendChild(alias);
    }

    if (isBranch) {
      const glyph = document.createElement('span');
      glyph.className = 'node__glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = '+';
      line.appendChild(glyph);
    }

    hit.appendChild(line);

    el.appendChild(hit);

    // Not part of the hit target: a caption describes the node, it
    // isn't a second thing to click.
    if (node.caption) {
      const caption = document.createElement('span');
      caption.className = 'node__caption';
      caption.textContent = node.caption;
      el.appendChild(caption);
    }

    // Everything the node contains moves together on its own drift
    // layer, which sits between the position transform on .node and
    // the press transform on .node__hit — no two transforms ever land
    // on the same element. See "Ambient drift" in css/style.css.
    const drift = document.createElement('span');
    drift.className = 'node__drift';
    while (el.firstChild) drift.appendChild(el.firstChild);
    el.appendChild(drift);

    node.el = el;
    node.hit = hit;
    node.drift = drift;

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

  /** The still or clip that sits beside a node's title. Images are
      decorative here — the node's own text already names the thing —
      so they carry an empty alt. Video plays on hover/focus only: a
      canvas of autoplaying clips is a lot of moving parts for a menu,
      and on touch the poster frame stands in. */
  function mediaFrame(media, hit) {
    const frame = document.createElement('span');
    frame.className = 'node__media';

    if (media.type === 'video') {
      const video = document.createElement('video');
      /* Two sources, not one. WebM/VP9 is smaller and is what most
         browsers will take; the H.264 MP4 is the universal fallback
         and is what Safari older than 14.1 needs. Order matters —
         the browser takes the first it can decode. */
      if (media.webm) {
        const webm = document.createElement('source');
        webm.src = media.webm;
        webm.type = 'video/webm';
        video.appendChild(webm);
        const mp4 = document.createElement('source');
        mp4.src = media.src;
        mp4.type = 'video/mp4';
        video.appendChild(mp4);
      } else {
        video.src = media.src;
      }
      video.muted = true;          // required, or no browser will autoplay
      video.loop = true;
      video.playsInline = true;    // or iOS takes it fullscreen
      if (media.poster) video.poster = media.poster;
      frame.appendChild(video);

      const play = () => { const p = video.play(); if (p) p.catch(() => {}); };

      /* A clip on a node runs continuously — the canvas should show
         the work moving, not wait to be asked. Under reduced motion it
         holds on its poster instead and plays only on hover or focus,
         so it stays reachable without putting looping motion on the
         page for someone who asked for less of it. */
      if (reduceMotion()) {
        video.preload = 'metadata';
        const stop = () => video.pause();
        hit.addEventListener('pointerenter', play);
        hit.addEventListener('pointerleave', stop);
        hit.addEventListener('focus', play);
        hit.addEventListener('blur', stop);
      } else {
        video.autoplay = true;
        video.preload = 'auto';
        play();
      }
    } else {
      const img = document.createElement('img');
      img.src = media.src;
      img.alt = '';
      img.loading = 'lazy';
      img.draggable = false; // or the browser drags the picture, not the node
      frame.appendChild(img);
    }

    return frame;
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

    if (window.driftAll) window.driftAll(layer.querySelectorAll('.node__drift'));
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

    /* The element comes first so placeRoot can measure it, and the
       transition is held off for that one placement — otherwise the
       root visibly slides in from the top-left corner on load. */
    createElement(root);
    root.el.style.transition = 'none';
    placeRoot();
    applyPosition(root);
    void root.el.offsetHeight;
    root.el.style.transition = '';

    /* The tree loads closed (Frank's call, Sept 8 2026): the root
       alone on the paper with its "+" inviting the first click. The
       corner hint carries the instruction, so the page doesn't have
       to prove it is a menu by opening itself. */
    if (window.driftAll) window.driftAll(layer.querySelectorAll('.node__drift'));
    requestSync(600);
  })();
})();

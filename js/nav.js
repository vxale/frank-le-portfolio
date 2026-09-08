/* Navigation: two display modes the visitor chooses between.
   - "list" — the classic inline links that live in the HTML.
   - "tree" — a literal branching node diagram (docs/sitemap.md's
     long-standing concept), opened as a full-page panel.
   The choice is remembered in localStorage. Everything in here is an
   enhancement: with JS off, the HTML links are the navigation. */

(() => {
  const STORAGE_KEY = 'nav-mode';
  const nav = document.querySelector('.site-nav');
  const host = document.querySelector('.site-nav__right');
  if (!nav || !host) return;

  let mode = readMode();
  let panel = null;
  let treeBuilt = false;
  let lastFocused = null;

  function readMode() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'tree' ? 'tree' : 'list';
    } catch (err) {
      return 'list';
    }
  }

  function writeMode(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (err) { /* private mode — fine */ }
  }

  // ---------- Nav controls ----------

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nav-tree-open';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'site-tree');
  trigger.innerHTML = '<span class="nav-tree-open__glyph" aria-hidden="true">&#9662;</span> Site tree';
  trigger.addEventListener('click', () => openPanel());

  const toggle = document.createElement('div');
  toggle.className = 'nav-mode';
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Menu display');
  toggle.innerHTML = `
    <span class="nav-mode__label">Menu</span>
    <button class="nav-mode__btn" type="button" data-mode="list">List</button>
    <button class="nav-mode__btn" type="button" data-mode="tree">Tree</button>
  `;

  host.append(trigger, toggle);

  toggle.querySelectorAll('.nav-mode__btn').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode, true));
  });

  function setMode(next, fromClick) {
    mode = next === 'tree' ? 'tree' : 'list';
    writeMode(mode);
    document.documentElement.dataset.navMode = mode;
    toggle.querySelectorAll('.nav-mode__btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
    });
    // Picking "Tree" shows what was picked; picking "List" puts the
    // links back and gets out of the way.
    if (!fromClick) return;
    if (mode === 'tree') openPanel();
    else closePanel();
  }

  setMode(mode, false);

  // ---------- Panel ----------

  async function openPanel() {
    if (!panel) buildPanel();
    lastFocused = document.activeElement;
    panel.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const first = panel.querySelector('.tree-panel__close');
    if (first) first.focus();
    // Built after the panel is up, not before: waiting on the fetch
    // first makes the trigger look dead on a slow connection.
    if (!treeBuilt) await buildTree();
  }

  function closePanel() {
    if (!panel || !panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Focus must land somewhere real before the panel goes hidden —
    // otherwise it's left on an invisible node inside it.
    const back = lastFocused && document.contains(lastFocused) && lastFocused !== document.body
      ? lastFocused
      : (mode === 'tree' ? trigger : nav.querySelector('.nav-mode__btn[data-mode="list"]'));
    if (back) back.focus();
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'tree-panel';
    panel.id = 'site-tree';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Site tree');
    panel.innerHTML = `
      <div class="tree-panel__head">
        <span class="label">Node tree</span>
        <button class="tree-panel__close" type="button">Close</button>
      </div>
      <a class="tree__root" href="index.html">Frank Le</a>
      <ul class="tree__list tree__children"></ul>
    `;
    panel.querySelector('.tree-panel__close').addEventListener('click', closePanel);
    panel.addEventListener('keydown', onPanelKeydown);
    document.body.appendChild(panel);
  }

  /** Escape closes; Tab cycles inside the panel rather than wandering
      into the page behind it. */
  function onPanelKeydown(event) {
    if (event.key === 'Escape') { closePanel(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll('a[href], button:not([disabled])')]
      .filter((el) => !el.closest('[inert]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // ---------- Tree ----------

  const current = document.body.dataset.navCurrent;

  /** Opens or closes one branch. Pass animate: false to set the state
      without running the height transition — used for the branch that
      starts open, which the visitor never asked to see move. */
  function setBranchOpen(li, btn, branch, open, animate) {
    if (animate === false) branch.style.transition = 'none';
    li.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${btn.dataset.label}`);
    btn.textContent = open ? '\u2212' : '+';
    // Collapsed content must not stay in the tab order.
    branch.inert = !open;
    if (animate === false) {
      void branch.offsetHeight; // flush before transitions come back
      branch.style.transition = '';
    }
  }

  /** One node: a link, an optional count, and an optional branch of
      children that expands in place. */
  function node({ label, href, navKey, count, leaf, children }) {
    const li = document.createElement('li');
    const row = document.createElement('div');
    row.className = 'tree__row';

    const link = document.createElement('a');
    link.className = 'tree__node' + (leaf ? ' tree__node--leaf' : '');
    link.href = href;
    link.textContent = label;
    if (navKey && navKey === current) link.setAttribute('aria-current', 'page');
    row.appendChild(link);

    if (count !== undefined) {
      const tag = document.createElement('span');
      tag.className = 'tree__count';
      tag.textContent = `(${count})`;
      row.appendChild(tag);
    }

    li.appendChild(row);

    if (children && children.length) {
      const branch = document.createElement('div');
      branch.className = 'tree__branch';
      const clip = document.createElement('div');
      const list = document.createElement('ul');
      list.className = 'tree__children';
      children.forEach((child) => list.appendChild(node(child)));
      clip.appendChild(list);
      branch.appendChild(clip);
      li.appendChild(branch);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tree__toggle';
      btn.dataset.label = label;
      setBranchOpen(li, btn, branch, false, false);
      btn.addEventListener('click', () => {
        setBranchOpen(li, btn, branch, !li.classList.contains('is-open'), true);
      });
      row.appendChild(btn);
    }

    return li;
  }

  async function buildTree() {
    const list = panel.querySelector('.tree__list');
    let works = [];
    try {
      works = await fetchWorks();
    } catch (err) {
      // The page branches still work without project data.
      works = [];
    }

    const types = [...new Set(works.map((w) => w.type))];
    const typeNodes = types.map((type) => ({
      label: typeLabel(type),
      href: `works.html?type=${encodeURIComponent(type)}`,
      count: works.filter((w) => w.type === type).length,
      children: works
        .filter((w) => w.type === type)
        .map((w) => ({
          label: w.title,
          href: `work.html?id=${encodeURIComponent(w.id)}`,
          leaf: true,
        })),
    }));

    const tree = [
      { label: 'About', href: 'about.html', navKey: 'about' },
      {
        label: 'Works',
        href: 'works.html',
        navKey: 'works',
        count: works.length,
        children: typeNodes,
      },
      { label: 'Contact', href: 'contact.html', navKey: 'contact' },
    ];

    tree.forEach((item) => list.appendChild(node(item)));

    // Works starts open — the tree should show something branching the
    // moment it appears, rather than three closed labels.
    const worksLi = list.children[1];
    const worksToggle = worksLi && worksLi.querySelector('.tree__toggle');
    const worksBranch = worksLi && worksLi.querySelector('.tree__branch');
    if (worksToggle && worksBranch) setBranchOpen(worksLi, worksToggle, worksBranch, true, false);

    treeBuilt = true;
  }
})();

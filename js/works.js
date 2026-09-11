document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.querySelector('.works-grid');
  const filterBar = document.querySelector('.filters');
  if (!grid) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  let works = [];
  // ?type=film etc. lets the node-tree branches land on a filtered grid.
  const requestedType = new URLSearchParams(window.location.search).get('type');
  const active = { type: requestedType || 'all', year: 'all', commercial: 'all' };

  /* Newest first to begin with - that is what a portfolio is for. The
     button flips it, and says which way round it is with an arrow
     rather than a word: the glyph is the whole control, so the
     direction has to be readable at a glance and in one character. */
  let order = 'desc';

  const SORT_GLYPH =
    '<svg viewBox="0 0 12 15" fill="none" stroke="currentColor" ' +
    'stroke-width="1.1" stroke-linecap="square" focusable="false">' +
    '<path d="M6 1.5V13"/><path d="M2 9.5 6 13.5 10 9.5"/></svg>';

  function orderLabel() {
    return order === 'desc'
      ? 'Sort by year: newest first'
      : 'Sort by year: oldest first';
  }

  function render() {
    const filtered = works.filter((w) => {
      if (active.type !== 'all' && w.type !== active.type) return false;
      if (active.year !== 'all' && String(w.year) !== active.year) return false;
      if (active.commercial !== 'all') {
        const wantCommercial = active.commercial === 'commercial';
        if (Boolean(w.commercial) !== wantCommercial) return false;
      }
      return true;
    });

    if (!filtered.length) {
      grid.innerHTML = '<p class="works-empty">No work matches these filters yet.</p>';
      return;
    }

    /* Sorted on a copy. `works` keeps the order the file gives it,
       which is the order Frank maintains by hand, and a sort button
       should not quietly rewrite that. */
    const ordered = filtered.slice().sort((a, b) => (
      order === 'asc' ? a.year - b.year : b.year - a.year
    ));

    grid.innerHTML = ordered.map((w, i) => cardMarkup(w, i, 'work-card')).join('');

    // A fresh grid is a tidy grid: nothing has been moved yet.
    document.querySelectorAll('[data-tidy]').forEach((b) => b.classList.remove('is-shown'));

    /* Picking a card up is a fine-pointer affordance only. A drag on
       touch needs touch-action: none on the card, and the cards cover
       most of this page - the result would be a grid you cannot
       scroll past. Resizing is safe everywhere: the grip is the only
       thing that takes the press, and it is small. */
    grid.querySelectorAll('.work-card').forEach((card) => {
      if (finePointer.matches) window.makeDraggable(card);
      window.makeResizable(card.querySelector('.media-frame'));
    });

    initReveals(grid);
  }

  function buildFilterGroup(label, key, options) {
    const group = document.createElement('div');
    group.className = 'filter-group';
    group.innerHTML = `<span class="filter-group__label">${esc(label)}</span>`;
    group.appendChild(makeButton('All', key, 'all'));
    options.forEach((opt) => group.appendChild(makeButton(opt.label, key, opt.value)));

    /* Choosing settles the group: the alternatives go away without
       waiting to be dismissed. They only come back when the pointer
       leaves and returns, which is the gesture that asked for them in
       the first place. */
    group.addEventListener('pointerleave', () => group.classList.remove('is-settled'));
    return group;
  }

  /* Sort and tidy: two things you do TO the grid rather than to the
     set of work in it, so they sit apart from the filters at the end
     of the row - and, in the corner cue, on a rung of their own. */
  function buildTools() {
    const tools = document.createElement('div');
    tools.className = 'filter-group filter-tools';

    const sort = document.createElement('button');
    sort.type = 'button';
    sort.className = 'tool-btn';
    sort.dataset.sort = '';
    sort.dataset.order = order;
    sort.innerHTML = `<span class="tool-btn__glyph" aria-hidden="true">${SORT_GLYPH}</span>`;
    sort.setAttribute('aria-label', orderLabel());
    sort.addEventListener('click', () => {
      order = order === 'desc' ? 'asc' : 'desc';
      // Every sort button on the page, the same way the filters do it.
      document.querySelectorAll('[data-sort]').forEach((b) => {
        b.dataset.order = order;
        b.setAttribute('aria-label', orderLabel());
      });
      render();
    });

    const tidy = document.createElement('button');
    tidy.type = 'button';
    tidy.className = 'filter-btn tool-tidy';
    tidy.dataset.tidy = '';
    tidy.textContent = 'Tidy up';
    tidy.addEventListener('click', tidyUp);

    tools.appendChild(sort);
    tools.appendChild(tidy);
    return tools;
  }

  /* Offered only once there is something to tidy. A button that puts
     things back when nothing has been moved is a button that does
     nothing, and the corner has no room for one. */
  window.addEventListener('cards:moved', () => {
    document.querySelectorAll('[data-tidy]').forEach((b) => b.classList.add('is-shown'));
  });

  function tidyUp() {
    grid.querySelectorAll('.work-card').forEach((card) => window.sendHome(card));
    document.querySelectorAll('[data-tidy]').forEach((b) => b.classList.remove('is-shown'));
  }

  function makeButton(label, key, value) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.textContent = label;
    btn.dataset.key = key;
    btn.dataset.value = value;
    btn.setAttribute('aria-pressed', String(active[key] === value));
    btn.addEventListener('click', (event) => {
      /* detail is 0 when the button was fired from the keyboard. A
         keyboard user is still inside the group and still needs to see
         it, so only a real press settles it - and the CSS lets
         :focus-within override this anyway. */
      if (event.detail > 0) {
        const group = btn.closest('.filter-group');
        if (group) group.classList.add('is-settled');
      }

      active[key] = value;
      document.querySelectorAll(`.filter-btn[data-key="${key}"]`).forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.value === value));
      });
      render();
    });
    return btn;
  }

  /* The filter bar again, in the corner it came from, for when the
     real one has scrolled out of sight.

     It holds a second set of buttons rather than a mirror of the
     state, which is the cheaper thing by far: makeButton's handler
     writes to `active` and then re-presses every .filter-btn on the
     page carrying that key, so both sets stay in step without a line
     of code that knows the other one exists.

     It is the same component as the Navigate cue - same classes, same
     open and close behaviour out of js/navcue.js - laid out from the
     top left instead of the bottom right, because that is the corner
     the filter bar itself occupies and the direction it retreats in. */
  function buildFilterCue(groups) {
    const cue = document.createElement('nav');
    cue.className = 'navcue navcue--filter';
    cue.setAttribute('data-cue', '');
    cue.setAttribute('aria-label', 'Filter works');
    cue.innerHTML = '<button class="navcue__trigger" type="button" ' +
                    'aria-expanded="false">Filter</button>' +
                    '<ul class="navcue__list"></ul>';

    const list = cue.querySelector('.navcue__list');
    groups.forEach((g) => {
      const item = document.createElement('li');
      item.className = 'navcue__item';
      item.appendChild(buildFilterGroup(...g));
      list.appendChild(item);
    });

    const toolRung = document.createElement('li');
    toolRung.className = 'navcue__item navcue__item--tools';
    toolRung.appendChild(buildTools());
    list.appendChild(toolRung);

    document.body.appendChild(cue);
    if (window.setupCue) window.setupCue(cue);

    /* Available while the grid is what you are looking at: the real
       bar gone from the top of the screen, and the end of the page not
       yet arrived at the bottom of it.

       The first condition is the point of the thing. The second is
       because the cue stands in the lower left, which is also where
       every page signs off - and the closing marks are not something
       to hover a filter menu over. Reaching the foot of the works is
       finishing with them. */
    if (!('IntersectionObserver' in window)) return;

    const foot = document.querySelector('.end-marks');
    let barAway = false;
    let footHere = false;

    function settle() {
      const show = barAway && !footHere;
      cue.classList.toggle('is-available', show);
      if (!show) {
        cue.classList.remove('is-open');
        cue.querySelector('.navcue__trigger').setAttribute('aria-expanded', 'false');
      }
    }

    const watcher = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === filterBar) barAway = !entry.isIntersecting;
        else footHere = entry.isIntersecting;
      });
      settle();
    }, { threshold: 0 });

    watcher.observe(filterBar);
    if (foot) watcher.observe(foot);
  }

  try {
    works = await fetchWorks();

    const types = [...new Set(works.map((w) => w.type))].map((t) => ({ label: typeLabel(t), value: t }));
    const years = [...new Set(works.map((w) => String(w.year)))].sort((a, b) => b - a).map((y) => ({ label: y, value: y }));

    const groups = [
      ['Type', 'type', types],
      ['Year', 'year', years],
      ['Made for', 'commercial', [
        { label: 'Commercial', value: 'commercial' },
        { label: 'Personal', value: 'personal' },
      ]],
    ];

    groups.forEach((g) => filterBar.appendChild(buildFilterGroup(...g)));
    filterBar.appendChild(buildTools());
    buildFilterCue(groups);

    render();
  } catch (err) {
    grid.innerHTML = `<p class="works-empty">Couldn't load work (${esc(err.message)}).</p>`;
  }
});

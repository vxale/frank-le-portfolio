document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.querySelector('.works-grid');
  const filterBar = document.querySelector('.filters');
  const count = document.querySelector('.works-count');
  if (!grid) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  let works = [];
  // ?type=film etc. lets the node-tree branches land on a filtered grid.
  const requestedType = new URLSearchParams(window.location.search).get('type');
  const active = { type: requestedType || 'all', year: 'all', commercial: 'all' };

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

    if (count) {
      count.textContent = filtered.length === works.length
        ? `${works.length} project${works.length === 1 ? '' : 's'}`
        : `${filtered.length} of ${works.length} projects`;
    }

    if (!filtered.length) {
      grid.innerHTML = '<p class="works-empty">No work matches these filters yet.</p>';
      return;
    }

    grid.innerHTML = filtered.map((w, i) => cardMarkup(w, i, 'work-card')).join('');

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
    return group;
  }

  function makeButton(label, key, value) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.textContent = label;
    btn.dataset.key = key;
    btn.dataset.value = value;
    btn.setAttribute('aria-pressed', String(active[key] === value));
    btn.addEventListener('click', () => {
      active[key] = value;
      document.querySelectorAll(`.filter-btn[data-key="${key}"]`).forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.value === value));
      });
      render();
    });
    return btn;
  }

  try {
    works = await fetchWorks();

    const types = [...new Set(works.map((w) => w.type))].map((t) => ({ label: typeLabel(t), value: t }));
    const years = [...new Set(works.map((w) => String(w.year)))].sort((a, b) => b - a).map((y) => ({ label: y, value: y }));

    filterBar.appendChild(buildFilterGroup('Type', 'type', types));
    filterBar.appendChild(buildFilterGroup('Year', 'year', years));
    filterBar.appendChild(buildFilterGroup('Made for', 'commercial', [
      { label: 'Commercial', value: 'commercial' },
      { label: 'Personal', value: 'personal' },
    ]));

    render();
  } catch (err) {
    grid.innerHTML = `<p class="works-empty">Couldn't load work (${esc(err.message)}).</p>`;
  }
});

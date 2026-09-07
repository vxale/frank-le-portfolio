document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.querySelector('.works-grid');
  const filterBar = document.querySelector('.filters');
  if (!grid) return;

  let works = [];
  const active = { type: 'all', year: 'all', commercial: 'all' };

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

    grid.innerHTML = filtered.map((w) => `
      <a class="work-card" href="work.html?id=${encodeURIComponent(w.id)}">
        <div class="media-frame">${mediaFrameInner(w.media && w.media[0], w.title)}</div>
        <div class="work-card__title">${w.title}</div>
        <div class="work-card__meta">${workMetaLine(w)}</div>
      </a>
    `).join('');
  }

  function buildFilterGroup(label, key, options) {
    const group = document.createElement('div');
    group.className = 'filter-group';
    group.innerHTML = `<span class="filter-group__label">${label}</span>`;
    const allBtn = makeButton('All', key, 'all');
    group.appendChild(allBtn);
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
    filterBar.appendChild(buildFilterGroup('Commercial', 'commercial', [
      { label: 'Commercial', value: 'commercial' },
      { label: 'Personal', value: 'personal' },
    ]));

    render();
  } catch (err) {
    grid.innerHTML = `<p class="works-empty">Couldn't load work (${err.message}).</p>`;
  }
});

/* ============================================================
   Work detail — one template for every project, built as a
   scrolling canvas rather than a document.

   The order is deliberate and reverses the original template: the
   WORK LEADS. Title, a few marks, then the media at size — and the
   writing (beats, credits, tools) comes after, set smaller and
   placed loosely. Frank's call, Sept 9 2026: a recruiter should meet
   the film before they meet the paragraph about the film.

   Every frame is draggable (js/drag.js) and drifts gently on its own.
   Nothing is boxed and nothing is separated by a rule — placement and
   space do that work. Content still comes entirely from
   data/works.json; adding a project is editing that file.
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('.work-field');
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get('id');

  let works;
  try {
    works = await fetchWorks();
  } catch (err) {
    root.innerHTML = `<p class="passage passage--a">Couldn't load this project (${esc(err.message)}).</p>`;
    return;
  }

  const index = id ? works.findIndex((w) => w.id === id) : 0;
  const work = works[index];

  if (!work) {
    root.innerHTML = `
      <h1 class="work-title">Project not found</h1>
      <p class="passage passage--b">That link doesn't match anything in the work list.
        <a class="link-line" href="works.html">Browse all works</a>.</p>`;
    return;
  }

  document.title = `${work.title} — Frank Le`;

  /** A frame with no frame: the media sits on the paper directly.
      Until real assets land, an untitled tint holds the shape — it
      has no border, and it disappears the moment a src exists. */
  function shot(item, altFallback, shape) {
    const inner = (() => {
      if (item && item.src && item.type === 'video') {
        return `<video src="${esc(item.src)}" muted loop playsinline autoplay
                  aria-label="${esc(item.alt || altFallback)}"></video>`;
      }
      if (item && item.src) {
        return `<img src="${esc(item.src)}" alt="${esc(item.alt || altFallback)}" loading="lazy">`;
      }
      return `<span class="shot__empty">Add media in data/works.json</span>`;
    })();
    return `<span class="shot shot--${shape}">${inner}</span>`;
  }

  const media = (work.media && work.media.length) ? work.media : [null];
  const shapes = ['wide', 'tall', 'square'];
  const spots = ['lead', 'b', 'c', 'd'];

  const frames = media.map((item, i) => `
    <figure class="floater floater--${spots[i % spots.length]}" data-drag>
      <span class="drift">${shot(item, work.title, i === 0 ? 'wide' : shapes[i % shapes.length])}</span>
    </figure>
  `).join('');

  const marks = [
    typeLabel(work.type),
    work.year,
    work.commercial ? 'Commercial' : 'Personal',
  ].filter(Boolean);

  const facts = [
    ['Role', work.role],
    ['Tools', work.tools],
  ].filter(([, v]) => v);

  const beats = [
    ['What it is', (work.insight || {}).what],
    ['The problem', (work.insight || {}).problem],
    ['Who it’s for', (work.insight || {}).audience],
    ['How I did it', (work.insight || {}).process],
    ['The result', (work.insight || {}).result],
  ].filter(([, v]) => v);

  const credits = work.credits || [];
  const awards = work.awards || [];
  const next = works[(index + 1) % works.length];

  root.innerHTML = `
    <a class="link-line work-field__back" href="works.html">&larr; All works</a>

    <h1 class="work-title">${esc(work.title)}</h1>
    <p class="work-marks">${marks.map((m) => `<span class="label">${esc(m)}</span>`).join('')}</p>

    ${frames}

    ${facts.length ? `
      <ul class="notes notes--work">
        ${facts.map(([k, v]) => `<li><span class="label">${esc(k)}</span> ${esc(v)}</li>`).join('')}
      </ul>` : ''}

    ${beats.length ? `
      <div class="beats">
        ${beats.map(([k, v]) => `
          <div class="beat" data-reveal>
            <span class="label">${esc(k)}</span>
            <p>${esc(v)}</p>
          </div>`).join('')}
      </div>` : ''}

    ${credits.length ? `
      <ul class="notes notes--credits">
        ${credits.map((c) => `<li><span class="label">${esc(c.role)}</span> ${esc(c.name)}</li>`).join('')}
      </ul>` : ''}

    <ul class="notes notes--awards">
      <li><span class="label">Awards &amp; screenings</span> ${
        awards.length ? awards.map(esc).join(' · ') : 'None listed yet'
      }</li>
    </ul>

    ${next && next.id !== work.id ? `
      <a class="next-node" href="work.html?id=${encodeURIComponent(next.id)}">
        <span class="label">Next project</span>
        <span class="next-node__title">${esc(next.title)}</span>
        <span class="label">${esc(workMetaLine(next))}</span>
      </a>` : ''}

    <p class="end-marks__inline label">
      <a href="mailto:frank.lvxa@gmail.com">frank.lvxa@gmail.com</a> ·
      <a href="https://www.linkedin.com/in/frank-lvxa/" target="_blank" rel="noopener">LinkedIn</a> ·
      &copy; 2026 Lê Vũ Xuân Anh
    </p>
  `;

  // Built after render, since none of this markup existed at load.
  root.querySelectorAll('[data-drag]').forEach((el) => window.makeDraggable(el));
  window.driftAll(root.querySelectorAll('.drift'));
  initReveals(root);
});

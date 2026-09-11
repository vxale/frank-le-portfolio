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

  /* No media, no frames. The template used to draw one empty tint so
     a placeholder project still had a shape; a real project with its
     assets deliberately withheld should just be a page of writing. */
  const media = (work.media && work.media.length) ? work.media : [];
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
  /* Two columns, so five rows is ten entries. Past that the list
     folds by default and the button offers the rest. The threshold is
     rows rather than entries because that is what actually costs the
     page its height. */
  const foldCredits = Math.ceil(credits.length / 2) > 5;
  /* Shown only when there is something to show. It used to print
     "None listed yet" on every project, which is a page telling you
     what it hasn't got. The slot is still here and still reads
     data/works.json, so the first award to be added brings it back
     without anyone touching this file. */
  const awards = work.awards || [];
  const next = works[(index + 1) % works.length];

  root.innerHTML = `
    <h1 class="work-title">${esc(work.title)}</h1>
    <p class="work-marks">${marks.map((m) => `<span class="label">${esc(m)}</span>`).join('')}</p>

    ${frames}

    ${facts.length ? `
      <ul class="notes notes--work">
        ${facts.map(([k, v]) => `<li><span class="label">${esc(k)}</span> ${esc(v)}</li>`).join('')}
      </ul>` : ''}

    ${beats.length ? `
      <div class="beats">
        ${beats.map(([k, v], i) => {
          const n = String(i + 1).padStart(2, '0');
          return `
          <div class="beat">
            <button class="beat__num" type="button"
                    aria-expanded="true" aria-controls="beat-${i}"
                    data-beat="${esc(k)}" aria-label="Hide: ${esc(k)}">${n}</button>
            <div class="beat__body" id="beat-${i}"><p>${esc(v)}</p></div>
          </div>`;
        }).join('')}
      </div>` : ''}

    ${credits.length ? `
      <div class="credits">
        <ul class="notes notes--credits${foldCredits ? ' is-folded' : ''}" id="credit-list">
          ${credits.map((c) => `<li><span class="label">${esc(c.role)}</span> ${esc(c.name)}</li>`).join('')}
        </ul>
        ${foldCredits ? `
          <button class="credits__more" type="button" aria-expanded="false"
                  aria-controls="credit-list"
                  aria-label="Show all ${credits.length} credits">
            <span class="credits__glyph" aria-hidden="true">+</span>
            <span class="label">${credits.length} credits</span>
          </button>` : ''}
      </div>` : ''}

    ${awards.length ? `
      <ul class="notes notes--awards">
        <li><span class="label">Awards &amp; screenings</span> ${
          awards.map(esc).join(' · ')
        }</li>
      </ul>` : ''}

    ${next && next.id !== work.id ? `
      <a class="next-node" href="work.html?id=${encodeURIComponent(next.id)}">
        <span class="label">Next project</span>
        <span class="next-node__title">${esc(next.title)}</span>
        <span class="label">${esc(workMetaLine(next))}</span>
      </a>` : ''}

  `;

  /* The beats read as one sequence: numbered, in order, every one of
     them open on arrival. Clicking a number FOLDS a passage away
     rather than revealing it — the interaction is for pruning, not
     for unlocking, so a recruiter who never clicks still reads the
     whole case study.

     The old headings ("What it is", "The problem") are gone from the
     page because they chopped the prose, but they survive as the
     buttons' accessible names — a screen reader still hears what each
     passage is, and data/works.json still asks Frank the five
     questions when he writes. */
  const more = root.querySelector('.credits__more');
  if (more) {
    more.addEventListener('click', () => {
      const list = root.querySelector('.notes--credits');
      const folded = list.classList.toggle('is-folded');
      more.setAttribute('aria-expanded', String(!folded));
      more.setAttribute('aria-label',
        `${folded ? 'Show all' : 'Hide the last of the'} ${credits.length} credits`);
      more.querySelector('.credits__glyph').textContent = folded ? '+' : '\u2212';
      more.querySelector('.label').textContent =
        folded ? `${credits.length} credits` : 'Fewer';
    });
  }

  root.querySelectorAll('.beat__num').forEach((btn) => {
    btn.addEventListener('click', () => {
      const beat = btn.closest('.beat');
      const closed = beat.classList.toggle('is-closed');
      const body = beat.querySelector('.beat__body');
      btn.setAttribute('aria-expanded', String(!closed));
      btn.setAttribute('aria-label', `${closed ? 'Show' : 'Hide'}: ${btn.dataset.beat}`);
      body.inert = closed;   // folded text leaves the tab order
    });
  });

  // Built after render, since none of this markup existed at load.
  root.querySelectorAll('[data-drag]').forEach((el) => window.makeDraggable(el));
  window.driftAll(root.querySelectorAll('.drift'));
  initReveals(root);
});

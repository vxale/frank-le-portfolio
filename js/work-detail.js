/* Work detail — one template for every project. Content order follows
   docs/sitemap.md: metadata → credits → awards → five-beat insight →
   full-bleed media. Blocks with no content collapse rather than
   printing an empty heading, except Awards, which keeps its slot. */
document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('.work-detail');
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get('id');

  let works;
  try {
    works = await fetchWorks();
  } catch (err) {
    root.innerHTML = `<section class="section"><div class="grid-12"><p class="works-empty">Couldn't load this project (${esc(err.message)}).</p></div></section>`;
    return;
  }

  const index = id ? works.findIndex((w) => w.id === id) : 0;
  const work = works[index];

  if (!work) {
    document.querySelector('.work-detail__title').textContent = 'Project not found';
    document.querySelector('.insight').innerHTML =
      '<p class="works-empty">That project link doesn’t match anything in data/works.json. <a href="works.html">Browse all works</a>.</p>';
    return;
  }

  document.title = `${work.title} — Frank Le`;
  document.querySelector('.work-detail__title').textContent = work.title;

  // 1. Metadata
  const meta = [
    ['Role', work.role],
    ['Year', work.year],
    ['Type', typeLabel(work.type)],
    ['Made for', work.commercial ? 'Commercial client' : 'Personal project'],
    ['Tools', work.tools],
  ].filter(([, value]) => value);

  document.querySelector('.work-detail__meta').innerHTML = meta
    .map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`)
    .join('');

  // 2 + 3. Credits and the awards slot (kept even when empty — the
  // template reserves the space, per the brief).
  const credits = work.credits || [];
  const awards = work.awards || [];

  document.querySelector('.work-detail__credits').innerHTML = `
    ${credits.length ? `
      <div class="credit-block">
        <h2>Credits</h2>
        <dl>
          ${credits.map((c) => `<dt>${esc(c.role)}</dt><dd>${esc(c.name)}</dd>`).join('')}
        </dl>
      </div>` : ''}
    <div class="credit-block${awards.length ? '' : ' credit-block--empty'}">
      <h2>Awards &amp; screenings</h2>
      ${awards.length
        ? `<ul>${awards.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`
        : '<p>None listed yet.</p>'}
    </div>
  `;

  // 4. Five-beat insight passage
  const insight = work.insight || {};
  const beats = [
    ['What it is', insight.what],
    ['The problem', insight.problem],
    ['Who it’s for', insight.audience],
    ['How I did it', insight.process],
    ['The result', insight.result],
  ].filter(([, value]) => value);

  document.querySelector('.insight').innerHTML = beats.map(([label, value]) => `
    <div class="insight__beat" data-reveal>
      <dl>
        <dt>${esc(label)}</dt>
        <dd>${esc(value)}</dd>
      </dl>
    </div>
  `).join('');

  // 5. Full-bleed media
  const media = (work.media || []);
  document.querySelector('.work-detail__media').innerHTML = (media.length ? media : [null])
    .map((m) => `<div class="media-frame" data-reveal>${mediaFrameInner(m, work.title)}</div>`)
    .join('');

  // Next project — keeps the visitor moving instead of dead-ending.
  const next = works[(index + 1) % works.length];
  if (next && next.id !== work.id) {
    document.querySelector('.work-detail__pager').innerHTML = `
      <a class="pager" href="work.html?id=${encodeURIComponent(next.id)}">
        <span class="label">Next project</span>
        <span class="pager__title">${esc(next.title)}</span>
        <span class="label">${esc(workMetaLine(next))}</span>
      </a>
    `;
  }

  initReveals();
});

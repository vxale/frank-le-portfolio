document.addEventListener('DOMContentLoaded', async () => {
  const root = document.querySelector('.work-detail');
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get('id');

  try {
    const works = await fetchWorks();
    const work = works.find((w) => w.id === id) || works[0];

    if (!work) {
      root.innerHTML = '<p class="works-empty">No work found.</p>';
      return;
    }

    document.title = `${work.title} — Frank Le`;

    document.querySelector('.work-detail__title').textContent = work.title;

    document.querySelector('.work-detail__meta').innerHTML = `
      <div><dt>Role</dt><dd>${work.role || '—'}</dd></div>
      <div><dt>Year</dt><dd>${work.year || '—'}</dd></div>
      <div><dt>Type</dt><dd>${typeLabel(work.type)}</dd></div>
      <div><dt>${work.commercial ? 'Commercial' : 'Personal'}</dt><dd></dd></div>
      ${work.tools ? `<div><dt>Tools</dt><dd>${work.tools}</dd></div>` : ''}
    `;

    const mediaWrap = document.querySelector('.work-detail__media');
    mediaWrap.innerHTML = (work.media || []).map((m) => `
      <div class="media-frame">${mediaFrameInner(m, work.title)}</div>
    `).join('') || `<div class="media-frame">${mediaFrameInner(null, work.title)}</div>`;

    const insight = work.insight || {};
    const beats = [
      ['What', insight.what],
      ['The Problem', insight.problem],
      ['Who It’s For', insight.audience],
      ['How I Did It', insight.process],
      ['The Result', insight.result],
    ].filter(([, value]) => value);

    document.querySelector('.insight').innerHTML = beats.map(([label, value]) => `
      <div class="insight__beat">
        <dl>
          <dt>${label}</dt>
          <dd>${value}</dd>
        </dl>
      </div>
    `).join('');

    const credits = work.credits || [];
    const awards = work.awards || [];
    const creditsEl = document.querySelector('.work-detail__credits');
    if (!credits.length && !awards.length) {
      creditsEl.remove();
    } else {
      creditsEl.innerHTML = `
        ${credits.map((c) => `<dt>${c.role}</dt><dd>${c.name}</dd>`).join('')}
        ${awards.length ? `<dt>Awards</dt><dd>${awards.join(', ')}</dd>` : ''}
      `;
    }
  } catch (err) {
    root.innerHTML = `<p class="works-empty">Couldn't load this project (${err.message}).</p>`;
  }
});

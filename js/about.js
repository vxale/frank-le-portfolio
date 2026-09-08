/* About page: a short "selected work" index under the bio, so the
   page still leads somewhere instead of dead-ending. */
document.addEventListener('DOMContentLoaded', async () => {
  const list = document.querySelector('.index-list');
  if (!list) return;

  const limit = Number(list.dataset.indexLimit) || 3;

  try {
    const works = await fetchWorks();
    const selected = works.filter((w) => w.featured).slice(0, limit);
    const shown = selected.length ? selected : works.slice(0, limit);
    list.innerHTML = shown.map((w, i) => indexRowMarkup(w, i)).join('');
  } catch (err) {
    list.innerHTML = `<p class="works-empty">Couldn't load work (${esc(err.message)}).</p>`;
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const track = document.querySelector('.carousel__track');
  if (!track) return;
  try {
    const works = await fetchWorks();
    const featured = works.filter((w) => w.featured);
    if (!featured.length) {
      track.innerHTML = '<p class="works-empty">No featured work yet — flag a project with "featured": true in data/works.json.</p>';
      return;
    }
    track.innerHTML = featured.map((w) => `
      <a class="carousel__item" href="work.html?id=${encodeURIComponent(w.id)}">
        <div class="media-frame">${mediaFrameInner(w.media && w.media[0], w.title)}</div>
        <div class="carousel__caption">
          ${w.title}
          <small>${workMetaLine(w)}</small>
        </div>
      </a>
    `).join('');
  } catch (err) {
    track.innerHTML = `<p class="works-empty">Couldn't load featured work (${err.message}).</p>`;
  }
});

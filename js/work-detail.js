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

  document.title = `${work.title} — Lê Vũ Xuân Anh`;

  /** A frame with no frame: the media sits on the paper directly.
      Until real assets land, an untitled tint holds the shape — it
      has no border, and it disappears the moment a src exists. */
  function shot(item, altFallback, shape) {
    /* A frame that knows its pixels takes its own proportions — Frank's
       standing rule, every imported file at its native ratio. The
       composed shapes (wide / tall / square) remain for entries that
       don't say, which today means the placeholders. */
    const native = item && item.width && item.height;
    const cls = native ? 'shot--native' : `shot--${shape}`;
    const style = native ? ` style="--ratio: ${Number(item.width)} / ${Number(item.height)}"` : '';
    const inner = (() => {
      if (item && item.src && item.type === 'video') {
        const poster = item.poster ? ` poster="${esc(item.poster)}"` : '';
        return `<video src="${esc(item.src)}"${poster} muted loop playsinline autoplay
                  aria-label="${esc(item.alt || altFallback)}"></video>`;
      }
      if (item && item.src) {
        return `<img src="${esc(item.src)}" alt="${esc(item.alt || altFallback)}" loading="lazy">`;
      }
      return `<span class="shot__empty">Add media in data/works.json</span>`;
    })();
    return `<span class="shot ${cls}"${style}>${inner}</span>`;
  }

  /* Portrait and square media at their native ratio would run the
     full width of the grid slot and end up taller than the screen —
     ~1700px for 9:16 in the lead spot, ~1000px for a square. The
     floater carries the ratio too, so CSS can cap it by HEIGHT and
     let the width follow. Landscape doesn't need it: wide media is
     never taller than its slot is wide. */
  function floaterExtra(item) {
    if (!(item && item.width && item.height && item.height >= item.width)) return '';
    return ` floater--upright" style="--ratio: ${Number(item.width)} / ${Number(item.height)}`;
  }

  /* No media, no frames. The template used to draw one empty tint so
     a placeholder project still had a shape; a real project with its
     assets deliberately withheld should just be a page of writing. */
  const media = (work.media && work.media.length) ? work.media : [];
  const shapes = ['wide', 'tall', 'square'];
  const spots = ['lead', 'b', 'c', 'd'];

  /* TikTok's own embed, the markup they publish: a blockquote the
     script at the end of this file turns into a player.

     Two edits to what their generator emits, both deliberate.

     The inline max-width/min-width moved into the stylesheet, where
     every other measurement on this site lives.

     And the fallback inside the <section> is trimmed to the account,
     the title line and the track. Theirs carries the whole caption -
     the credits again, in handle form, plus five hashtags - which is
     invisible while the script works and a wall of duplicated text
     the moment it does not. The credits on this page are the ones
     Frank wrote out, in full names, further down; they do not need a
     second, shorter, differently-spelled edition above them.

     The <script> cannot ride in this string. innerHTML does not
     execute script tags, so it is appended as a real element after
     the page is written - see loadEmbedScript below.

     Only TikTok is implemented, and that is on purpose: another host
     means another branch here, not a general-purpose field holding
     iframe HTML. Pasting arbitrary markup out of a content file is
     how a data file turns into a security problem. */
  const em = work.embed && ['tiktok', 'youtube', 'instagram'].includes(work.embed.type) && work.embed.id
    ? work.embed : null;

  /* The link under an embed is not decoration: an embed is among the
     first things strict tracking protection blocks, and the page still
     has to lead somewhere. */
  const outLink = (href, label) => `
        <figcaption>
          <a class="embed__link" href="${esc(href)}"
             target="_blank" rel="noopener">${esc(label)}<span
             class="embed__out" aria-hidden="true"><svg viewBox="0 0 12 12" fill="none"
             stroke="currentColor" stroke-width="1.1" stroke-linecap="square" focusable="false"
             ><path d="M3.5 8.5 8.5 3.5"/><path d="M5 3.5H8.5V7"/></svg></span><span
             class="visually-hidden"> (opens in a new tab)</span></a>
        </figcaption>`;

  /* YouTube: a plain iframe on the privacy-enhanced domain, built here
     from the video id. The share token (?si=) YouTube appends to its
     generated code is dropped — it identifies who shared the link,
     and does nothing for playback. 16:9 at the width of its slot; no
     radius, since the player has no rounded card to leave white ears
     around, so the site's square corners hold. */
  const youtube = em && em.type === 'youtube' ? `
    <figure class="embed embed--youtube">
      <iframe class="embed__frame" src="https://www.youtube-nocookie.com/embed/${esc(em.id)}"
              title="${esc(work.title)} — YouTube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
      ${outLink(em.url || `https://www.youtube.com/watch?v=${em.id}`, em.label || 'Watch on YouTube')}
    </figure>` : '';

  /* Instagram: their blockquote + embed.js, like TikTok. The
     generator's markup carries a fake loading skeleton in inline
     styles — gray circles and bars, their logo, a box-shadow and a
     white fill — none of which embed.js keeps: it reads the class,
     the permalink and the version, and replaces everything inside.
     So the inside is one real link, for when the script is blocked.
     The utm_source/utm_campaign the generator appends to the
     permalink are dropped; they credit the embed as a traffic source
     and do nothing for the post. */
  const instagram = em && em.type === 'instagram' ? `
    <figure class="embed embed--instagram">
      <blockquote class="instagram-media" data-instgrm-captioned
                  data-instgrm-permalink="https://www.instagram.com/p/${esc(em.id)}/"
                  data-instgrm-version="14">
        <a href="https://www.instagram.com/p/${esc(em.id)}/" target="_blank" rel="noopener">${
          em.authorName ? `A post shared by ${esc(em.authorName)}` : 'View this post on Instagram'
        }${em.author ? ` (${esc(em.author)})` : ''}</a>
      </blockquote>
      ${outLink(em.url || `https://www.instagram.com/p/${em.id}/`, em.label || 'View on Instagram')}
    </figure>` : '';

  const embed = youtube || instagram || (em ? `
    <figure class="embed">
      <blockquote class="tiktok-embed" cite="${esc(em.url || '')}"
                  data-video-id="${esc(em.id)}">
        <section>
          ${em.author ? `<a href="${esc(em.authorUrl || em.url || '')}"
             target="_blank" rel="noopener">${esc(em.author)}</a>` : ''}
          ${esc(work.title)}
          ${em.music ? `<a href="${esc(em.musicUrl || '')}"
             target="_blank" rel="noopener">\u266c ${esc(em.music)}</a>` : ''}
        </section>
      </blockquote>
      ${em.url ? outLink(em.url, em.label || 'Watch on TikTok') : ''}
    </figure>` : '');

  /** Appended once, after the markup exists for it to find. */
  const EMBED_SCRIPTS = {
    tiktok: 'https://www.tiktok.com/embed.js',
    instagram: 'https://www.instagram.com/embed.js',
  };
  function loadEmbedScript(host) {
    const src = EMBED_SCRIPTS[host];
    if (!src || document.querySelector(`script[data-embed-host="${host}"]`)) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    s.setAttribute('data-embed-host', host);
    document.body.appendChild(s);
  }

  /* An embed is the project's media on this page. Where one exists the
     media[] frames are not drawn here — the loop and the published cut
     are the same film, and a page showing it twice reads as a mistake.
     media[] still feeds the works-grid card and the node-tree frame,
     which is where a silent loop earns its keep. If a project ever has
     an embed AND stills that aren't the same thing, this is the line. */
  /* Every browser blocks autoplay with sound, so a clip's audio has
     to be the visitor's own doing: the loop runs silent as before, and
     the caption under it is a switch. It reads as a status - SOUND
     OFF / SOUND ON - because that is what a mute toggle means to
     people, and aria-pressed carries the state for anyone not looking
     at it. Frank's call, Sept 13 2026. */
  const soundToggle = (item) => item && item.src && item.type === 'video' ? `
      <figcaption>
        <button type="button" class="shot__sound" data-sound aria-pressed="false"
                aria-label="Turn sound on">Sound off</button>
      </figcaption>` : '';

  /* An embed normally replaces the frames (see above). embed.alongside
     keeps them: the FCI recap's slides ARE the design and its
     Instagram post is the design in use, so the page shows both. */
  const frames = (em && !em.alongside) ? '' : media.map((item, i) => `
    <figure class="floater floater--${spots[i % spots.length]}${floaterExtra(item)}" data-drag>
      <span class="drift">${shot(item, work.title, i === 0 ? 'wide' : shapes[i % shapes.length])}</span>${soundToggle(item)}
    </figure>
  `).join('');

  const marks = [
    typeLabel(work.type),
    work.year,
    madeForLabel(work),
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

    ${em && em.alongside ? frames : embed}

    ${em && em.alongside ? embed : frames}

    ${facts.length ? `
      <ul class="notes notes--work" data-stop>
        ${facts.map(([k, v]) => `<li><span class="label">${esc(k)}</span> ${esc(v)}</li>`).join('')}
      </ul>` : ''}

    ${beats.length ? `
      <div class="beats" data-stop>
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
      <div class="credits" data-stop>
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
      <a class="next-node" href="work.html?id=${encodeURIComponent(next.id)}" data-stop>
        <span class="label">Next project</span>
        <span class="next-node__title">${esc(next.title)}</span>
        <span class="label">${esc(workMetaLine(next))}</span>
      </a>` : ''}

  `;

  if (em) loadEmbedScript(em.type); // no-op for hosts that are a plain iframe

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

  /* Sound. One clip at a time - switching one on switches the others
     off - and a clip that scrolls out of view goes quiet again, so
     nothing plays audio from somewhere the visitor can't see. The
     loop itself never stops; only the mute changes hands. */
  const soundButtons = [...root.querySelectorAll('[data-sound]')];
  const videoFor = (btn) => btn.closest('.floater').querySelector('video');
  function setSound(btn, on) {
    const video = videoFor(btn);
    if (!video) return;
    video.muted = !on;
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    btn.textContent = on ? 'Sound on' : 'Sound off';
    if (on) { const p = video.play(); if (p) p.catch(() => {}); }
  }
  soundButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      soundButtons.forEach((other) => { if (other !== btn) setSound(other, false); });
      setSound(btn, on);
    });
  });
  if (soundButtons.length && 'IntersectionObserver' in window) {
    const quiet = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) return;
        const btn = entry.target.closest('.floater').querySelector('[data-sound]');
        if (btn && btn.getAttribute('aria-pressed') === 'true') setSound(btn, false);
      });
    }, { threshold: 0.25 });
    soundButtons.forEach((btn) => { const v = videoFor(btn); if (v) quiet.observe(v); });
  }
  initReveals(root);
});

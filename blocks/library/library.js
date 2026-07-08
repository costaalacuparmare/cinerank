// inline (not <img>-based) so the icon can pick up the chip's currentColor
const STAR_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

/**
 * decorate the library block — the poster-grid landing page listing every movie.
 * Each authored row is [title link, mean score]. Manually authored for now; once
 * movie pages are actually published this can be swapped to read from the
 * EDS query-index instead, since that can't be exercised against local drafts.
 * @param {Element} block the block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const [linkCell, meanCell] = [...row.children];
    const link = linkCell?.querySelector('a');
    if (!link) return;

    const tileLink = document.createElement('a');
    tileLink.href = link.href;
    tileLink.className = 'library-tile';

    const poster = document.createElement('div');
    poster.className = 'library-tile-poster';
    poster.textContent = 'Poster (TMDB pending)';
    tileLink.append(poster);

    const info = document.createElement('div');
    info.className = 'library-tile-info';

    const title = document.createElement('p');
    title.className = 'library-tile-title';
    title.textContent = link.textContent.trim();
    info.append(title);

    const mean = meanCell?.textContent.trim();
    if (mean) {
      const meanChip = document.createElement('span');
      meanChip.className = 'library-tile-mean';
      meanChip.innerHTML = `${STAR_ICON}${mean}`;
      info.append(meanChip);
    }

    tileLink.append(info);

    const li = document.createElement('li');
    li.append(tileLink);
    ul.append(li);
  });
  block.replaceChildren(ul);
}

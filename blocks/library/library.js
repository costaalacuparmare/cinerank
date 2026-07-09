const CATEGORIES = ['Plot', 'Filmography', 'Sound', 'Vibe'];

// inline (not <img>-based) so the icon can pick up the chip's currentColor
const STAR_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

/**
 * @param {Element} cell the cell containing labeled category scores, e.g. "Plot: 9 Vibe: 10"
 * @returns {Object<string, number>} category name -> score
 */
function parseScores(cell) {
  const scores = {};
  if (!cell) return scores;
  const text = cell.textContent;
  CATEGORIES.forEach((category) => {
    const match = text.match(new RegExp(`${category}:\\s*(\\d+)`, 'i'));
    if (match) scores[category] = Number(match[1]);
  });
  return scores;
}

/**
 * @param {string} title movie title, e.g. "Dune: Part Two (2024)"
 * @returns {number|null} the year, or null if not found
 */
function parseYear(title) {
  const match = title.match(/\((\d{4})\)/);
  return match ? Number(match[1]) : null;
}

/**
 * Reads one authored row into a plain data object for sorting/filtering/rendering.
 * @param {Element} row [title link, director, mean score, category scores]
 * @returns {Object|null}
 */
function parseEntry(row) {
  const [linkCell, directorCell, meanCell, scoresCell] = [...row.children];
  const link = linkCell?.querySelector('a');
  if (!link) return null;

  const title = link.textContent.trim();
  const mean = meanCell?.textContent.trim();

  return {
    href: link.href,
    title,
    year: parseYear(title),
    director: directorCell?.textContent.trim() || '',
    mean: mean ? Number(mean) : null,
    scores: parseScores(scoresCell),
  };
}

/**
 * @param {Object} entry parsed movie entry
 * @returns {Element} the <li> tile
 */
function buildTile(entry) {
  const tileLink = document.createElement('a');
  tileLink.href = entry.href;
  tileLink.className = 'library-tile';

  const poster = document.createElement('div');
  poster.className = 'library-tile-poster';
  poster.textContent = 'Poster (TMDB pending)';
  tileLink.append(poster);

  const info = document.createElement('div');
  info.className = 'library-tile-info';

  const title = document.createElement('p');
  title.className = 'library-tile-title';
  title.textContent = entry.title;
  info.append(title);

  if (entry.mean !== null) {
    const meanChip = document.createElement('span');
    meanChip.className = 'library-tile-mean';
    meanChip.innerHTML = `${STAR_ICON}${entry.mean}`;
    info.append(meanChip);
  }

  tileLink.append(info);

  const li = document.createElement('li');
  li.append(tileLink);
  return li;
}

const SORT_OPTIONS = [
  {
    value: 'mean-desc',
    label: 'Overall score (highest)',
    compare: (a, b) => (b.mean ?? -Infinity) - (a.mean ?? -Infinity),
  },
  {
    value: 'mean-asc',
    label: 'Overall score (lowest)',
    compare: (a, b) => (a.mean ?? Infinity) - (b.mean ?? Infinity),
  },
  {
    value: 'title-asc',
    label: 'Title (A–Z)',
    compare: (a, b) => a.title.localeCompare(b.title),
  },
  {
    value: 'year-desc',
    label: 'Year (newest)',
    compare: (a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity),
  },
  {
    value: 'year-asc',
    label: 'Year (oldest)',
    compare: (a, b) => (a.year ?? Infinity) - (b.year ?? Infinity),
  },
  ...CATEGORIES.map((category) => ({
    value: `${category.toLowerCase()}-desc`,
    label: `${category} (highest)`,
    compare: (a, b) => (b.scores[category] ?? -Infinity) - (a.scores[category] ?? -Infinity),
  })),
];

const DEFAULT_SORT = SORT_OPTIONS[0].value;

/**
 * @param {string[]} directors unique director names
 * @returns {Element} a <select> populated with an "All directors" option plus one per director
 */
function buildDirectorFilter(directors) {
  const select = document.createElement('select');
  select.className = 'library-filter';

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All directors';
  select.append(allOption);

  directors.forEach((director) => {
    const option = document.createElement('option');
    option.value = director;
    option.textContent = director;
    select.append(option);
  });

  return select;
}

/**
 * @returns {Element} a <select> populated with the available sort options
 */
function buildSortSelect() {
  const select = document.createElement('select');
  select.className = 'library-sort';

  SORT_OPTIONS.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    select.append(option);
  });
  select.value = DEFAULT_SORT;

  return select;
}

/**
 * decorate the library block — the poster-grid landing page listing every movie,
 * with client-side sort/filter controls. Each authored row is
 * [title link, director, mean score, category scores]. Manually authored for now;
 * once movie pages are actually published this can be swapped to read from the
 * EDS query-index instead, since that can't be exercised against local drafts.
 * @param {Element} block the block
 */
export default function decorate(block) {
  const entries = [...block.children].map(parseEntry).filter(Boolean);
  const directors = [...new Set(entries.map((entry) => entry.director).filter(Boolean))].sort();

  const grid = document.createElement('ul');
  grid.className = 'library-grid';

  const sortSelect = buildSortSelect();
  const filterSelect = buildDirectorFilter(directors);

  function render() {
    const sortOption = SORT_OPTIONS.find((opt) => opt.value === sortSelect.value)
      || SORT_OPTIONS[0];
    const visible = filterSelect.value
      ? entries.filter((entry) => entry.director === filterSelect.value)
      : entries;
    grid.replaceChildren(...[...visible].sort(sortOption.compare).map(buildTile));
  }

  sortSelect.addEventListener('change', render);
  filterSelect.addEventListener('change', render);

  const sortLabel = document.createElement('label');
  sortLabel.className = 'library-toolbar-field';
  sortLabel.append('Sort by', sortSelect);

  const filterLabel = document.createElement('label');
  filterLabel.className = 'library-toolbar-field';
  filterLabel.append('Director', filterSelect);

  const toolbar = document.createElement('div');
  toolbar.className = 'library-toolbar';
  toolbar.append(sortLabel, filterLabel);

  render();
  block.replaceChildren(toolbar, grid);
}

import fetchTmdbData from '../../scripts/tmdb.js';

const CATEGORIES = ['Plot', 'Filmography', 'Sound', 'Vibe'];

// Fixed curated list (not freeform) — keeps the genre filter a clean dropdown over time.
const GENRE_TAGS = ['cozy', 'unsettling', 'kinetic', 'tense', 'whimsical', 'bleak', 'epic', 'heartfelt', 'chaotic', 'dreamlike'];

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
 * @param {Element} cell the cell that may contain a trailing "Tags: a, b, c" segment
 * @returns {string[]} the tags present in this cell, matched against the curated list
 */
function parseTags(cell) {
  if (!cell) return [];
  const match = cell.textContent.match(/Tags:\s*(.+)$/i);
  if (!match) return [];
  const listed = match[1].split(',').map((tag) => tag.trim().toLowerCase());
  return GENRE_TAGS.filter((tag) => listed.includes(tag));
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
 * @param {Element} row [title link, director, mean score, category scores (+ tags)]
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
    tags: parseTags(scoresCell),
    poster: null,
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
  if (entry.poster) {
    const img = document.createElement('img');
    img.src = entry.poster;
    img.alt = `${entry.title} poster`;
    img.loading = 'lazy';
    poster.append(img);
  } else {
    poster.textContent = 'Poster unavailable';
  }
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
 * @param {string} className CSS class for the <select>
 * @param {string} allLabel label for the "no filter" option
 * @param {string[]} values the selectable values
 * @returns {Element}
 */
function buildFilterSelect(className, allLabel, values) {
  const select = document.createElement('select');
  select.className = className;

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = allLabel;
  select.append(allOption);

  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
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
 * with client-side search/sort/filter controls. Each authored row is
 * [title link, director, mean score, category scores (+ optional "Tags:" segment)].
 * Manually authored for now; once movie pages are actually published this can be
 * swapped to read from the EDS query-index instead, since that can't be exercised
 * against local drafts.
 * @param {Element} block the block
 */
export default async function decorate(block) {
  const entries = [...block.children].map(parseEntry).filter(Boolean);

  await Promise.all(entries.map(async (entry) => {
    const tmdbData = await fetchTmdbData(entry.title);
    entry.poster = tmdbData.poster;
  }));

  const directors = [...new Set(entries.map((entry) => entry.director).filter(Boolean))].sort();
  const years = [...new Set(entries.map((entry) => entry.year).filter(Boolean))]
    .sort((a, b) => b - a);

  const grid = document.createElement('ul');
  grid.className = 'library-grid';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'library-search';
  searchInput.placeholder = 'Search titles…';

  const sortSelect = buildSortSelect();
  const directorSelect = buildFilterSelect('library-filter-director', 'All directors', directors);
  const yearSelect = buildFilterSelect('library-filter-year', 'All years', years);
  const genreSelect = buildFilterSelect('library-filter-genre', 'All genres/vibes', GENRE_TAGS);

  function render() {
    const sortOption = SORT_OPTIONS.find((opt) => opt.value === sortSelect.value)
      || SORT_OPTIONS[0];
    const query = searchInput.value.trim().toLowerCase();

    const visible = entries.filter((entry) => (
      (!query || entry.title.toLowerCase().includes(query))
      && (!directorSelect.value || entry.director === directorSelect.value)
      && (!yearSelect.value || entry.year === Number(yearSelect.value))
      && (!genreSelect.value || entry.tags.includes(genreSelect.value))
    ));

    grid.replaceChildren(...[...visible].sort(sortOption.compare).map(buildTile));
  }

  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);
  directorSelect.addEventListener('change', render);
  yearSelect.addEventListener('change', render);
  genreSelect.addEventListener('change', render);

  const searchGroup = document.createElement('div');
  searchGroup.className = 'library-toolbar-search';
  searchGroup.append(searchInput);

  const filterGroup = document.createElement('div');
  filterGroup.className = 'library-toolbar-filters';
  [
    ['Sort by', sortSelect],
    ['Year', yearSelect],
    ['Genre/vibe', genreSelect],
    ['Director', directorSelect],
  ].forEach(([labelText, select]) => {
    const label = document.createElement('label');
    label.className = 'library-toolbar-field';
    label.append(labelText, select);
    filterGroup.append(label);
  });

  const toolbar = document.createElement('div');
  toolbar.className = 'library-toolbar';
  toolbar.append(searchGroup, filterGroup);

  render();
  block.replaceChildren(toolbar, grid);
}

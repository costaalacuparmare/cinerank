import fetchTmdbData from '../../scripts/tmdb.js';

const CATEGORIES = ['Plot', 'Filmography', 'Sound', 'Vibe'];

// Fixed curated list (not freeform) — keeps the genre filter a clean dropdown over time.
const GENRE_TAGS = ['cozy', 'unsettling', 'kinetic', 'tense', 'whimsical', 'bleak', 'epic', 'heartfelt', 'chaotic', 'dreamlike'];

// inline (not <img>-based) so the icon can pick up the chip's currentColor
const STAR_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

/**
 * @param {Object<string, number>} scores category name -> score
 * @returns {number|null} mean of the available category scores, or null if none
 */
function computeMean(scores) {
  const values = CATEGORIES.map((category) => scores[category]).filter(
    (value) => typeof value === 'number',
  );
  if (!values.length) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

/**
 * Reads one /query-index.json row into a plain data object for sorting/filtering/rendering.
 * @param {Object} item a row from query-index.json, keyed by the helix-query.yaml properties
 * @returns {Object|null}
 */
function parseIndexEntry(item) {
  if (!item.path || !item.title) return null;

  const scores = {};
  CATEGORIES.forEach((category) => {
    const value = Number(item[`${category.toLowerCase()}-score`]);
    if (!Number.isNaN(value) && item[`${category.toLowerCase()}-score`]) scores[category] = value;
  });

  const rawTags = Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',');
  const tags = rawTags.map((tag) => tag.trim().toLowerCase())
    .filter((tag) => GENRE_TAGS.includes(tag));

  return {
    href: item.path,
    title: item.title,
    year: item.year ? Number(item.year) : null,
    director: item.director || '',
    mean: computeMean(scores),
    scores,
    tags,
    poster: null,
    cast: [],
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
 * A free-text input with a native <datalist> of suggestions, so it cross-matches available
 * options as you type instead of requiring an exact pick from a (potentially huge) dropdown.
 * @param {string} className CSS class for the <input>
 * @param {string} placeholder placeholder text
 * @param {string[]} values suggested values
 * @returns {{input: Element, datalist: Element}}
 */
function buildTypeaheadInput(className, placeholder, values) {
  const listId = `${className}-options`;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = className;
  input.placeholder = placeholder;
  input.setAttribute('list', listId);

  const datalist = document.createElement('datalist');
  datalist.id = listId;
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    datalist.append(option);
  });

  return { input, datalist };
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
 * decorate the library block — the poster-grid landing page listing every movie, sourced
 * from the EDS query-index (helix-query.yaml, scoped to /movies/**) rather than an authored
 * row per movie, so a new movie page shows up here automatically once published, with no
 * second authoring step. Has client-side search/sort/filter controls.
 * @param {Element} block the block
 */
export default async function decorate(block) {
  const res = await fetch('/query-index.json');
  const { data } = res.ok ? await res.json() : { data: [] };
  const entries = data.map(parseIndexEntry).filter(Boolean);

  await Promise.all(entries.map(async (entry) => {
    const tmdbData = await fetchTmdbData(`${entry.title} (${entry.year})`);
    entry.poster = tmdbData.poster;
    entry.cast = tmdbData.cast ? tmdbData.cast.split(',').map((name) => name.trim()) : [];
  }));

  const directors = [...new Set(entries.map((entry) => entry.director).filter(Boolean))].sort();
  const actors = [...new Set(entries.flatMap((entry) => entry.cast))].sort();
  const years = [...new Set(entries.map((entry) => entry.year).filter(Boolean))]
    .sort((a, b) => b - a);

  const grid = document.createElement('ul');
  grid.className = 'library-grid';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'library-search';
  searchInput.placeholder = 'Search titles, directors, actors…';

  const sortSelect = buildSortSelect();
  const genreSelect = buildFilterSelect('library-filter-genre', 'All genres/vibes', GENRE_TAGS);
  const { input: directorInput, datalist: directorDatalist } = buildTypeaheadInput(
    'library-filter-director',
    'Any director…',
    directors,
  );
  const { input: yearInput, datalist: yearDatalist } = buildTypeaheadInput(
    'library-filter-year',
    'Any year…',
    years.map(String),
  );
  const { input: actorInput, datalist: actorDatalist } = buildTypeaheadInput(
    'library-filter-actor',
    'Any actor…',
    actors,
  );

  function render() {
    const sortOption = SORT_OPTIONS.find((opt) => opt.value === sortSelect.value)
      || SORT_OPTIONS[0];
    const query = searchInput.value.trim().toLowerCase();
    const directorQuery = directorInput.value.trim().toLowerCase();
    const yearQuery = yearInput.value.trim();
    const actorQuery = actorInput.value.trim().toLowerCase();

    const visible = entries.filter((entry) => (
      (!query
        || entry.title.toLowerCase().includes(query)
        || entry.director.toLowerCase().includes(query)
        || entry.cast.some((name) => name.toLowerCase().includes(query)))
      && (!directorQuery || entry.director.toLowerCase().includes(directorQuery))
      && (!yearQuery || String(entry.year).includes(yearQuery))
      && (!genreSelect.value || entry.tags.includes(genreSelect.value))
      && (!actorQuery || entry.cast.some((name) => name.toLowerCase().includes(actorQuery)))
    ));

    grid.replaceChildren(...[...visible].sort(sortOption.compare).map(buildTile));
  }

  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);
  genreSelect.addEventListener('change', render);
  directorInput.addEventListener('input', render);
  yearInput.addEventListener('input', render);
  actorInput.addEventListener('input', render);

  const searchGroup = document.createElement('div');
  searchGroup.className = 'library-toolbar-search';
  searchGroup.append(searchInput);

  const filterGroup = document.createElement('div');
  filterGroup.className = 'library-toolbar-filters';

  const sortLabel = document.createElement('label');
  sortLabel.className = 'library-toolbar-field';
  sortLabel.append('Sort by', sortSelect);
  filterGroup.append(sortLabel);

  [
    ['Year', yearInput, yearDatalist],
    ['Genre/vibe', genreSelect],
    ['Director', directorInput, directorDatalist],
    ['Actor', actorInput, actorDatalist],
  ].forEach(([labelText, ...fields]) => {
    const label = document.createElement('label');
    label.className = 'library-toolbar-field';
    label.append(labelText, ...fields);
    filterGroup.append(label);
  });

  const toolbar = document.createElement('div');
  toolbar.className = 'library-toolbar';
  toolbar.append(searchGroup, filterGroup);

  render();
  block.replaceChildren(toolbar, grid);
}

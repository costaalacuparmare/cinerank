import fetchTmdbData from '../../scripts/tmdb.js';

const CATEGORIES = ['Plot', 'Filmography', 'Sound', 'Vibe'];

const SHUFFLE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>';

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
 * Reads one /query-index.json row into a plain data object.
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

  return {
    href: item.path,
    title: item.title,
    year: item.year ? Number(item.year) : null,
    director: item.director || '',
    mean: computeMean(scores),
    scores,
    poster: null,
  };
}

/**
 * @param {Object[]} entries the full movie list
 * @returns {Object[]} two distinct random entries
 */
function pickRandomPair(entries) {
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

/**
 * @param {Object} entry a movie entry, mutated in place with a `poster` once resolved
 * @returns {Promise<void>}
 */
async function loadPoster(entry) {
  if (entry.poster !== null) return;
  const tmdbData = await fetchTmdbData(`${entry.title} (${entry.year})`);
  entry.poster = tmdbData.poster || '';
}

/**
 * @param {Object} entry a movie entry
 * @returns {Element}
 */
function buildCard(entry) {
  const card = document.createElement('a');
  card.className = 'duel-card';
  card.href = entry.href;

  const poster = document.createElement('div');
  poster.className = 'duel-card-poster';
  if (entry.poster) {
    const img = document.createElement('img');
    img.src = entry.poster;
    img.alt = `${entry.title} poster`;
    img.loading = 'lazy';
    poster.append(img);
  } else {
    poster.textContent = 'Poster unavailable';
  }
  card.append(poster);

  const title = document.createElement('p');
  title.className = 'duel-card-title';
  title.textContent = entry.title;
  card.append(title);

  const meta = document.createElement('p');
  meta.className = 'duel-card-meta';
  meta.textContent = [entry.director, entry.year].filter(Boolean).join(' · ');
  card.append(meta);

  return card;
}

/**
 * @param {string} label row label ("Overall" or a category name)
 * @param {number|null} valueA
 * @param {number|null} valueB
 * @returns {Element}
 */
function buildStatRow(label, valueA, valueB) {
  const row = document.createElement('div');
  row.className = 'duel-stat-row';

  const cellA = document.createElement('span');
  cellA.className = 'duel-stat-value';
  cellA.textContent = valueA ?? '—';

  const rowLabel = document.createElement('span');
  rowLabel.className = 'duel-stat-label';
  rowLabel.textContent = label;

  const cellB = document.createElement('span');
  cellB.className = 'duel-stat-value';
  cellB.textContent = valueB ?? '—';

  if (typeof valueA === 'number' && typeof valueB === 'number' && valueA !== valueB) {
    (valueA > valueB ? cellA : cellB).classList.add('duel-stat-winner');
  }

  row.append(cellA, rowLabel, cellB);
  return row;
}

/**
 * @param {Object} entryA
 * @param {Object} entryB
 * @returns {Element}
 */
function buildComparison(entryA, entryB) {
  const comparison = document.createElement('div');
  comparison.className = 'duel-comparison';
  comparison.append(buildStatRow('Overall', entryA.mean, entryB.mean));
  CATEGORIES.forEach((category) => {
    comparison.append(buildStatRow(category, entryA.scores[category], entryB.scores[category]));
  });
  return comparison;
}

/**
 * @param {Object} entryA
 * @param {Object} entryB
 * @returns {Element}
 */
function buildVerdict(entryA, entryB) {
  const verdict = document.createElement('p');
  verdict.className = 'duel-verdict';
  if (entryA.mean === null || entryB.mean === null || entryA.mean === entryB.mean) {
    verdict.textContent = "It's a tie overall.";
  } else {
    const winner = entryA.mean > entryB.mean ? entryA : entryB;
    verdict.textContent = `${winner.title} wins overall.`;
  }
  return verdict;
}

/**
 * @param {string} placeholder placeholder text
 * @param {string[]} titles suggested titles
 * @returns {{input: Element, datalist: Element}}
 */
function buildMovieTypeahead(placeholder, titles) {
  const listId = `duel-picker-${placeholder.replace(/\s+/g, '-').toLowerCase()}`;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'duel-picker-input';
  input.placeholder = placeholder;
  input.setAttribute('list', listId);

  const datalist = document.createElement('datalist');
  datalist.id = listId;
  titles.forEach((title) => {
    const option = document.createElement('option');
    option.value = title;
    datalist.append(option);
  });

  return { input, datalist };
}

/**
 * decorate the duel block — a public, ephemeral "which is better" comparison toy. Two movies
 * (random or hand-picked), full stat breakdown side by side. Nothing persists; this never
 * writes back to a movie's real score, by design (see README's "Future work" section).
 * @param {Element} block the block
 */
export default async function decorate(block) {
  const res = await fetch('/query-index.json');
  const { data } = res.ok ? await res.json() : { data: [] };
  const entries = data.map(parseIndexEntry).filter(Boolean);
  const titles = entries.map((entry) => entry.title).sort();

  const stage = document.createElement('div');
  stage.className = 'duel-stage';

  let mode = 'random';
  let current = pickRandomPair(entries);

  async function renderStage() {
    stage.textContent = 'Loading…';
    const [entryA, entryB] = current;
    await Promise.all([loadPoster(entryA), loadPoster(entryB)]);

    const cards = document.createElement('div');
    cards.className = 'duel-cards';
    cards.append(buildCard(entryA), document.createElement('div'), buildCard(entryB));
    cards.children[1].className = 'duel-vs';
    cards.children[1].textContent = 'VS';

    stage.replaceChildren(cards, buildComparison(entryA, entryB), buildVerdict(entryA, entryB));
  }

  const randomButton = document.createElement('button');
  randomButton.type = 'button';
  randomButton.className = 'duel-mode-button';
  randomButton.textContent = 'Random';

  const customButton = document.createElement('button');
  customButton.type = 'button';
  customButton.className = 'duel-mode-button';
  customButton.textContent = 'Custom';

  const shuffleButton = document.createElement('button');
  shuffleButton.type = 'button';
  shuffleButton.className = 'duel-shuffle';
  shuffleButton.innerHTML = `${SHUFFLE_ICON}<span>New matchup</span>`;
  shuffleButton.addEventListener('click', () => {
    current = pickRandomPair(entries);
    renderStage();
  });

  const { input: pickerA, datalist: datalistA } = buildMovieTypeahead('Movie A…', titles);
  const { input: pickerB, datalist: datalistB } = buildMovieTypeahead('Movie B…', titles);

  function trySetCustomPair() {
    const entryA = entries.find((entry) => entry.title === pickerA.value.trim());
    const entryB = entries.find((entry) => entry.title === pickerB.value.trim());
    if (entryA && entryB && entryA !== entryB) {
      current = [entryA, entryB];
      renderStage();
    }
  }
  pickerA.addEventListener('input', trySetCustomPair);
  pickerB.addEventListener('input', trySetCustomPair);

  const customPickers = document.createElement('div');
  customPickers.className = 'duel-custom-pickers';
  customPickers.append(pickerA, datalistA, pickerB, datalistB);
  customPickers.hidden = true;

  function setMode(nextMode) {
    mode = nextMode;
    randomButton.setAttribute('aria-pressed', String(mode === 'random'));
    customButton.setAttribute('aria-pressed', String(mode === 'custom'));
    shuffleButton.hidden = mode !== 'random';
    customPickers.hidden = mode !== 'custom';
    if (mode === 'random') {
      current = pickRandomPair(entries);
      renderStage();
    }
  }
  randomButton.addEventListener('click', () => setMode('random'));
  customButton.addEventListener('click', () => setMode('custom'));

  const modeToggle = document.createElement('div');
  modeToggle.className = 'duel-mode-toggle';
  modeToggle.append(randomButton, customButton);

  const toolbar = document.createElement('div');
  toolbar.className = 'duel-toolbar';
  toolbar.append(modeToggle, shuffleButton, customPickers);

  setMode('random');
  block.replaceChildren(toolbar, stage);
}

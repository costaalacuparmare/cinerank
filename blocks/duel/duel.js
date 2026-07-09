import fetchTmdbData from '../../scripts/tmdb.js';
import makeClearable from '../../scripts/clearable-input.js';

const CATEGORIES = ['Plot', 'Filmography', 'Sound', 'Vibe'];
const MIN_COUNT = 2;
const MAX_COUNT = 4;

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
  if (!item.path || !item.title || item.removed) return null;

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
 * @param {number} count how many distinct entries to pick
 * @returns {Object[]}
 */
function pickRandomN(entries, count) {
  return [...entries].sort(() => Math.random() - 0.5).slice(0, count);
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
 * @param {Object[]} entries 2-4 movies
 * @returns {Element}
 */
function buildCardsRow(entries) {
  const row = document.createElement('div');
  row.className = 'duel-cards';
  entries.forEach((entry, i) => {
    row.append(buildCard(entry));
    if (i < entries.length - 1) {
      const vs = document.createElement('div');
      vs.className = 'duel-vs';
      vs.textContent = 'VS';
      row.append(vs);
    }
  });
  return row;
}

/**
 * @param {string} label row label ("Overall" or a category name)
 * @param {Object[]} entries 2-4 movies
 * @param {(entry: Object) => number|null} getValue
 * @returns {Element}
 */
function buildStatRow(label, entries, getValue) {
  const row = document.createElement('div');
  row.className = 'duel-stat-row';
  row.style.setProperty('--duel-count', entries.length);

  const rowLabel = document.createElement('span');
  rowLabel.className = 'duel-stat-label';
  rowLabel.textContent = label;
  row.append(rowLabel);

  const values = entries.map(getValue);
  const numericValues = values.filter((value) => typeof value === 'number');
  const max = numericValues.length ? Math.max(...numericValues) : null;

  values.forEach((value) => {
    const cell = document.createElement('span');
    cell.className = 'duel-stat-value';
    cell.textContent = value ?? '—';
    if (typeof value === 'number' && value === max && numericValues.length > 1) {
      cell.classList.add('duel-stat-winner');
    }
    row.append(cell);
  });

  return row;
}

/**
 * @param {Object[]} entries 2-4 movies
 * @returns {Element}
 */
function buildComparison(entries) {
  const comparison = document.createElement('div');
  comparison.className = 'duel-comparison';
  comparison.append(buildStatRow('Overall', entries, (entry) => entry.mean));
  CATEGORIES.forEach((category) => {
    comparison.append(buildStatRow(category, entries, (entry) => entry.scores[category]));
  });
  return comparison;
}

/**
 * @param {Object[]} entries 2-4 movies
 * @returns {Element}
 */
function buildVerdict(entries) {
  const verdict = document.createElement('p');
  verdict.className = 'duel-verdict';

  const means = entries.map((entry) => entry.mean).filter((value) => typeof value === 'number');
  if (means.length < entries.length) {
    verdict.textContent = "It's a tie overall.";
    return verdict;
  }

  const max = Math.max(...means);
  const winners = entries.filter((entry) => entry.mean === max);
  verdict.textContent = winners.length > 1
    ? `It's a tie between ${winners.map((entry) => entry.title).join(' and ')}.`
    : `${winners[0].title} wins overall.`;
  return verdict;
}

/**
 * @param {string} placeholder placeholder text
 * @param {string} listId shared datalist id
 * @returns {Element}
 */
function buildMovieTypeahead(placeholder, listId) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'duel-picker-input';
  input.placeholder = placeholder;
  input.setAttribute('list', listId);
  return input;
}

/**
 * decorate the duel block — a public, ephemeral "which is better" comparison toy. 2-4 movies
 * (random or hand-picked), full stat breakdown side by side. Nothing persists; this never
 * writes back to a movie's real score, by design (see README's "Future work" section).
 * @param {Element} block the block
 */
export default async function decorate(block) {
  const res = await fetch('/query-index.json');
  const { data } = res.ok ? await res.json() : { data: [] };
  const entries = data.map(parseIndexEntry).filter(Boolean);
  const titles = entries.map((entry) => entry.title).sort();

  const datalistId = 'duel-picker-options';
  const datalist = document.createElement('datalist');
  datalist.id = datalistId;
  titles.forEach((title) => {
    const option = document.createElement('option');
    option.value = title;
    datalist.append(option);
  });

  const stage = document.createElement('div');
  stage.className = 'duel-stage';

  let mode = 'random';
  let count = MIN_COUNT;
  let current = pickRandomN(entries, count);

  async function renderStage() {
    stage.textContent = 'Loading…';
    await Promise.all(current.map(loadPoster));
    stage.replaceChildren(buildCardsRow(current), buildComparison(current), buildVerdict(current));
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
    current = pickRandomN(entries, count);
    renderStage();
  });

  const duelButton = document.createElement('button');
  duelButton.type = 'button';
  duelButton.className = 'duel-go';
  duelButton.textContent = 'Duel';

  const pickersWrap = document.createElement('div');
  pickersWrap.className = 'duel-custom-pickers';
  let pickers = [];

  function rebuildPickers() {
    const previousValues = pickers.map((input) => input.value);
    pickers = Array.from({ length: count }, (_, i) => buildMovieTypeahead(`Movie ${i + 1}…`, datalistId));
    pickers.forEach((input, i) => { input.value = previousValues[i] || ''; });

    const children = [];
    pickers.forEach((input, i) => {
      const wrap = makeClearable(input);
      wrap.classList.add('duel-picker-wrap');
      children.push(wrap);
      if (i < pickers.length - 1) {
        const spacer = document.createElement('div');
        spacer.className = 'duel-vs duel-picker-spacer';
        spacer.textContent = 'VS';
        children.push(spacer);
      }
    });
    pickersWrap.replaceChildren(...children, datalist);
  }

  duelButton.addEventListener('click', () => {
    const picked = pickers
      .map((input) => entries.find((entry) => entry.title === input.value.trim()))
      .filter(Boolean);
    const unique = [...new Set(picked)];
    if (unique.length === count) {
      current = unique;
      renderStage();
    }
  });

  const countLabel = document.createElement('span');
  countLabel.className = 'duel-count-label';

  const minusButton = document.createElement('button');
  minusButton.type = 'button';
  minusButton.className = 'duel-count-button';
  minusButton.textContent = '−';
  minusButton.setAttribute('aria-label', 'Remove a movie from the duel');

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'duel-count-button';
  addButton.textContent = '+';
  addButton.setAttribute('aria-label', 'Add another movie to the duel');

  function setCount(nextCount) {
    count = Math.max(MIN_COUNT, Math.min(MAX_COUNT, nextCount));
    countLabel.textContent = `${count} movies`;
    addButton.disabled = count >= MAX_COUNT;
    minusButton.disabled = count <= MIN_COUNT;
    if (mode === 'random') {
      current = pickRandomN(entries, count);
      renderStage();
    } else {
      rebuildPickers();
    }
  }
  addButton.addEventListener('click', () => setCount(count + 1));
  minusButton.addEventListener('click', () => setCount(count - 1));

  function setMode(nextMode) {
    mode = nextMode;
    randomButton.setAttribute('aria-pressed', String(mode === 'random'));
    customButton.setAttribute('aria-pressed', String(mode === 'custom'));
    shuffleButton.hidden = mode !== 'random';
    pickersWrap.hidden = mode !== 'custom';
    duelButton.hidden = mode !== 'custom';
    if (mode === 'random') {
      current = pickRandomN(entries, count);
      renderStage();
    } else if (pickers.length !== count) {
      rebuildPickers();
    }
  }
  randomButton.addEventListener('click', () => setMode('random'));
  customButton.addEventListener('click', () => setMode('custom'));

  const modeToggle = document.createElement('div');
  modeToggle.className = 'duel-mode-toggle';
  modeToggle.append(randomButton, customButton);

  countLabel.textContent = `${count} movies`;
  minusButton.disabled = count <= MIN_COUNT;
  addButton.disabled = count >= MAX_COUNT;
  const countControl = document.createElement('div');
  countControl.className = 'duel-count-control';
  countControl.append(minusButton, countLabel, addButton);

  const toolbar = document.createElement('div');
  toolbar.className = 'duel-toolbar';
  toolbar.append(modeToggle, countControl, shuffleButton, duelButton);

  setMode('random');
  block.replaceChildren(toolbar, pickersWrap, stage);
}

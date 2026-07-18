import fetchTmdbData from '../../scripts/tmdb.js';
import makeClearable from '../../scripts/clearable-input.js';

const CATEGORIES = ['Plot', 'Filmography', 'Sound', 'Vibe'];
const MIN_COUNT = 2;
const MAX_COUNT = 4;
const BRACKET_SIZE = 16;
const BRACKET_ROUND_LABELS = ['Round of 16', 'Quarterfinals', 'Semifinals', 'Final'];

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
 * Loads posters a few at a time instead of all at once, so a large batch (e.g. a 16-movie
 * bracket) doesn't fire enough parallel TMDB requests to trip its rate limit.
 * @param {Object[]} entriesList movie entries to load posters for
 * @param {number} concurrency how many requests to run at once
 * @returns {Promise<void>}
 */
async function loadPostersBatched(entriesList, concurrency = 4) {
  for (let i = 0; i < entriesList.length; i += concurrency) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(entriesList.slice(i, i + concurrency).map(loadPoster));
  }
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
 * @param {Object} entry a movie entry
 * @returns {Element}
 */
function buildBracketCard(entry) {
  const card = document.createElement('span');
  card.className = 'bracket-card';

  const poster = document.createElement('span');
  poster.className = 'bracket-card-poster';
  if (entry.poster) {
    const img = document.createElement('img');
    img.src = entry.poster;
    img.alt = '';
    img.loading = 'lazy';
    poster.append(img);
  }
  card.append(poster);

  const title = document.createElement('span');
  title.className = 'bracket-card-title';
  title.textContent = entry.title;
  card.append(title);

  return card;
}

/**
 * @param {Object|null} a first contestant, or null if not decided yet
 * @param {Object|null} b second contestant, or null if not decided yet
 * @param {Object|null} winner the picked winner, if any
 * @param {(entry: Object) => void} onPick called with the picked entry
 * @returns {Element}
 */
function buildBracketMatchup(a, b, winner, onPick) {
  const row = document.createElement('div');
  row.className = 'bracket-matchup';

  [a, b].forEach((entry, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bracket-pick';
    if (!entry) {
      button.disabled = true;
      button.textContent = 'TBD';
    } else {
      button.append(buildBracketCard(entry));
      if (winner) {
        button.disabled = true;
        button.classList.add(winner === entry ? 'bracket-pick-winner' : 'bracket-pick-loser');
      } else {
        button.addEventListener('click', () => onPick(entry));
      }
    }
    row.append(button);
    if (i === 0) {
      const vs = document.createElement('span');
      vs.className = 'bracket-vs';
      vs.textContent = 'vs';
      row.append(vs);
    }
  });

  return row;
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
  randomButton.className = 'duel-toggle-btn';
  randomButton.textContent = 'Random';

  const customButton = document.createElement('button');
  customButton.type = 'button';
  customButton.className = 'duel-toggle-btn';
  customButton.textContent = 'Custom';

  const bracketButton = document.createElement('button');
  bracketButton.type = 'button';
  bracketButton.className = 'duel-toggle-btn';
  bracketButton.textContent = 'Bracket';
  if (entries.length < BRACKET_SIZE) {
    bracketButton.disabled = true;
    bracketButton.title = `Needs at least ${BRACKET_SIZE} movies in the library`;
  }

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

  const bracketStage = document.createElement('div');
  bracketStage.className = 'bracket-stage';
  let bracketRounds = null;

  function resetBracket() {
    const seedSize = Math.min(BRACKET_SIZE, entries.length);
    const seed = pickRandomN(entries, seedSize);
    bracketRounds = [seed];
    for (let size = seedSize / 2; size >= 1; size /= 2) {
      bracketRounds.push(Array(size).fill(null));
    }
  }

  function restartBracket() {
    const seed = bracketRounds[0];
    bracketRounds = [seed];
    for (let size = seed.length / 2; size >= 1; size /= 2) {
      bracketRounds.push(Array(size).fill(null));
    }
  }

  async function renderBracket() {
    function pick(round, matchIndex, entry) {
      bracketRounds[round + 1][matchIndex] = entry;
      for (let r = round + 2; r < bracketRounds.length; r += 1) {
        bracketRounds[r] = bracketRounds[r].map(() => null);
      }
      renderBracket();
    }

    bracketStage.textContent = 'Loading…';
    await loadPostersBatched(bracketRounds[0]);

    const champion = bracketRounds[bracketRounds.length - 1][0];
    const banner = document.createElement('p');
    banner.className = 'bracket-champion';
    banner.textContent = champion
      ? `🏆 ${champion.title} wins the bracket!`
      : 'Pick a winner in each matchup to advance them.';

    const grid = document.createElement('div');
    grid.className = 'bracket-grid';
    grid.style.setProperty('--bracket-rounds', bracketRounds.length - 1);

    for (let round = 0; round < bracketRounds.length - 1; round += 1) {
      const contestants = bracketRounds[round];
      const winners = bracketRounds[round + 1];
      const matchSpan = 2 ** (round + 1);

      const heading = document.createElement('h3');
      heading.className = 'bracket-round-title';
      heading.textContent = BRACKET_ROUND_LABELS[round] || `Round ${round + 1}`;
      heading.style.gridColumn = String(round + 1);
      grid.append(heading);

      if (winners.length === 1) {
        const matchup = buildBracketMatchup(
          contestants[0],
          contestants[1],
          winners[0],
          (entry) => pick(round, 0, entry),
        );
        matchup.style.gridColumn = String(round + 1);
        matchup.style.gridRow = `2 / span ${matchSpan}`;
        grid.append(matchup);
      } else {
        for (let m = 0; m < winners.length; m += 2) {
          const pair = document.createElement('div');
          pair.className = 'bracket-pair';
          pair.style.gridColumn = String(round + 1);
          pair.style.gridRow = `${2 + (m * matchSpan)} / span ${matchSpan * 2}`;
          pair.append(
            buildBracketMatchup(
              contestants[m * 2],
              contestants[(m * 2) + 1],
              winners[m],
              (entry) => pick(round, m, entry),
            ),
            buildBracketMatchup(
              contestants[(m + 1) * 2],
              contestants[((m + 1) * 2) + 1],
              winners[m + 1],
              (entry) => pick(round, m + 1, entry),
            ),
          );
          grid.append(pair);
        }
      }
    }

    bracketStage.replaceChildren(banner, grid);
  }

  const bracketShuffleButton = document.createElement('button');
  bracketShuffleButton.type = 'button';
  bracketShuffleButton.className = 'duel-shuffle';
  bracketShuffleButton.innerHTML = `${SHUFFLE_ICON}<span>New bracket</span>`;
  bracketShuffleButton.addEventListener('click', () => {
    resetBracket();
    renderBracket();
  });

  const bracketRestartButton = document.createElement('button');
  bracketRestartButton.type = 'button';
  bracketRestartButton.className = 'duel-shuffle';
  bracketRestartButton.textContent = 'Restart this bracket';
  bracketRestartButton.addEventListener('click', () => {
    restartBracket();
    renderBracket();
  });

  const countLabel = document.createElement('span');
  countLabel.className = 'duel-count-label';

  const minusButton = document.createElement('button');
  minusButton.type = 'button';
  minusButton.className = 'duel-count-button';
  minusButton.textContent = '−';

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'duel-count-button';
  addButton.textContent = '+';

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

  countLabel.textContent = `${count} movies`;
  minusButton.disabled = count <= MIN_COUNT;
  addButton.disabled = count >= MAX_COUNT;
  const countControl = document.createElement('div');
  countControl.className = 'duel-count-control';
  countControl.append(minusButton, countLabel, addButton);

  function setMode(nextMode) {
    mode = nextMode;
    randomButton.setAttribute('aria-pressed', String(mode === 'random'));
    customButton.setAttribute('aria-pressed', String(mode === 'custom'));
    bracketButton.setAttribute('aria-pressed', String(mode === 'bracket'));
    shuffleButton.hidden = mode !== 'random';
    pickersWrap.hidden = mode !== 'custom';
    duelButton.hidden = mode !== 'custom';
    countControl.hidden = mode === 'bracket';
    bracketShuffleButton.hidden = mode !== 'bracket';
    bracketRestartButton.hidden = mode !== 'bracket';
    stage.hidden = mode === 'bracket';
    bracketStage.hidden = mode !== 'bracket';
    if (mode === 'random') {
      current = pickRandomN(entries, count);
      renderStage();
    } else if (mode === 'custom') {
      if (pickers.length !== count) rebuildPickers();
    } else if (mode === 'bracket') {
      if (!bracketRounds) resetBracket();
      renderBracket();
    }
  }
  randomButton.addEventListener('click', () => setMode('random'));
  customButton.addEventListener('click', () => setMode('custom'));
  bracketButton.addEventListener('click', () => setMode('bracket'));

  const modeToggle = document.createElement('div');
  modeToggle.className = 'duel-mode-toggle';
  modeToggle.append(randomButton, customButton, bracketButton);

  const toolbar = document.createElement('div');
  toolbar.className = 'duel-toolbar';
  toolbar.append(
    modeToggle,
    countControl,
    shuffleButton,
    duelButton,
    bracketShuffleButton,
    bracketRestartButton,
  );

  setMode('random');
  block.replaceChildren(toolbar, pickersWrap, stage, bracketStage);
}

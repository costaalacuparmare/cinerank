import fetchTmdbData from '../../scripts/tmdb.js';

const CATEGORIES = ['Plot', 'Filmography', 'Sound', 'Vibe'];

const BACK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></svg>';

const EDIT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';

const DA_ORG = 'costaalacuparmare';
const DA_REPO = 'cinerank';

/**
 * Builds a link straight to this page's editor in Document Authoring. Not a write
 * feature itself — it's just a deep link, so it needs no backend and no credentials
 * here. Only shown when a local "owner mode" flag is set, so visitors don't see a
 * button that would just prompt them to log into an account they don't have.
 * @returns {Element}
 */
function buildEditLink() {
  const edit = document.createElement('a');
  edit.href = `https://da.live/edit#/${DA_ORG}/${DA_REPO}${window.location.pathname}`;
  edit.target = '_blank';
  edit.rel = 'noopener';
  edit.className = 'movie-edit';
  edit.innerHTML = `${EDIT_ICON}<span>Edit in DA</span>`;
  return edit;
}

/**
 * Builds a "back to Library" link. Returns to the previous page via history
 * when it's same-origin (a real "back" from the grid or nav), otherwise
 * falls back to the landing page — covers direct URL visits with no history.
 * @returns {Element}
 */
function buildBackLink() {
  const back = document.createElement('a');
  back.href = '/';
  back.className = 'movie-back';
  back.innerHTML = `${BACK_ICON}<span>Back to Library</span>`;
  back.addEventListener('click', (e) => {
    let sameOriginReferrer = false;
    try {
      sameOriginReferrer = document.referrer
        && new URL(document.referrer).origin === window.location.origin;
    } catch {
      sameOriginReferrer = false;
    }
    if (sameOriginReferrer) {
      e.preventDefault();
      window.history.back();
    }
  });
  return back;
}

/**
 * Parses the 4 category score cells, matching on label text rather than
 * cell position so reordering the authored row doesn't break decoration.
 * @param {Element} row the row containing the 4 score cells
 * @returns {Object<string, number>} category name -> score
 */
function parseScores(row) {
  const scores = {};
  [...row.children].forEach((cell) => {
    const match = cell.textContent.trim().match(/^(\w+):\s*(\d+)/);
    if (!match) return;
    const [, label, value] = match;
    const category = CATEGORIES.find((c) => c.toLowerCase() === label.toLowerCase());
    if (category) scores[category] = Number(value);
  });
  return scores;
}

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
 * @param {number} value score value
 * @param {string} label category label ("Overall" for the mean)
 * @param {boolean} isMean whether this is the overall mean score chip
 * @returns {Element}
 */
function buildScoreChip(value, label, isMean) {
  const chip = document.createElement('div');
  chip.className = isMean ? 'movie-score movie-score-mean' : 'movie-score';
  const valueEl = document.createElement('span');
  valueEl.className = 'movie-score-value';
  valueEl.textContent = value;
  const labelEl = document.createElement('span');
  labelEl.className = 'movie-score-label';
  labelEl.textContent = label;
  chip.append(valueEl, labelEl);
  return chip;
}

/**
 * decorate the movie block
 * @param {Element} block the block
 */
export default async function decorate(block) {
  const [referenceRow, scoresRow, reviewRow] = [...block.children];

  const reference = referenceRow?.textContent.trim() || '';
  const scores = scoresRow ? parseScores(scoresRow) : {};
  const mean = computeMean(scores);
  const reviewText = reviewRow?.textContent.trim() || '';

  const tmdbData = await fetchTmdbData(reference);

  const poster = document.createElement('div');
  poster.className = 'movie-poster';
  if (tmdbData.poster) {
    const img = document.createElement('img');
    img.src = tmdbData.poster;
    img.alt = `${tmdbData.title} poster`;
    img.loading = 'lazy';
    poster.append(img);
  } else {
    poster.textContent = 'Poster unavailable';
  }

  const info = document.createElement('div');
  info.className = 'movie-info';

  const heading = document.createElement('h1');
  heading.textContent = tmdbData.title;
  info.append(heading);

  const metaParts = [];
  if (tmdbData.director) metaParts.push(`Directed by ${tmdbData.director}`);
  if (tmdbData.cast) metaParts.push(`Starring ${tmdbData.cast}`);
  if (tmdbData.year) metaParts.push(tmdbData.year);
  const meta = document.createElement('p');
  meta.className = 'movie-meta';
  meta.textContent = metaParts.length ? metaParts.join(' · ') : 'Director, cast, and year unavailable from TMDB.';
  info.append(meta);

  if (tmdbData.summary) {
    const summary = document.createElement('p');
    summary.className = 'movie-summary';
    summary.textContent = tmdbData.summary;
    info.append(summary);
  }

  const scoresWrapper = document.createElement('div');
  scoresWrapper.className = 'movie-scores';
  if (mean !== null) scoresWrapper.append(buildScoreChip(mean, 'Overall', true));
  CATEGORIES.forEach((category) => {
    if (typeof scores[category] === 'number') {
      scoresWrapper.append(buildScoreChip(scores[category], category, false));
    }
  });
  info.append(scoresWrapper);

  if (reviewText) {
    const review = document.createElement('div');
    review.className = 'movie-review';
    const reviewHeading = document.createElement('h2');
    reviewHeading.textContent = 'My Review';
    const reviewBody = document.createElement('p');
    reviewBody.textContent = reviewText;
    review.append(reviewHeading, reviewBody);
    info.append(review);
  }

  const content = document.createElement('div');
  content.className = 'movie-content';
  content.append(poster, info);

  const toolbar = document.createElement('div');
  toolbar.className = 'movie-toolbar';
  toolbar.append(buildBackLink());
  if (localStorage.getItem('cinerank-owner') === 'true') {
    toolbar.append(buildEditLink());
  }

  block.replaceChildren(toolbar, content);
}

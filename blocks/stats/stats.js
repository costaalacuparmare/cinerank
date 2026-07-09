const CATEGORIES = ['Plot', 'Filmography', 'Sound', 'Vibe'];
const GENRE_TAGS = ['cozy', 'unsettling', 'kinetic', 'tense', 'whimsical', 'bleak', 'epic', 'heartfelt', 'chaotic', 'dreamlike'];

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

  const rawTags = Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',');
  const tags = rawTags.map((tag) => tag.trim().toLowerCase())
    .filter((tag) => GENRE_TAGS.includes(tag));

  return {
    title: item.title,
    director: item.director || '',
    mean: computeMean(scores),
    scores,
    tags,
  };
}

/**
 * @param {Map<string, number>} counts value -> count
 * @returns {{value: string, count: number}[]} entries with the highest count, ties included
 */
function topEntries(counts) {
  const max = Math.max(...counts.values());
  return [...counts.entries()].filter(([, count]) => count === max)
    .map(([value, count]) => ({ value, count }));
}

/**
 * @param {string} label stat label
 * @param {string} value stat value, already formatted
 * @returns {Element}
 */
function buildStatCard(label, value) {
  const card = document.createElement('div');
  card.className = 'stats-card';
  const valueEl = document.createElement('p');
  valueEl.className = 'stats-card-value';
  valueEl.textContent = value;
  const labelEl = document.createElement('p');
  labelEl.className = 'stats-card-label';
  labelEl.textContent = label;
  card.append(valueEl, labelEl);
  return card;
}

/**
 * @param {Object[]} entries parsed library entries
 * @returns {Element}
 */
function buildDistribution(entries) {
  const buckets = new Map();
  for (let low = 0; low <= 10; low += 1) buckets.set(low, 0);
  entries.forEach((entry) => {
    if (entry.mean === null) return;
    const bucket = Math.min(10, Math.floor(entry.mean));
    buckets.set(bucket, buckets.get(bucket) + 1);
  });

  const max = Math.max(...buckets.values(), 1);

  const chart = document.createElement('div');
  chart.className = 'stats-distribution';
  [...buckets.entries()].forEach(([bucket, count]) => {
    const bar = document.createElement('div');
    bar.className = 'stats-bar';

    const fill = document.createElement('div');
    fill.className = 'stats-bar-fill';
    fill.style.setProperty('--stats-bar-pct', `${(count / max) * 100}%`);
    fill.title = `${count} movie${count === 1 ? '' : 's'} scored ${bucket}-${bucket + 1}`;
    if (count > 0) {
      const countLabel = document.createElement('span');
      countLabel.textContent = count;
      fill.append(countLabel);
    }
    bar.append(fill);

    const label = document.createElement('span');
    label.className = 'stats-bar-label';
    label.textContent = bucket;
    bar.append(label);

    chart.append(bar);
  });
  return chart;
}

/**
 * @param {string} title section title
 * @param {{value: string, count: number}[]} items entries to list
 * @param {string} unit label for the count, e.g. "movie"
 * @returns {Element}
 */
function buildTopList(title, items, unit) {
  const section = document.createElement('div');
  section.className = 'stats-top-list';

  const heading = document.createElement('h3');
  heading.className = 'stats-top-list-title';
  heading.textContent = title;
  section.append(heading);

  const list = document.createElement('ul');
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.value} (${item.count} ${unit}${item.count === 1 ? '' : 's'})`;
    list.append(li);
  });
  section.append(list);

  return section;
}

/**
 * decorate the stats block — a public "by the numbers" summary computed entirely from the
 * Library query-index, no separate authoring. Total movies, average score, top director(s),
 * top genre/vibe tag(s), a score distribution histogram, and the highest-rated movie(s).
 * @param {Element} block the block
 */
export default async function decorate(block) {
  const res = await fetch('/query-index.json');
  const { data } = res.ok ? await res.json() : { data: [] };
  const entries = data.map(parseIndexEntry).filter(Boolean);

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'stats-empty';
    empty.textContent = 'No movies in the Library yet.';
    block.replaceChildren(empty);
    return;
  }

  const means = entries.map((entry) => entry.mean).filter((value) => value !== null);
  const avgMean = means.length
    ? Math.round((means.reduce((sum, value) => sum + value, 0) / means.length) * 10) / 10
    : null;

  const directorCounts = new Map();
  entries.forEach((entry) => {
    if (!entry.director) return;
    directorCounts.set(entry.director, (directorCounts.get(entry.director) || 0) + 1);
  });

  const tagCounts = new Map();
  entries.forEach((entry) => entry.tags.forEach((tag) => {
    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  }));

  const exceptionalCount = entries.filter((entry) => entry.mean !== null && entry.mean > 10).length;

  const maxMean = Math.max(...means);
  const highestRated = entries.filter((entry) => entry.mean === maxMean);

  const cards = document.createElement('div');
  cards.className = 'stats-cards';
  cards.append(
    buildStatCard('Movies in the Library', String(entries.length)),
    buildStatCard('Average score', avgMean !== null ? String(avgMean) : '—'),
    buildStatCard('Exceptional (11)', String(exceptionalCount)),
    buildStatCard('Directors', String(directorCounts.size)),
  );

  const distributionHeading = document.createElement('h2');
  distributionHeading.className = 'stats-section-title';
  distributionHeading.textContent = 'Score distribution';
  const distribution = buildDistribution(entries);

  const lists = document.createElement('div');
  lists.className = 'stats-lists';
  if (directorCounts.size) {
    lists.append(buildTopList('Most-watched director', topEntries(directorCounts), 'movie'));
  }
  if (tagCounts.size) {
    lists.append(buildTopList('Most common vibe', topEntries(tagCounts), 'movie'));
  }
  lists.append(buildTopList(
    highestRated.length > 1 ? 'Highest rated (tied)' : 'Highest rated',
    highestRated.map((entry) => ({ value: entry.title, count: entry.mean })),
    'point',
  ));

  const mobileNavHint = document.createElement('p');
  mobileNavHint.className = 'stats-mobile-nav-hint';
  mobileNavHint.textContent = '☰ On a phone? Tap the menu icon above to browse Library, Duels, Backlog, and Calendar.';

  block.replaceChildren(mobileNavHint, cards, distributionHeading, distribution, lists);
}

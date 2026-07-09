const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * @param {Date} date a date with no meaningful time component
 * @returns {string} a short relative label, e.g. "in 5 days", "3 days ago", "today"
 */
function relativeLabel(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date - today) / DAY_MS);
  if (diffDays === 0) return 'today';
  if (diffDays > 0) return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  return `${-diffDays} day${diffDays === -1 ? '' : 's'} ago`;
}

/**
 * Reads one authored row into a plain data object.
 * @param {Element} row [title, date (YYYY-MM-DD), where (platform or venue)]
 * @returns {Object|null}
 */
function parseEntry(row) {
  const [titleCell, dateCell, whereCell] = [...row.children];
  const title = titleCell?.textContent.trim();
  const dateText = dateCell?.textContent.trim();
  if (!title || !dateText) return null;

  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  return {
    title,
    date,
    where: whereCell?.textContent.trim() || '',
  };
}

/**
 * @param {Object} entry parsed calendar entry
 * @returns {Element} the <li> row
 */
function buildRow(entry) {
  const li = document.createElement('li');
  li.className = 'calendar-row';
  if (entry.date < new Date().setHours(0, 0, 0, 0)) {
    li.classList.add('calendar-row-past');
  }

  const dateBlock = document.createElement('div');
  dateBlock.className = 'calendar-row-date';
  const day = document.createElement('span');
  day.className = 'calendar-row-day';
  day.textContent = entry.date.toLocaleDateString(undefined, { day: 'numeric' });
  const month = document.createElement('span');
  month.className = 'calendar-row-month';
  month.textContent = entry.date.toLocaleDateString(undefined, { month: 'short' });
  dateBlock.append(day, month);
  li.append(dateBlock);

  const info = document.createElement('div');
  info.className = 'calendar-row-info';

  const title = document.createElement('p');
  title.className = 'calendar-row-title';
  title.textContent = entry.title;
  info.append(title);

  const meta = document.createElement('p');
  meta.className = 'calendar-row-meta';
  meta.textContent = [entry.where, relativeLabel(entry.date)].filter(Boolean).join(' · ');
  info.append(meta);

  li.append(info);
  return li;
}

/**
 * decorate the calendar block — a public display of what you're planning to watch, when, and
 * where (a streaming platform, another online source, or a physical venue). Not an interactive
 * scheduler: authored directly on this page as rows, same pattern as Backlog. Sorted soonest
 * first; entries whose date has already passed are shown dimmed rather than hidden, since a
 * slipped plan is still useful to see.
 * @param {Element} block the block
 */
export default function decorate(block) {
  const entries = [...block.children].map(parseEntry).filter(Boolean)
    .sort((a, b) => a.date - b.date);

  const list = document.createElement('ul');
  list.className = 'calendar-list';

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'calendar-empty';
    empty.textContent = "Nothing planned yet — add a row on this page in DA when there's a movie and a date.";
    block.replaceChildren(empty);
    return;
  }

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'calendar-search';
  searchInput.placeholder = 'Search…';

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const visible = entries.filter((entry) => !query || entry.title.toLowerCase().includes(query));
    list.replaceChildren(...visible.map(buildRow));
  }

  searchInput.addEventListener('input', render);

  render();
  block.replaceChildren(searchInput, list);
}

const DAY_MS = 24 * 60 * 60 * 1000;
const STATUS_STORAGE_PREFIX = 'cinerank-calendar-status:';

/**
 * @param {Date} date a date with no meaningful time component
 * @returns {string} a short relative label, e.g. "in 5 days", "3 days ago", "today"
 */
function relativeLabel(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dateOnly - today) / DAY_MS);
  if (diffDays === 0) return 'today';
  if (diffDays > 0) return `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  return `${-diffDays} day${diffDays === -1 ? '' : 's'} ago`;
}

/**
 * @param {string} title entry title
 * @param {Date} date entry date
 * @returns {string} a stable localStorage key for this entry's owner-marked status
 */
function statusKey(title, date) {
  return `${STATUS_STORAGE_PREFIX}${title}|${date.toISOString()}`;
}

/**
 * Reads one authored row into a plain data object.
 * @param {Element} row [title, date ("YYYY-MM-DD" or "YYYY-MM-DD HH:MM"), where]
 * @returns {Object|null}
 */
function parseEntry(row) {
  const [titleCell, dateCell, whereCell] = [...row.children];
  const title = titleCell?.textContent.trim();
  const dateText = dateCell?.textContent.trim();
  if (!title || !dateText) return null;

  const [datePart, timePart] = dateText.split(/\s+/);
  const date = new Date(`${datePart}T${timePart || '00:00'}:00`);
  if (Number.isNaN(date.getTime())) return null;

  return {
    title,
    date,
    hasTime: Boolean(timePart),
    where: whereCell?.textContent.trim() || '',
    status: localStorage.getItem(statusKey(title, date)) || 'planned',
  };
}

/**
 * @param {Object} entry parsed calendar entry, mutated in place with the new status
 * @param {string} status "watched" or "missed"
 */
function setStatus(entry, status) {
  entry.status = status;
  localStorage.setItem(statusKey(entry.title, entry.date), status);
}

const STATUS_LABELS = {
  watched: '✓ Watched',
  missed: '✗ Missed',
};

/**
 * @param {Object} entry parsed calendar entry
 * @param {() => void} onChange called after the entry's status changes, to re-render
 * @returns {Element} the <li> row
 */
function buildRow(entry, onChange) {
  const li = document.createElement('li');
  li.className = 'calendar-row';
  const isPast = entry.date < new Date();
  if (isPast && entry.status === 'planned') li.classList.add('calendar-row-past');
  if (entry.status !== 'planned') li.classList.add(`calendar-row-${entry.status}`);

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
  if (STATUS_LABELS[entry.status]) {
    const badge = document.createElement('span');
    badge.className = `calendar-row-status-badge calendar-row-status-badge-${entry.status}`;
    badge.textContent = STATUS_LABELS[entry.status];
    title.append(' ', badge);
  }
  info.append(title);

  const meta = document.createElement('p');
  meta.className = 'calendar-row-meta';
  const timeLabel = entry.hasTime
    ? entry.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : '';
  meta.textContent = [timeLabel, entry.where, relativeLabel(entry.date)].filter(Boolean).join(' · ');
  info.append(meta);

  li.append(info);

  if (isPast && localStorage.getItem('cinerank-owner') === 'true') {
    const actions = document.createElement('div');
    actions.className = 'calendar-row-actions';

    const watchedButton = document.createElement('button');
    watchedButton.type = 'button';
    watchedButton.className = 'calendar-row-action';
    watchedButton.textContent = 'Watched it';
    watchedButton.addEventListener('click', () => {
      setStatus(entry, 'watched');
      onChange();
    });

    const missedButton = document.createElement('button');
    missedButton.type = 'button';
    missedButton.className = 'calendar-row-action';
    missedButton.textContent = "Didn't get to it";
    missedButton.addEventListener('click', () => {
      setStatus(entry, 'missed');
      onChange();
    });

    actions.append(watchedButton, missedButton);
    li.append(actions);
  }

  return li;
}

/**
 * decorate the calendar block — a public display of what you're planning to watch, when, and
 * where (a streaming platform, another online source, or a physical venue). Not an interactive
 * scheduler for visitors: authored directly on this page as rows, same pattern as Backlog.
 * Sorted soonest first; past entries are dimmed rather than hidden, since a slipped plan is
 * still useful to see. For the owner only (the same `cinerank-owner` localStorage flag "Edit in
 * DA" uses), past entries get "Watched it" / "Didn't get to it" buttons — this can't write back
 * to the authored content (no backend), so it's a personal, this-device-only status saved to
 * localStorage, not something visitors or other devices see.
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
    list.replaceChildren(...visible.map((entry) => buildRow(entry, render)));
  }

  searchInput.addEventListener('input', render);

  render();
  block.replaceChildren(searchInput, list);
}

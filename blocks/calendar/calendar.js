const STATUS_STORAGE_PREFIX = 'cinerank-calendar-status:';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const NEXT_STATUS = { planned: 'watched', watched: 'missed', missed: 'planned' };

/**
 * @param {number} n a number to zero-pad
 * @returns {string} n as a 2-digit string
 */
function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * @param {Date} date a local date/time
 * @returns {string} that date/time formatted for an iCalendar DTSTART/DTEND/DTSTAMP value
 */
function toIcsDate(date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}T${pad2(date.getHours())}${pad2(date.getMinutes())}00`;
}

/**
 * @param {string} text free text to embed in an iCalendar field
 * @returns {string} text with RFC 5545's required characters escaped
 */
function escapeIcsText(text) {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

/**
 * Builds a standalone .ics snapshot of the current plan — a one-time export, not a live-syncing
 * subscription (that would need a backend to keep regenerating it). Each entry becomes a 2-hour
 * placeholder event (movie runtimes aren't authored data here).
 * @param {Object[]} entries parsed calendar entries
 * @returns {string} the file contents
 */
function buildIcs(entries) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cinerank//Calendar//EN'];
  entries.forEach((entry, i) => {
    const end = new Date(entry.date.getTime() + (2 * 60 * 60 * 1000));
    lines.push(
      'BEGIN:VEVENT',
      `UID:cinerank-${i}-${entry.date.getTime()}@cinerank`,
      `DTSTAMP:${toIcsDate(new Date())}Z`,
      `DTSTART:${toIcsDate(entry.date)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${escapeIcsText(entry.title)}`,
    );
    if (entry.where) lines.push(`LOCATION:${escapeIcsText(entry.where)}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
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
 * @param {Date} date any date
 * @returns {string} a key identifying its calendar day, ignoring time
 */
function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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
 * @param {string} status "planned", "watched", or "missed"
 */
function setStatus(entry, status) {
  entry.status = status;
  localStorage.setItem(statusKey(entry.title, entry.date), status);
}

/**
 * @param {Object} entry parsed calendar entry
 * @param {() => void} onChange called after the entry's status changes, to re-render
 * @returns {Element}
 */
function buildEntryChip(entry, onChange) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = `calendar-chip calendar-chip-${entry.status}`;

  const label = document.createElement('span');
  label.className = 'calendar-chip-title';
  label.textContent = entry.title;
  chip.append(label);

  const timeLabel = entry.hasTime
    ? entry.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : '';
  chip.title = [timeLabel, entry.where].filter(Boolean).join(' · ') || entry.title;

  chip.addEventListener('click', () => {
    setStatus(entry, NEXT_STATUS[entry.status]);
    onChange();
  });

  return chip;
}

/**
 * @param {number} year full year
 * @param {number} month 0-indexed month
 * @param {Map<string, Object[]>} entriesByDay entries grouped by dayKey
 * @param {() => void} onChange called after a chip's status changes, to re-render
 * @returns {Element}
 */
function buildMonthGrid(year, month, entriesByDay, onChange) {
  const grid = document.createElement('div');
  grid.className = 'calendar-month-grid';

  WEEKDAYS.forEach((weekday) => {
    const head = document.createElement('div');
    head.className = 'calendar-weekday';
    head.textContent = weekday;
    grid.append(head);
  });

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < totalCells; i += 1) {
    const dayNum = i - startOffset + 1;
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';

    if (dayNum < 1 || dayNum > daysInMonth) {
      cell.classList.add('calendar-day-cell-outside');
    } else {
      const cellDate = new Date(year, month, dayNum);
      if (cellDate.getTime() === today.getTime()) cell.classList.add('calendar-day-cell-today');
      if (cellDate < today) cell.classList.add('calendar-day-cell-past');

      const dayLabel = document.createElement('span');
      dayLabel.className = 'calendar-day-number';
      dayLabel.textContent = String(dayNum);
      cell.append(dayLabel);

      const dayEntries = entriesByDay.get(dayKey(cellDate)) || [];
      dayEntries.forEach((entry) => cell.append(buildEntryChip(entry, onChange)));
    }

    grid.append(cell);
  }

  return grid;
}

/**
 * decorate the calendar block — a public month-grid display of what you're planning to watch,
 * when, and where (a streaming platform, another online source, or a physical venue). Not an
 * interactive scheduler for visitors: authored directly on this page as rows, same pattern as
 * Backlog. Clicking an entry cycles it through planned -> watched -> missed -> planned. This
 * can't write back to the authored content (no backend), so it's a this-device-only status
 * saved to localStorage, not something other visitors or devices see — anyone can play with it
 * on their own screen without affecting the real plan.
 * @param {Element} block the block
 */
export default function decorate(block) {
  const entries = [...block.children].map(parseEntry).filter(Boolean);

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'calendar-empty';
    empty.textContent = "Nothing planned yet — add a row on this page in DA when there's a movie and a date.";
    block.replaceChildren(empty);
    return;
  }

  const entriesByDay = new Map();
  entries.forEach((entry) => {
    const key = dayKey(entry.date);
    if (!entriesByDay.has(key)) entriesByDay.set(key, []);
    entriesByDay.get(key).push(entry);
  });

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  const monthLabel = document.createElement('span');
  monthLabel.className = 'calendar-month-label';

  const prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.className = 'calendar-nav-button';
  prevButton.textContent = '‹';
  prevButton.setAttribute('aria-label', 'Previous month');

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'calendar-nav-button';
  nextButton.textContent = '›';
  nextButton.setAttribute('aria-label', 'Next month');

  const todayButton = document.createElement('button');
  todayButton.type = 'button';
  todayButton.className = 'calendar-today-button';
  todayButton.textContent = 'Today';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'calendar-search';
  searchInput.placeholder = 'Search…';

  const gridWrap = document.createElement('div');
  gridWrap.className = 'calendar-grid-wrap';

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    entries.forEach((entry) => {
      const matches = Boolean(query) && entry.title.toLowerCase().includes(query);
      entry.highlighted = matches;
    });

    monthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    const grid = buildMonthGrid(viewYear, viewMonth, entriesByDay, render);
    if (query) {
      grid.querySelectorAll('.calendar-chip').forEach((chip) => {
        const title = chip.querySelector('.calendar-chip-title')?.textContent.toLowerCase() || '';
        chip.classList.toggle('calendar-chip-match', title.includes(query));
        chip.classList.toggle('calendar-chip-dimmed', !title.includes(query));
      });
    }
    gridWrap.replaceChildren(grid);
  }

  prevButton.addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    render();
  });
  nextButton.addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    render();
  });
  todayButton.addEventListener('click', () => {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    render();
  });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
      const firstMatch = entries.find((entry) => entry.title.toLowerCase().includes(query));
      if (firstMatch) {
        viewYear = firstMatch.date.getFullYear();
        viewMonth = firstMatch.date.getMonth();
      }
    }
    render();
  });

  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.className = 'calendar-export-button';
  exportButton.textContent = 'Export .ics';
  exportButton.title = 'Download the current plan as a calendar file (a one-time snapshot, not a live subscription)';
  exportButton.addEventListener('click', () => {
    const ics = buildIcs(entries);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cinerank-calendar.ics';
    link.click();
    URL.revokeObjectURL(url);
  });

  const monthNav = document.createElement('div');
  monthNav.className = 'calendar-nav-month';
  monthNav.append(prevButton, monthLabel, nextButton, todayButton, exportButton);

  const nav = document.createElement('div');
  nav.className = 'calendar-nav';
  nav.append(searchInput, monthNav);

  render();
  block.replaceChildren(nav, gridWrap);
}

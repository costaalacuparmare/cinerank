const STATUS_LABELS = {
  'to-watch': 'To watch',
  'needs-rewatch': 'Needs rewatch',
  'needs-ranking': 'Needs ranking',
};

/**
 * Reads one authored row into a plain data object.
 * @param {Element} row [title, status]
 * @returns {Object|null}
 */
function parseEntry(row) {
  const [titleCell, statusCell] = [...row.children];
  const title = titleCell?.textContent.trim();
  if (!title) return null;

  const status = statusCell?.textContent.trim().toLowerCase() || 'to-watch';
  return {
    title,
    status: STATUS_LABELS[status] ? status : 'to-watch',
  };
}

/**
 * @param {Object} entry parsed backlog entry
 * @returns {Element} the <li> row
 */
function buildRow(entry) {
  const li = document.createElement('li');
  li.className = 'backlog-row';

  const title = document.createElement('span');
  title.className = 'backlog-row-title';
  title.textContent = entry.title;
  li.append(title);

  const status = document.createElement('span');
  status.className = `backlog-row-status backlog-row-status-${entry.status}`;
  status.textContent = STATUS_LABELS[entry.status];
  li.append(status);

  return li;
}

/**
 * @param {string[]} statuses status keys to build tabs for, "all" first
 * @returns {Element}
 */
function buildStatusTabs(statuses) {
  const tabs = document.createElement('div');
  tabs.className = 'backlog-tabs';

  ['all', ...statuses].forEach((status) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'backlog-tab';
    button.dataset.status = status;
    button.textContent = status === 'all' ? 'All' : STATUS_LABELS[status];
    tabs.append(button);
  });

  return tabs;
}

/**
 * decorate the backlog block — a simple, filterable, searchable checklist of movies not yet
 * confidently in the Library: not-yet-watched, watched-but-needs-rewatch, or watched-but-
 * needs-ranking (the "All Time Favourites" placeholder-11 list). Authored directly on this
 * page as rows (unlike Library, these have no per-movie detail page — there's no score or
 * review to show yet).
 * @param {Element} block the block
 */
export default function decorate(block) {
  const entries = [...block.children].map(parseEntry).filter(Boolean);
  const statuses = [...new Set(entries.map((entry) => entry.status))];

  const list = document.createElement('ul');
  list.className = 'backlog-list';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'backlog-search';
  searchInput.placeholder = 'Search…';

  const tabs = buildStatusTabs(statuses);
  const count = document.createElement('p');
  count.className = 'backlog-count';
  let activeStatus = 'all';

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const visible = entries.filter((entry) => (
      (activeStatus === 'all' || entry.status === activeStatus)
      && (!query || entry.title.toLowerCase().includes(query))
    ));
    list.replaceChildren(...visible.map(buildRow));
    count.textContent = `${visible.length} movie${visible.length === 1 ? '' : 's'}`;
  }

  searchInput.addEventListener('input', render);
  tabs.addEventListener('click', (e) => {
    const button = e.target.closest('.backlog-tab');
    if (!button) return;
    activeStatus = button.dataset.status;
    [...tabs.children].forEach((tab) => tab.classList.toggle('is-active', tab === button));
    render();
  });
  tabs.querySelector('.backlog-tab').classList.add('is-active');

  const toolbar = document.createElement('div');
  toolbar.className = 'backlog-toolbar';
  toolbar.append(searchInput, tabs);

  render();
  block.replaceChildren(toolbar, count, list);
}

const filterPanel = document.querySelector('[data-archive-tools]');
const filters = filterPanel.querySelector('form');
const results = document.querySelector('[data-archive-status]');
const archiveList = document.querySelector('[data-archive-list]');
const years = archiveList.querySelectorAll('.writing-year');
const records = Array.from(archiveList.querySelectorAll('[data-archive-entry]'), (row) => {
  const date = row.dataset.archiveDate || row.querySelector('time')?.dateTime || '';
  const searchText = [row.textContent, row.dataset.archiveKeywords, date].join(' ');
  return { row, searchText: searchText.toLowerCase().replace(/\s+/g, ' ') };
});
const { query } = filters.elements;
const reset = filters.querySelector('[type="reset"]');

function updateRecords() {
  const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let matches = 0;

  for (const { row, searchText } of records) {
    const visible = terms.every((term) => searchText.includes(term));

    row.hidden = !visible;
    if (visible) matches += 1;
  }

  for (const year of years) {
    year.hidden = !year.querySelector('[data-archive-entry]:not([hidden])');
  }

  reset.disabled = !query.value;
  const count = results.dataset.countMessage.replace('{matches}', matches).replace('{total}', records.length);
  results.textContent = matches === 0 ? results.dataset.emptyMessage : terms.length > 0 || filterPanel.open ? count : '';
}

filters.addEventListener('input', updateRecords);
filters.addEventListener('submit', (event) => event.preventDefault());
filterPanel.addEventListener('toggle', updateRecords);
filters.addEventListener('reset', () => {
  requestAnimationFrame(() => {
    updateRecords();
    query.focus();
  });
});
filterPanel.hidden = false;
updateRecords();

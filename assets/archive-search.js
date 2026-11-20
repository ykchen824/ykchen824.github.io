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
const selects = Array.from(filters.querySelectorAll('select'));
const reset = filters.querySelector('[type="reset"]');

// Display order for the fixed vocabularies. Any other value sorts alphabetically after them.
const preferredOrder = {
  setting: ['线上部署', '受控评估', '模拟环境'],
  verification: ['已独立复现', '有公开原始记录', '有一手报告', '待核验'],
};

function sortValues(name, values) {
  const order = preferredOrder[name] || [];
  const rank = (value) => (order.includes(value) ? order.indexOf(value) : order.length);
  return Array.from(values).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'zh-CN'));
}

// Filter options come from the reports themselves, so a new category appears without touching this file.
for (const select of selects) {
  const values = new Set(records.map(({ row }) => row.dataset[select.name]).filter(Boolean));
  for (const value of sortValues(select.name, values)) select.add(new Option(value, value));
}

// A link such as /fails/?category=过度迎合 opens the list already filtered.
const params = new URLSearchParams(location.search);
for (const select of selects) {
  const value = params.get(select.name);
  if (value && Array.from(select.options).some((option) => option.value === value)) select.value = value;
}
if (params.get('q')) query.value = params.get('q');
if (selects.some((select) => select.value) || query.value) filterPanel.open = true;

function updateRecords() {
  const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const active = selects.filter((select) => select.value);
  let matches = 0;

  for (const { row, searchText } of records) {
    const visible = terms.every((term) => searchText.includes(term))
      && active.every((select) => row.dataset[select.name] === select.value);

    row.hidden = !visible;
    if (visible) matches += 1;
  }

  for (const year of years) {
    year.hidden = !year.querySelector('[data-archive-entry]:not([hidden])');
  }

  const filtering = terms.length > 0 || active.length > 0;
  reset.disabled = !query.value && active.length === 0;
  const count = results.dataset.countMessage.replace('{matches}', matches).replace('{total}', records.length);
  results.textContent = matches === 0 ? results.dataset.emptyMessage : filtering || filterPanel.open ? count : '';
}

filters.addEventListener('input', updateRecords);
filters.addEventListener('change', updateRecords);
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

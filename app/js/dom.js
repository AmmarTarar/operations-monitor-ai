export function clear(element) {
  element.replaceChildren();
}

export function element(tagName, { className, text, attributes = {} } = {}) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
}

export function renderTable(container, columns, rows, emptyMessage = 'No records to display.') {
  clear(container);
  if (rows.length === 0) {
    container.append(element('p', { className: 'empty-state', text: emptyMessage }));
    return;
  }
  const wrapper = element('div', { className: 'table-scroll' });
  const table = element('table');
  const headerRow = element('tr');
  columns.forEach((column) => headerRow.append(element('th', { text: column.label, attributes: { scope: 'col' } })));
  const head = element('thead');
  head.append(headerRow);
  table.append(head);

  const body = element('tbody');
  rows.forEach((row) => {
    const tableRow = element('tr');
    columns.forEach((column) => {
      const value = typeof column.value === 'function' ? column.value(row) : row[column.key];
      tableRow.append(element('td', { text: String(value ?? '') }));
    });
    body.append(tableRow);
  });
  table.append(body);
  wrapper.append(table);
  container.append(wrapper);
}

export function renderMessages(container, messages, className = 'message-list') {
  clear(container);
  if (messages.length === 0) return;
  const list = element('ul', { className });
  messages.forEach((message) => list.append(element('li', { text: message })));
  container.append(list);
}

export default class SortableTable {
  element;
  subElements = {};

  constructor(header = [], {data = []} = {}) {
    this.header = header;
    this.data = data

    this.render();
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.header.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow()}
      </div>
    `;
  }

  getHeaderSortingArrow() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item)}
        </a>`;
    }).join('');
  }

  getTableRow(item) {
    const cells = this.header.map(({id, template}) => {
      return {
        id, template
      };
    });

    return cells.map(({id, template}) => {
      return template ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `<div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
      </div>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);

    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortData(field, order) {
    const array = [...this.data];
    const column = this.header.find(item => item.id === field);
    const {sortType, customSorting} = column;
    const isAsc = order === 'asc' ? 1 : -1;

    return array.sort((a, b) => {
      switch (sortType) {
        case 'string':
          return isAsc * a[field].localeCompare(b[field], 'ru');
        case 'custom':
          return isAsc * customSorting(a, b);
        default:
          return isAsc * (a[field] - b[field]);
      }
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}


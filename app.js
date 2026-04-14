const API_URL = 'https://fakestoreapi.com/products';
const appRoot = document.getElementById('app');
const dom = {
  searchInput: null,
  clearButton: null,
  refreshButton: null,
  statusBanner: null,
  gridSection: null,
};

const state = {
  items: [],
  query: '',
  loading: false,
  error: null,
};

function createElement(tag, { className = '', text = '', html = '', attributes = {}, dataset = {} } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (html) element.innerHTML = html;
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  Object.entries(dataset).forEach(([key, value]) => {
    element.dataset[key] = value;
  });
  return element;
}

function debounce(fn, delay = 180) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

function setState(nextState) {
  Object.assign(state, nextState);
  updateUI();
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function truncate(text, maxLength) {
  const normalized = String(text || '');
  return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() + '…' : normalized;
}

function createHeader() {
  const header = createElement('section', { className: 'app-header' });
  header.appendChild(createElement('h1', { className: 'app-title', text: 'Browse trending products' }));
  header.appendChild(
    createElement('p', {
      className: 'app-description',
      text: 'Explore a curated list of products from a public dataset. Use the search bar to filter by title, category, or description and find the perfect item.',
    })
  );
  return header;
}

function createSearchPanel() {
  const panel = createElement('section', { className: 'search-panel' });
  const label = createElement('label', { className: 'search-label', text: 'Search products' });
  label.setAttribute('for', 'search-input');

  const searchInput = createElement('input', {
    className: 'search-input',
    attributes: {
      id: 'search-input',
      type: 'search',
      placeholder: 'Search by title, category, or description',
      autocomplete: 'off',
      'aria-label': 'Search products',
    },
  });

  const actions = createElement('div', { className: 'search-actions' });
  const clearButton = createElement('button', {
    className: 'button button--secondary',
    text: 'Clear',
    attributes: { type: 'button' },
  });
  const refreshButton = createElement('button', {
    className: 'button',
    text: 'Refresh products',
    attributes: { type: 'button' },
  });

  searchInput.addEventListener(
    'input',
    debounce((event) => {
      setState({ query: event.target.value.trim() });
    })
  );

  clearButton.addEventListener('click', () => {
    setState({ query: '' });
    searchInput.focus();
  });

  refreshButton.addEventListener('click', () => {
    loadProducts();
  });

  dom.searchInput = searchInput;
  dom.clearButton = clearButton;
  dom.refreshButton = refreshButton;

  actions.appendChild(clearButton);
  actions.appendChild(refreshButton);

  panel.appendChild(label);
  panel.appendChild(searchInput);
  panel.appendChild(actions);
  return panel;
}

function getFilteredItems() {
  if (!state.query) {
    return state.items;
  }

  const query = state.query.toLowerCase();
  return state.items.filter((item) => {
    const title = String(item.title || '');
    const category = String(item.category || '');
    const description = String(item.description || '');
    return [title, category, description].some((field) => field.toLowerCase().includes(query));
  });
}

function createItemCard(product) {
  const card = createElement('article', { className: 'item-card' });

  const imageWrapper = createElement('div', { className: 'item-image-wrapper' });
  const img = createElement('img', {
    className: 'item-image',
    attributes: {
      src: product.image || '',
      alt: product.title || 'Product image',
      loading: 'lazy',
    },
  });
  imageWrapper.appendChild(img);

  const body = createElement('div', { className: 'item-body' });
  const title = createElement('h2', { className: 'item-title', text: product.title || 'Untitled product' });
  const meta = createElement('div', {
    className: 'item-meta',
    html:
      '<span>' + (product.category || 'Unknown category') + '</span>' +
      '<span>' + formatPrice(product.price || 0) + '</span>',
  });
  const description = createElement('p', {
    className: 'item-description',
    text: truncate(product.description || 'No description available.', 120),
  });

  const footer = createElement('div', { className: 'item-footer' });
  const ratingValue = typeof product.rating?.rate === 'number' ? product.rating.rate.toFixed(1) : 'N/A';
  const ratingCount = typeof product.rating?.count === 'number' ? product.rating.count : '0';
  const rating = createElement('span', {
    className: 'item-rating',
    text: ratingValue + ' ★ (' + ratingCount + ')',
  });
  footer.appendChild(rating);

  body.appendChild(title);
  body.appendChild(meta);
  body.appendChild(description);
  body.appendChild(footer);

  card.appendChild(imageWrapper);
  card.appendChild(body);
  return card;
}

function createStatusBanner() {
  return createElement('div', {
    className: 'status-banner',
    attributes: { 'aria-live': 'polite', 'aria-atomic': 'true' },
  });
}

function createGridSection() {
  return createElement('section', { className: 'grid-panel' });
}

function createLoadingGrid(count) {
  const grid = createElement('div', { className: 'item-grid loading' });
  for (let index = 0; index < count; index += 1) {
    const card = createElement('article', { className: 'item-card skeleton' });
    card.appendChild(createElement('div', { className: 'item-image-wrapper skeleton-box' }));
    const body = createElement('div', { className: 'item-body' });
    body.appendChild(createElement('div', { className: 'skeleton-line skeleton-heading' }));
    body.appendChild(createElement('div', { className: 'skeleton-line' }));
    body.appendChild(createElement('div', { className: 'skeleton-line' }));
    body.appendChild(createElement('div', { className: 'skeleton-line skeleton-small' }));
    card.appendChild(body);
    grid.appendChild(card);
  }
  return grid;
}

function renderStatusBanner() {
  if (!dom.statusBanner) return;

  dom.statusBanner.className = 'status-banner';
  if (state.loading) {
    dom.statusBanner.innerHTML = '<span class="spinner" aria-hidden="true"></span><strong>Loading</strong> fetching products...';
    return;
  }

  if (state.error) {
    dom.statusBanner.classList.add('error-state');
    dom.statusBanner.innerHTML =
      '<strong>Unable to load items:</strong> ' +
      state.error +
      ' <button class="button button--secondary" type="button" id="retry-button">Retry</button>';

    const retryButton = dom.statusBanner.querySelector('#retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', loadProducts);
    }
    return;
  }

  const filtered = getFilteredItems();
  const count = filtered.length;
  dom.statusBanner.innerHTML =
    '<strong>' +
    count +
    '</strong> product' +
    (count === 1 ? '' : 's') +
    ' available' +
    (state.query ? ' for "' + state.query + '"' : '');
}

function renderItemGrid() {
  if (!dom.gridSection) return;

  dom.gridSection.innerHTML = '';
  if (state.loading) {
    dom.gridSection.appendChild(createLoadingGrid(8));
    return;
  }

  if (state.error) {
    dom.gridSection.appendChild(
      createElement('div', {
        className: 'error-state',
        text: 'Unable to show products while the API request failed. Try refreshing the list.',
      })
    );
    return;
  }

  const filtered = getFilteredItems();
  if (!filtered.length) {
    dom.gridSection.appendChild(
      createElement('div', {
        className: 'no-results',
        text: 'No products matched your search. Try a different keyword.',
      })
    );
    return;
  }

  const grid = createElement('div', { className: 'item-grid' });
  filtered.forEach((product) => grid.appendChild(createItemCard(product)));
  dom.gridSection.appendChild(grid);
}

function initializeApp() {
  if (!appRoot) return;

  appRoot.innerHTML = '';
  appRoot.appendChild(createHeader());
  appRoot.appendChild(createSearchPanel());
  dom.statusBanner = createStatusBanner();
  dom.gridSection = createGridSection();
  appRoot.appendChild(dom.statusBanner);
  appRoot.appendChild(dom.gridSection);
  updateUI();
}

function updateUI() {
  if (dom.searchInput) {
    dom.searchInput.value = state.query;
  }
  if (dom.clearButton) {
    dom.clearButton.disabled = !state.query;
  }
  renderStatusBanner();
  renderItemGrid();
}

async function loadProducts() {
  setState({ loading: true, error: null });

  try {
    const response = await fetch(API_URL, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('API returned ' + response.status);
    }

    const products = await response.json();
    if (!Array.isArray(products)) {
      throw new Error('Unexpected API response');
    }

    setState({ items: products, loading: false, error: null });
  } catch (error) {
    setState({ loading: false, error: error.message || 'Network error occurred' });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  loadProducts();
});
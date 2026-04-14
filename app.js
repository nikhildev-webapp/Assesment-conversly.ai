const API_URL = 'https://fakestoreapi.com/products';
const appRoot = document.getElementById('app');
const dom = {
  searchInput: null,
  statusBanner: null,
  gridSection: null,
};

const state = {
  items: [],
  query: '',
  loading: false,
  error: null,
};

function createElement(tag, { className = '', text = '', html = '', attributes = {} } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (html) element.innerHTML = html;
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

function setState(nextState) {
  Object.assign(state, nextState);
  updateUI();
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function createHeader() {
  const header = createElement('section', { className: 'app-header' });
  header.appendChild(createElement('h1', { className: 'app-title', text: 'Browse trending products' }));
  header.appendChild(
    createElement('p', {
      className: 'app-description',
      text: 'Explore a curated list of products from a public dataset. Use the search bar to filter by name, category, or description and discover items across categories.',
    })
  );
  return header;
}

function createSearchPanel() {
  const panel = createElement('section', { className: 'search-panel' });
  const searchLabel = createElement('label', { className: 'search-label', text: 'Search products' });
  searchLabel.setAttribute('for', 'search-input');

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
  searchInput.value = state.query;

  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim();
    setState({ query });
  });

  dom.searchInput = searchInput;
  panel.appendChild(searchLabel);
  panel.appendChild(searchInput);
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
    html: '<span>' + (product.category || 'Unknown category') + '</span><span>' + formatPrice(product.price || 0) + '</span>',
  });
  const description = createElement('p', {
    className: 'item-description',
    text: String(product.description || 'No description available.').slice(0, 120) + (product.description && product.description.length > 120 ? '…' : ''),
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

function renderStatusBanner() {
  if (!dom.statusBanner) return;

  dom.statusBanner.className = 'status-banner';
  if (state.loading) {
    dom.statusBanner.innerHTML = '<strong>Loading</strong> fetching products from the API...';
    return;
  }

  if (state.error) {
    dom.statusBanner.classList.add('error-state');
    dom.statusBanner.innerHTML = '<strong>Unable to load items:</strong> ' + state.error;
    return;
  }

  const filtered = getFilteredItems();
  dom.statusBanner.innerHTML = '<strong>' + filtered.length + '</strong> products available' + (state.query ? ' for "' + state.query + '"' : '');
}

function renderItemGrid() {
  if (!dom.gridSection) return;

  dom.gridSection.innerHTML = '';
  if (state.loading || state.error) {
    return;
  }

  const filteredItems = getFilteredItems();
  if (filteredItems.length === 0) {
    const emptyState = createElement('div', { className: 'no-results', text: 'No products matched your search. Try a different term.' });
    dom.gridSection.appendChild(emptyState);
    return;
  }

  const grid = createElement('div', { className: 'item-grid' });
  filteredItems.forEach((product) => grid.appendChild(createItemCard(product)));
  dom.gridSection.appendChild(grid);
}

function initializeApp() {
  if (!appRoot) return;

  appRoot.innerHTML = '';
  appRoot.appendChild(createHeader());
  appRoot.appendChild(createSearchPanel());

  dom.statusBanner = createElement('div', { className: 'status-banner' });
  dom.gridSection = createElement('section');

  appRoot.appendChild(dom.statusBanner);
  appRoot.appendChild(dom.gridSection);

  updateUI();
}

function updateUI() {
  if (dom.searchInput) {
    dom.searchInput.value = state.query;
  }
  renderStatusBanner();
  renderItemGrid();
}

async function loadProducts() {
  setState({ loading: true, error: null });

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('API error ' + response.status);
    }

    const products = await response.json();
    if (!Array.isArray(products)) {
      throw new Error('Unexpected API response');
    }

    setState({ items: products, loading: false });
  } catch (error) {
    setState({ loading: false, error: error.message || 'Network error occurred' });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  loadProducts();
});
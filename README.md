# Product Browser

A lightweight static product browser built with plain HTML, CSS, and JavaScript. It fetches product data from a public API and provides a searchable interface for browsing items by title, category, or description.

## Project Overview

This project implements a responsive product catalog UI using:

- `index.html` for the app shell
- `stylestyle.css` for responsive styling and layout
- `app.js` for state management, DOM rendering, and API communication

The app fetches data from the public Fake Store API and renders product cards with images, titles, pricing, categories, descriptions, and ratings.

## Features

- Fetches live product data from `https://fakestoreapi.com/products`
- Client-side search filtering by title, category, or description
- Responsive grid layout for desktop, tablet, and mobile
- Loading state, error handling, and empty search state
- Accessible search input with label and lazy-loaded product images

## Technologies Used

- Vanilla JavaScript
- HTML5
- CSS3
- Browser Fetch API
- Public API: Fake Store API

## Architecture and Design

### State Management

The app uses a simple centralized state object in `app.js`:

- `items`: fetched product list
- `query`: current search string
- `loading`: whether products are being loaded
- `error`: current error message, if any

State updates are handled through the `setState()` helper, which merges changes and triggers `updateUI()`.

### Component Structure

The app is composed of lightweight UI builders that create DOM nodes directly:

- `createHeader()` renders the app title and description
- `createSearchPanel()` renders the search input and updates state on user input
- `createItemCard(product)` renders each product card
- `renderStatusBanner()` displays loading, error, and item count status
- `renderItemGrid()` renders the filtered grid and handles empty states

This pattern keeps the application modular while avoiding any framework dependency.

### Data Flow

1. App initializes with `initializeApp()` and renders the static UI shell
2. `loadProducts()` fetches products from the API
3. On success, state is updated with `items`
4. On input changes, `query` is updated and `updateUI()` re-renders the filtered results

## Setup Instructions

### Option 1: Open locally

1. Clone or download the project folder
2. Open `index.html` in your browser

### Option 2: Run on a local server (recommended)

If you want a local server experience, run any simple static server. Examples:

- Using VS Code Live Server extension
- Using Python:
  ```bash
  python -m http.server 8000
  ```
- Using Node.js `http-server`:
  ```bash
  npx http-server .
  ```

Then open `http://localhost:8000` in your browser.

## File Structure

- `index.html` – entry point and root container
- `stylestyle.css` – styling for layout, cards, and responsive breakpoints
- `app.js` – application logic, state handling, fetch logic, and DOM rendering

## API Used

- Fake Store API: `https://fakestoreapi.com/products`

The app fetches a JSON array of product objects from this endpoint and renders them in the UI.

## Notes

- The source is intentionally framework-free to keep the implementation small and easy to customize.
- The search is performed entirely in the browser after the initial API fetch.
- Error handling displays a user-visible message if data cannot be loaded.

## Future Improvements

Potential enhancements:

- Add pagination or infinite scroll
- Add category filters or sort options
- Add product detail modal or routing
- Cache API results in `localStorage`

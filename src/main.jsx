// ============================================================
// Main Entry Point — Expense Tracker PWA
// ============================================================
// 1. Renders the React app into the DOM
// 2. Registers the service worker for PWA functionality
//    (caching, offline support, installability)
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Import the service worker registration module
import { registerServiceWorker } from './swRegistration';

// Mount the React application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register the service worker (PWA requirement)
// The SW file lives at /public/sw.js and will be served at /sw.js
registerServiceWorker();

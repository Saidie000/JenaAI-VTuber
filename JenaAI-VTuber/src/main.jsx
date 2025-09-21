import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Initialize IndexedDB
import { initDB } from './store/indexedDB.js';

// Initialize database before rendering app
initDB().then(() => {
  console.log('IndexedDB initialized successfully');
}).catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Application Entry Point
 * Purpose: Initializes the React application and renders the root App component
 * This is the main entry file that bootstraps the React application
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create root and render the App component with StrictMode for additional checks
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


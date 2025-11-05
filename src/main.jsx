// src/index.js (or index.jsx/main.jsx depending on your setup)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';

// main app.jsx code to get chatbot
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
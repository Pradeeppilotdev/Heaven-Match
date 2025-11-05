// src/App.jsx
import React from 'react';
import Chatbot from './components/Chat/Chatbot';
import './styles/main.css'; // Ensure main CSS is imported

// main app.jsx code to get chatbot
function App() {
  return (
    <div className="App">
      <main className="main-content">
        <Chatbot />
      </main>
    </div>
  );
}

export default App;
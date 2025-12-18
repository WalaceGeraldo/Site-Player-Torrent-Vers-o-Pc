import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import TorrentPlayer from './components/TorrentPlayer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <TorrentPlayer />
      </div>
    </Router>
  );
}

export default App;

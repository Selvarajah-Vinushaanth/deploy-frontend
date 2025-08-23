import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import page components
import HomePage from './pages/HomePage';
import MetaphorClassifier from './pages/MetaphorClassifier';
import LyricGenerator from './pages/LyricGenerator';
import MetaphorCreator from './pages/MetaphorCreator';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/metaphor-classifier" element={<MetaphorClassifier />} />
          <Route path="/lyric-generator" element={<LyricGenerator />} />
          <Route path="/metaphor-creator" element={<MetaphorCreator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

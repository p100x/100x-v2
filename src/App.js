import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import AccountPage from './pages/AccountPage';
import './App.css';

function App() {
  const [fiscalFlowsState, setFiscalFlowsState] = useState({ state: 'stable', timestamp: new Date().toISOString() });

  return (
    <Router>
      <div className="App">
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home fiscalFlowsState={fiscalFlowsState} setFiscalFlowsState={setFiscalFlowsState} />} />
            <Route path="/admin" element={<AdminPage fiscalFlowsState={fiscalFlowsState} setFiscalFlowsState={setFiscalFlowsState} />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AccountPage from './pages/AccountPage';
import LoginOverlay from './components/LoginOverlay';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
          <Route path="/account" element={user ? <AccountPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginOverlay />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
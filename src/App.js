import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import AccountPage from './pages/AccountPage';
import LoginOverlay from './components/LoginOverlay';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <div className="app">
      <div className="matrix-bg"></div>
      <Router>
        <div className="app-container">
          {user && (
            <nav className="menu-bar">
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/account">Account</Link></li>
                <li><Link to="/admin">Admin</Link></li>
              </ul>
            </nav>
          )}
          <div className={`app-container ${!user ? 'blurred' : ''}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Routes>
          </div>
          {!user && <LoginOverlay />}
        </div>
      </Router>
    </div>
  );
}

export default App;
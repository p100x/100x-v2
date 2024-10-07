import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import AccountPage from './pages/AccountPage';
import Portfolio from './pages/Portfolio';
import LoginOverlay from './components/LoginOverlay';
import { useAuth } from './contexts/AuthContext';
import EarningsCalendar from './components/EarningsCalendar';
import './App.css';
import Chat from './pages/Chat';
import Mastermind from './pages/Mastermind';

// Create a new ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || user.email !== 'max@max.de') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = '100X';
  const location = useLocation();

  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 200); // Adjust typing speed here
      return () => clearTimeout(timeout);
    }
  }, [typedText]);

  return (
    <>
      <div className="app-container">
        {user && (
          <nav className="menu-bar">
            <div className="app-name-container">
              <div className="logo-version-container">
                <div className="app-name">
                  {typedText}
                  <span className="cursor">|</span>
                </div>
                <div className="version-number">v0.0.9</div>
              </div>
              <div className="alpha-pill">alpha</div>
            </div>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li><Link to="/chat">Chat</Link></li>
              <li><Link to="/mastermind">Mastermind</Link></li>
              <li><Link to="/account">Account</Link></li>
              {user.email === 'max@max.de' && <li><Link to="/admin">Admin</Link></li>}
            </ul>
          </nav>
        )}
        <div className={`app-content ${!user ? 'blurred' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/mastermind" element={<Mastermind />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
        <LoginOverlay />
      </div>
      {user && (
        <button 
          className="calendar-toggle"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        >
          {isCalendarOpen ? 'Kalender schließen' : 'Kalender öffnen'}
        </button>
      )}
      <EarningsCalendar isOpen={isCalendarOpen} setIsOpen={setIsCalendarOpen} />
    </>
  );
}

function App() {
  return (
    <div className="app">
      <div className="matrix-bg"></div>
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
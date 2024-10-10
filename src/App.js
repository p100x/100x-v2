import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Hotjar from '@hotjar/browser';
import Home from './pages/Home';
import AdminPage from './pages/AdminPage';
import AccountPage from './pages/AccountPage';
import Portfolio from './pages/Portfolio';
import EarningsCalendar from './components/EarningsCalendar';
import './App.css';
import Chat from './pages/Chat';
import Mastermind from './pages/Mastermind';
import FeedbackModal from './components/FeedbackModal';
import OTPLogin from './components/OTPLogin';
import { supabase } from './supabaseClient';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import GoogleAnalytics from './components/GoogleAnalytics';

// Updated MobileMenu component
function MobileMenu({ typedText, onFeedbackClick, isAdmin }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="mobile-menu-container">
      <div className="mobile-menu-bar">
        <div className="mobile-app-name-container">
          <Link to="/" className="logo-link">
            <div className="logo-version-container">
              <div className="app-name">
                {typedText}
                <span className="cursor">|</span>
              </div>
              <div className="version-number">v0.1.0</div>
            </div>
            <div className="alpha-pill">alpha</div>
          </Link>
        </div>
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isOpen && (
        <nav className="mobile-menu">
          <ul>
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/portfolio" onClick={toggleMenu}>Portfolio</Link></li>
            <li><Link to="/chat" onClick={toggleMenu}>Chat</Link></li>
            <li><Link to="/mastermind" onClick={toggleMenu}>Mastermind</Link></li>
            <li><Link to="/account" onClick={toggleMenu}>Account</Link></li>
            {isAdmin && <li><Link to="/admin" onClick={toggleMenu}>Admin</Link></li>}
            <li><button onClick={() => { onFeedbackClick(); toggleMenu(); }}>Feedback</button></li>
          </ul>
        </nav>
      )}
    </div>
  );
}

function AppContent() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullText = '100X';
  const location = useLocation();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 200); // Adjust typing speed here
      return () => clearTimeout(timeout);
    }
  }, [typedText]);

  const isAdmin = session?.user?.email === '100x@maximilian.business';

  if (!session) {
    return <OTPLogin onLogin={setSession} />;
  }

  return (
    <>
      <div className="app-container">
        <nav className="menu-bar desktop-menu">
          <div className="app-name-container">
            <Link to="/" className="logo-link">
              <div className="logo-version-container">
                <div className="app-name">
                  {typedText}
                  <span className="cursor">|</span>
                </div>
                <div className="version-number">v0.1.0</div>
              </div>
              <div className="alpha-pill">alpha</div>
            </Link>
          </div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li><Link to="/mastermind">Mastermind</Link></li>
            <li><Link to="/account">Account</Link></li>
            {isAdmin && <li><Link to="/admin">Admin</Link></li>}
            <li><button onClick={() => setIsFeedbackModalOpen(true)}>Feedback</button></li>
          </ul>
        </nav>
        <MobileMenu typedText={typedText} onFeedbackClick={() => setIsFeedbackModalOpen(true)} isAdmin={isAdmin} />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/mastermind" element={<Mastermind />} />
            <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </div>
      {location.pathname === '/' && (
        <button 
          className="calendar-toggle"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        >
          {isCalendarOpen ? 'Kalender schließen' : 'Kalender öffnen'}
        </button>
      )}
      <EarningsCalendar isOpen={isCalendarOpen} setIsOpen={setIsCalendarOpen} />
      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
        userEmail={userEmail}
      />
    </>
  );
}

function App() {
  useEffect(() => {
    const siteId = 5166783;
    const hotjarVersion = 6;
    Hotjar.init(siteId, hotjarVersion);
  }, []);

  return (
    <SubscriptionProvider>
      <div className="app">
        <div className="matrix-bg"></div>
        <Router>
          <GoogleAnalytics />
          <AppContent />
        </Router>
      </div>
    </SubscriptionProvider>
  );
}

export default App;
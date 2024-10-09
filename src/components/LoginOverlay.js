import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginOverlay = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const { signIn, user, translations } = useAuth();
  const [typedText, setTypedText] = useState('');
  const fullText = '100X';

  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 200); // Adjust typing speed here
      return () => clearTimeout(timeout);
    }
  }, [typedText]);

  const handleSendLoginLink = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    try {
      const { error } = await signIn(email);
      if (error) throw error;
      setMessage(translations.checkEmail);
    } catch (error) {
      console.error('Anmeldefehler:', error);
      setError(error.message);
    }
  };

  if (user) {
    return null; // Don't render anything if user is logged in
  }

  return (
    <div className="login-overlay">
      <div className="login-form-container">
        <div className="app-name-container">
          <div className="logo-version-container">
            <div className="app-name">
              {typedText}
              <span className="cursor">|</span>
            </div>
            <div className="version-number">v0.0.9</div>
          </div>
          <div className="alpha-pill">{translations.alpha}</div>
        </div>
        <form onSubmit={handleSendLoginLink}>
          <input
            type="email"
            placeholder={translations.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">{translations.sendLoginLink}</button>
        </form>
        {error && <p className="error">{error}</p>}
        {message && (
          <div className="data-card" style={{ marginTop: '1rem', backgroundColor: 'rgba(57, 255, 20, 0.1)' }}>
            <div className="data-card-content">
              <div className="data-card-interpretation">
                <p style={{ color: 'var(--highlight)', fontWeight: 'bold' }}>{message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginOverlay;
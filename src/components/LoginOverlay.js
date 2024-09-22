import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginOverlay = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const { signIn, user } = useAuth();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email);
    } catch (error) {
      console.error('Login error:', error);
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
          <div className="alpha-pill">alpha</div>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginOverlay;
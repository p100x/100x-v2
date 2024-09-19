import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginOverlay = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const { signIn, user } = useAuth();

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
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
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
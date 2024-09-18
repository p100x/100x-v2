import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginOverlay = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('Login attempt with email:', email);

    try {
      const user = await signIn(email);
      console.log('SignIn function completed', user);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

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
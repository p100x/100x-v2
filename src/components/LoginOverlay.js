import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginOverlay = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { signIn, verifyOtp, user } = useAuth();
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    try {
      const { error } = await signIn(email);
      if (error) throw error;
      setIsOtpSent(true);
      setMessage('Check your email for the login link or OTP!');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    try {
      const { error } = await verifyOtp(email, otp);
      if (error) throw error;
      setMessage('Login successful!');
    } catch (error) {
      console.error('OTP verification error:', error);
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
        {!isOtpSent ? (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">Verify OTP</button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default LoginOverlay;
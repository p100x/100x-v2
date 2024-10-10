import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function OTPLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [error, setError] = useState(null);
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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      console.log('OTP Response:', data, error);
      if (error) {
        console.error('Detailed error:', error);
        setError(`Error: ${error.message}. Code: ${error.code}`);
      } else {
        setStep('otp');
      }
    } catch (err) {
      console.error('Unexpected OTP Error:', err);
      setError(`Unexpected error: ${err.message}`);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    if (error) {
      setError(error.message);
    } else if (data.session) {
      onLogin(data.session);
    }
  };

  return (
    <div className="otp-login-overlay">
      <div className="otp-login-container">
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
        {error && <p className="error">{error}</p>}
        {step === 'email' ? (
          <form onSubmit={handleSendOTP}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Emailadresse eingeben"
              required
            />
            <button type="submit" className="otp-button">Code senden</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Code eingeben"
              required
            />
            <button type="submit" className="otp-button">Code verifzieren</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OTPLogin;
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function OTPLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [error, setError] = useState(null);

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
        <h2>Login to 100X</h2>
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
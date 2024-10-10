import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

const AccountPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { subscription } = useSubscription();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="account-page">
      <h1>Kontoinformationen</h1>
      <div className="account-info">
        <p><strong>E-Mail:</strong> {email}</p>
        <p><strong>Abonnementstatus:</strong> {subscription ? subscription.subscription_status : 'Kein Abonnement'}</p>
        {subscription && subscription.subscription_type && (
          <p><strong>Abonnementtyp:</strong> {subscription.subscription_type}</p>
        )}
        {subscription && subscription.end_date && (
          <p><strong>Abonnement-Enddatum:</strong> {new Date(subscription.end_date).toLocaleDateString('de-DE')}</p>
        )}
      </div>
      <div className="account-actions">
        <Link to="/upgrade" className="upgrade-button">Abonnement upgraden</Link>
        <button onClick={handleLogout} className="logout-button">Abmelden</button>
      </div>
    </div>
  );
};

export default AccountPage;
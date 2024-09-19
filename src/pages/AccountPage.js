import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient'; // Make sure this import is correct

const AccountPage = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (user && !user.is_active) {
        try {
          const { data, error } = await supabase
            .from('user_data')
            .select('is_active')
            .eq('email', user.email)
            .single();

          if (error) {
            throw error;
          } else if (data) {
            user.is_active = data.is_active;
          }
        } catch (error) {
          setError('Error fetching user status: ' + error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      setError('Error signing out: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user logged in</div>;

  const isActive = user?.is_active === 'yes' || user?.is_active === true;

  return (
    <div className="account-page">
      <h1>Account Management</h1>
      <div className="account-info">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Account Status:</strong> {isActive ? 'Active' : 'Inactive'}</p>
        <p><strong>Raw is_active value:</strong> {JSON.stringify(user?.is_active)}</p>
        <p><strong>User object:</strong> {JSON.stringify(user)}</p>
      </div>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default AccountPage;
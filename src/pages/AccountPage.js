import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AccountPage = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="account-page">
      <h1>Account Management</h1>
      <div className="account-info">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Account Status:</strong> {user?.is_active ? 'Active' : 'Inactive'}</p>
      </div>
      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default AccountPage;
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AccountPage = () => {
  const { user, signOut } = useAuth();

  // If there's no user, redirect to the home page or login page
  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="account-page">
      <h1>Account Information</h1>
      <div className="account-info">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Account Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
      </div>
      <div className="account-actions">
        <button className="button button-danger" onClick={signOut}>Log Out</button>
      </div>
    </div>
  );
};

export default AccountPage;
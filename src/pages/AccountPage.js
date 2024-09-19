import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AccountPage = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="account-page">
      <h1>Account Information</h1>
      <div className="account-info">
        <p><strong>Email:</strong> {user.email}</p>
        {/* Add other user information here */}
      </div>
      <div className="account-actions">
        <button className="button button-danger" onClick={signOut}>Log Out</button>
      </div>
    </div>
  );
};

export default AccountPage;
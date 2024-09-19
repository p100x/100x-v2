import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateFiscalFlows, fetchFiscalFlows } from '../services/marketDataService';

const AdminPage = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadCurrentState = async () => {
      try {
        const state = await fetchFiscalFlows();
        setCurrentState(state);
      } catch (error) {
        console.error('Error fetching fiscal flows:', error);
        setMessage('Error fetching current state');
      }
    };

    loadCurrentState();
  }, []);

  const handleStateChange = async (newState) => {
    try {
      await updateFiscalFlows(newState);
      setCurrentState(newState);
      setMessage(`Fiscal flows updated to: ${newState}`);
    } catch (error) {
      console.error('Error updating fiscal flows:', error);
      setMessage(`Error updating fiscal flows: ${error.message}`);
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      <div className="admin-section">
        <h2>Fiscal Flows Controls</h2>
        <div className="admin-controls">
          <button onClick={() => handleStateChange('decreasing')}>Set Decreasing</button>
          <button onClick={() => handleStateChange('increasing')}>Set Increasing</button>
          <button onClick={() => handleStateChange('stable')}>Set Stable</button>
        </div>
        {currentState && <p>Current state: {currentState}</p>}
        {message && <p>{message}</p>}
      </div>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

export default AdminPage;
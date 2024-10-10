import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateFiscalFlows, fetchFiscalFlows, addEarningsCall, fetchLatestEarningsCalls, deleteEarningsCall } from '../services/marketDataService';
import ReactMarkdown from 'react-markdown';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState('');
  const [message, setMessage] = useState('');
  const [earningsCalls, setEarningsCalls] = useState([]);
  const [newEarningsCall, setNewEarningsCall] = useState({
    company: '',
    date: '',
    summary: '',
    context: '',
    stock_response: '',
    interpretation: '',
    company_info: ''
  });
  const [showContextPreview, setShowContextPreview] = useState(false);

  useEffect(() => {
    loadCurrentState();
    loadEarningsCalls();
  }, []);

  const loadCurrentState = async () => {
    try {
      const state = await fetchFiscalFlows();
      setCurrentState(state);
    } catch (error) {
      console.error('Error fetching fiscal flows:', error);
      setMessage('Error fetching current state');
    }
  };

  const loadEarningsCalls = async () => {
    try {
      const calls = await fetchLatestEarningsCalls();
      setEarningsCalls(calls);
    } catch (error) {
      console.error('Error fetching earnings calls:', error);
      setMessage('Error fetching earnings calls');
    }
  };

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

  const handleEarningsCallChange = (e) => {
    setNewEarningsCall({ ...newEarningsCall, [e.target.name]: e.target.value });
  };

  const handleAddEarningsCall = async (e) => {
    e.preventDefault();
    try {
      await addEarningsCall(newEarningsCall);
      setMessage('Earnings call added successfully');
      setNewEarningsCall({
        company: '',
        date: '',
        summary: '',
        context: '',
        stock_response: '',
        interpretation: '',
        company_info: ''
      });
      loadEarningsCalls();
    } catch (error) {
      console.error('Error adding earnings call:', error);
      setMessage(`Error adding earnings call: ${error.message}`);
    }
  };

  const handleDeleteEarningsCall = async (id) => {
    try {
      await deleteEarningsCall(id);
      setMessage('Earnings call deleted successfully');
      loadEarningsCalls();
    } catch (error) {
      console.error('Error deleting earnings call:', error);
      setMessage(`Error deleting earnings call: ${error.message}`);
    }
  };

  const insertMarkdown = (tag) => {
    const textarea = document.getElementById('context');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    let newText;
    switch (tag) {
      case 'bold':
        newText = `${beforeText}**${selectedText}**${afterText}`;
        break;
      case 'italic':
        newText = `${beforeText}*${selectedText}*${afterText}`;
        break;
      case 'ul':
        newText = `${beforeText}\n- ${selectedText}${afterText}`;
        break;
      case 'ol':
        newText = `${beforeText}\n1. ${selectedText}${afterText}`;
        break;
      default:
        newText = text;
    }

    setNewEarningsCall({ ...newEarningsCall, context: newText });
  };

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>
      
      <div className="grid-container">
        <div className="fiscal-flows">
          <h2>Fiscal Flows Controls</h2>
          <div className="button-group">
            <button onClick={() => handleStateChange('decreasing')}>Set Decreasing</button>
            <button onClick={() => handleStateChange('increasing')}>Set Increasing</button>
            <button onClick={() => handleStateChange('stable')}>Set Stable</button>
          </div>
          {currentState && <p>Current state: <span>{currentState}</span></p>}
          {message && <p className="message">{message}</p>}
        </div>

        <div className="recent-calls">
          <h2>Recent Earnings Calls</h2>
          <ul>
            {earningsCalls.map((call) => (
              <li key={call.id}>
                <span>{call.company} - {new Date(call.date).toLocaleDateString()}</span>
                <button onClick={() => handleDeleteEarningsCall(call.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      
        <form onSubmit={handleAddEarningsCall} className="add-earnings-call">
          <h2>Add New Earnings Call</h2>
          
          <div className="form-group">
            <label htmlFor="company">Company:</label>
            <input
              id="company"
              type="text"
              name="company"
              value={newEarningsCall.company}
              onChange={handleEarningsCallChange}
              placeholder="Company"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              id="date"
              type="date"
              name="date"
              value={newEarningsCall.date}
              onChange={handleEarningsCallChange}
              required
            />
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="summary">Summary:</label>
            <textarea
              id="summary"
              name="summary"
              value={newEarningsCall.summary}
              onChange={handleEarningsCallChange}
              placeholder="Summary"
              required
            />
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="context">Context (Markdown supported):</label>
            <div className="markdown-buttons">
              <button type="button" onClick={() => insertMarkdown('bold')}><Bold size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('italic')}><Italic size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('ul')}><List size={16} /></button>
              <button type="button" onClick={() => insertMarkdown('ol')}><ListOrdered size={16} /></button>
            </div>
            <textarea
              id="context"
              name="context"
              value={newEarningsCall.context}
              onChange={handleEarningsCallChange}
              placeholder="Context (Markdown supported)"
            />
            <button type="button" onClick={() => setShowContextPreview(!showContextPreview)}>
              {showContextPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            {showContextPreview && (
              <div className="context-preview">
                <h4>Context Preview:</h4>
                <ReactMarkdown>{newEarningsCall.context}</ReactMarkdown>
              </div>
            )}
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="stock_response">Stock Response:</label>
            <textarea
              id="stock_response"
              name="stock_response"
              value={newEarningsCall.stock_response}
              onChange={handleEarningsCallChange}
              placeholder="Stock Response"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="interpretation">Interpretation:</label>
            <select
              id="interpretation"
              name="interpretation"
              value={newEarningsCall.interpretation}
              onChange={handleEarningsCallChange}
              required
            >
              <option value="">Select an interpretation</option>
              <option value="bullish">Bullish</option>
              <option value="bearish">Bearish</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="company_info">Company Info:</label>
            <textarea
              id="company_info"
              name="company_info"
              value={newEarningsCall.company_info}
              onChange={handleEarningsCallChange}
              placeholder="Brief description of the company (1-2 sentences)"
            />
          </div>
          
          <button type="submit" className="submit-button">Add Earnings Call</button>
        </form>
      </div>
      
      <button onClick={() => navigate('/')} className="back-button">Back to Home</button>
    </div>
  );
};

export default AdminPage;
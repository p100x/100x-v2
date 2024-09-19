// src/pages/Home.js
import React, { useState } from 'react';
import VixComponent from '../components/VixComponent';
import AAIIComponent from '../components/AAIIComponent'; // Import the new AAII component
import SummaryComponent from '../components/SummaryComponent';
import MarketScoreComponent from '../components/MarketScoreComponent'; // Added import
import UnemploymentComponent from '../components/UnemploymentComponent'; // Added import
import FiscalFlowsComponent from '../components/FiscalFlowsComponent'; // Added import
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [filter, setFilter] = useState('all');
  const [fiscalFlowsState, setFiscalFlowsState] = useState({ state: 'stable', timestamp: new Date().toISOString() });

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const navigate = useNavigate();

  return (
    <div>
      <h1>Market Data Overview</h1>
      <div>
        <label htmlFor="category-filter">Filter by category: </label>
        <select id="category-filter" value={filter} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="summary">Summary</option>
          <option value="volatility">Volatility</option>
          <option value="sentiment">Sentiment</option>
          <option value="labor">Labor Market</option> {/* Added option */}
          <option value="fiscal">Fiscal Flows</option> {/* Added option */}
        </select>
      </div>
      {(filter === 'all' || filter === 'summary') && <SummaryComponent />}
      {(filter === 'all' || filter === 'volatility') && <VixComponent />}
      {(filter === 'all' || filter === 'sentiment') && <AAIIComponent />}
      {(filter === 'all' || filter === 'labor') && <UnemploymentComponent />} {/* Added UnemploymentComponent */}
      {(filter === 'all' || filter === 'fiscal') && <FiscalFlowsComponent setFiscalFlowsState={setFiscalFlowsState} />}
      <MarketScoreComponent fiscalFlowsState={fiscalFlowsState.state} /> {/* Added MarketScoreComponent */}
      <Link to="/admin">Admin Panel</Link>
      <Link to="/account">Account Page</Link>  {/* Add this line */}
    </div>
  );
};

export default Home;

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
  const [activeFilters, setActiveFilters] = useState(['all']);

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'summary', label: 'Summary' },
    { id: 'volatility', label: 'Volatility' },
    { id: 'sentiment', label: 'Sentiment' },
    { id: 'labor', label: 'Labor Market' },
    { id: 'fiscal', label: 'Fiscal Flows' },
  ];

  const handleFilterClick = (filterId) => {
    setActiveFilters((prevFilters) => {
      if (filterId === 'all') {
        return ['all'];
      } else {
        const newFilters = prevFilters.filter((f) => f !== 'all');
        if (newFilters.includes(filterId)) {
          return newFilters.filter((f) => f !== filterId);
        } else {
          return [...newFilters, filterId];
        }
      }
    });
  };

  const isFilterActive = (filterId) => activeFilters.includes(filterId);

  const [fiscalFlowsState, setFiscalFlowsState] = useState({ state: 'stable', timestamp: new Date().toISOString() });

  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>Market Data Overview</h1>
      <div className="filter-container">
        {filterOptions.map((filter) => (
          <button
            key={filter.id}
            className={`filter-chip ${isFilterActive(filter.id) ? 'active' : ''} ${filter.id === 'all' ? 'all' : ''}`}
            onClick={() => handleFilterClick(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {(isFilterActive('all') || isFilterActive('summary')) && <SummaryComponent />}
      {(isFilterActive('all') || isFilterActive('volatility')) && <VixComponent />}
      {(isFilterActive('all') || isFilterActive('sentiment')) && <AAIIComponent />}
      {(isFilterActive('all') || isFilterActive('labor')) && <UnemploymentComponent />}
      {(isFilterActive('all') || isFilterActive('fiscal')) && <FiscalFlowsComponent setFiscalFlowsState={setFiscalFlowsState} />}
      <MarketScoreComponent fiscalFlowsState={fiscalFlowsState.state} />
    </div>
  );
};

export default Home;

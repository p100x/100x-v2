import React, { useState, useEffect } from 'react';
import VixComponent from '../components/VixComponent';
import AAIIComponent from '../components/AAIIComponent'; // Import the new AAII component
import SummaryComponent from '../components/SummaryComponent';
import MarketScoreComponent from '../components/MarketScoreComponent'; // Added import
import UnemploymentComponent from '../components/UnemploymentComponent'; // Added import
import FiscalFlowsComponent from '../components/FiscalFlowsComponent'; // Added import
import M2MoneyGrowthComponent from '../components/M2MoneyGrowthComponent'; // Add this import
import CreditCardDelinquencyComponent from '../components/CreditCardDelinquencyComponent'; // Add this import
import PersonalSavingRateComponent from '../components/PersonalSavingRateComponent'; // Add this import
import { useMediaQuery } from 'react-responsive';
import Spinner from '../components/Spinner'; // We'll create this component

const Home = () => {
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [fiscalFlowsState, setFiscalFlowsState] = useState({ state: 'stable', timestamp: new Date().toISOString() });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'summary', label: 'Summary' },
    { id: 'volatility', label: 'Volatility' },
    { id: 'sentiment', label: 'Sentiment' },
    { id: 'labor', label: 'Labor Market' },
    { id: 'fiscal', label: 'Fiscal Flows' },
    { id: 'economic', label: 'Economic Indicators' }, // Add this new filter option
    { id: 'consumer', label: 'Consumer Credit' }, // Add this new filter option
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
    if (isMobile) {
      setIsFilterMenuOpen(false);
    }
  };

  const isFilterActive = (filterId) => activeFilters.includes(filterId);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsFilterMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Simulate loading time (remove this in production)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page">
      <h1>Market Data Overview</h1>
      <div className="filter-container">
        {isMobile ? (
          <>
            <button
              className="filter-menu-toggle"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            >
              {isFilterMenuOpen ? 'Close Filters' : 'Open Filters'}
            </button>
            {isFilterMenuOpen && (
              <div className="filter-menu">
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
            )}
          </>
        ) : (
          filterOptions.map((filter) => (
            <button
              key={filter.id}
              className={`filter-chip ${isFilterActive(filter.id) ? 'active' : ''} ${filter.id === 'all' ? 'all' : ''}`}
              onClick={() => handleFilterClick(filter.id)}
            >
              {filter.label}
            </button>
          ))
        )}
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="components-grid">
          {(isFilterActive('all') || isFilterActive('summary')) && <SummaryComponent />}
          {(isFilterActive('all') || isFilterActive('volatility')) && <VixComponent />}
          {(isFilterActive('all') || isFilterActive('sentiment')) && <AAIIComponent />}
          {(isFilterActive('all') || isFilterActive('labor')) && <UnemploymentComponent />}
          {(isFilterActive('all') || isFilterActive('fiscal')) && <FiscalFlowsComponent setFiscalFlowsState={setFiscalFlowsState} />}
          {(isFilterActive('all') || isFilterActive('economic')) && (
            <>
              <M2MoneyGrowthComponent />
              <PersonalSavingRateComponent /> {/* Add this line */}
            </>
          )}
          {(isFilterActive('all') || isFilterActive('consumer')) && <CreditCardDelinquencyComponent />}
        </div>
      )}
      <MarketScoreComponent fiscalFlowsState={fiscalFlowsState.state} />
    </div>
  );
};

export default Home;

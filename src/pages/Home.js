import React, { useState } from 'react';
import VixComponent from '../components/VixComponent';
import AAIIComponent from '../components/AAIIComponent';
import SummaryComponent from '../components/SummaryComponent';
import MarketScoreComponent from '../components/MarketScoreComponent';
import UnemploymentComponent from '../components/UnemploymentComponent';
import FiscalFlowsComponent from '../components/FiscalFlowsComponent';
import M2MoneyGrowthComponent from '../components/M2MoneyGrowthComponent';
import CreditCardDelinquencyComponent from '../components/CreditCardDelinquencyComponent';
import PersonalSavingRateComponent from '../components/PersonalSavingRateComponent';
import EarningsCallComponent from '../components/EarningsCallComponent';
import RecessionIndicatorComponent from '../components/RecessionIndicatorComponent';
import { useMediaQuery } from 'react-responsive';

const Home = () => {
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [fiscalFlowsState, setFiscalFlowsState] = useState({ state: 'stable', timestamp: new Date().toISOString() });

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'summary', label: 'Summary' },
    { id: 'volatility', label: 'Volatility' },
    { id: 'sentiment', label: 'Sentiment' },
    { id: 'labor', label: 'Labor Market' },
    { id: 'fiscal', label: 'Fiscal Flows' },
    { id: 'economic', label: 'Economic Indicators' },
    { id: 'consumer', label: 'Consumer Credit' },
    { id: 'earnings', label: 'Earnings Calls' },
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

  return (
    <div className="home-page">
      <br />
      <div className="components-grid">
        {(isFilterActive('all') || isFilterActive('summary')) && <SummaryComponent />}
        {(isFilterActive('all') || isFilterActive('summary')) && <RecessionIndicatorComponent />}
        {(isFilterActive('all') || isFilterActive('earnings')) && <EarningsCallComponent />}
        {(isFilterActive('all') || isFilterActive('volatility')) && <VixComponent />}
        {(isFilterActive('all') || isFilterActive('sentiment')) && <AAIIComponent />}
        {(isFilterActive('all') || isFilterActive('labor')) && <UnemploymentComponent />}
        {(isFilterActive('all') || isFilterActive('fiscal')) && <FiscalFlowsComponent setFiscalFlowsState={setFiscalFlowsState} />}
        {(isFilterActive('all') || isFilterActive('economic')) && (
          <>
            <M2MoneyGrowthComponent />
            <PersonalSavingRateComponent />
          </>
        )}
        {(isFilterActive('all') || isFilterActive('consumer')) && <CreditCardDelinquencyComponent />}
      </div>
      <MarketScoreComponent fiscalFlowsState={fiscalFlowsState.state} />
    </div>
  );
};

export default Home;

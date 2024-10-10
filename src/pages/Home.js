import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
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
import Liquiditatsindikator from '../components/Liquiditatsindikator';

const Home = () => {
  const { subscription } = useSubscription();
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
    { id: 'liquidity', label: 'Liquidity' },
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

  const hasActiveSubscription = subscription && subscription.subscription_status === 'active';

  return (
    <div className="home-page">
      {!hasActiveSubscription && (
        <div className="upgrade-overlay">
          <div className="upgrade-message">
            <h2>Upgrade erforderlich</h2>
            <p>Um auf alle Funktionen zugreifen zu können, benötigen Sie ein aktives Abonnement.</p>
            <a href="https://projekt100x.de/mitgliedschaft-waehlen/" className="upgrade-button">Jetzt upgraden</a>
          </div>
        </div>
      )}
      <div className={`components-grid ${!hasActiveSubscription ? 'blurred' : ''}`}>
        {(isFilterActive('all') || isFilterActive('summary')) && <SummaryComponent />}
        {(isFilterActive('all') || isFilterActive('liquidity')) && <Liquiditatsindikator />}
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
        <MarketScoreComponent fiscalFlowsState={fiscalFlowsState.state} />
      </div>
    </div>
  );
};

export default Home;

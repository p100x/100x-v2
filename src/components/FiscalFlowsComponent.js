import React, { useState, useEffect } from 'react';
import DataCard from './DataCard';
import { fetchFiscalFlows } from '../services/marketDataService';

const FiscalFlowsComponent = ({ setFiscalFlowsState }) => {
  const [fiscalFlowsState, setLocalFiscalFlowsState] = useState('stable');

  useEffect(() => {
    const loadFiscalFlows = async () => {
      try {
        const flows = await fetchFiscalFlows();
        setLocalFiscalFlowsState(flows);
        setFiscalFlowsState({ state: flows, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Error fetching fiscal flows:', error);
      }
    };

    loadFiscalFlows();
  }, [setFiscalFlowsState]);

  const getStateDescription = (state) => {
    switch (state) {
      case 'decreasing':
        return 'Fiscal flows are decreasing, indicating potential economic contraction.';
      case 'increasing':
        return 'Fiscal flows are increasing, suggesting potential economic expansion.';
      default:
        return 'Fiscal flows are stable, indicating a balanced economic state.';
    }
  };

  return (
    <div>
      <DataCard 
        title="Fiscal Flows"
        value={fiscalFlowsState.charAt(0).toUpperCase() + fiscalFlowsState.slice(1)}
        timestamp={new Date().toISOString()}
        category="Economic Indicator"
        explanation="Fiscal Flows represent the movement of money between the government and the economy. This includes government spending, tax collection, and other financial activities that impact overall economic conditions."
        customContent={
          <div style={{ fontWeight: 'bold' }}>
            <p>{getStateDescription(fiscalFlowsState)}</p>
          </div>
        }
        isRealtime={true}
      />
    </div>
  );
};

export default FiscalFlowsComponent;
import React, { useEffect, useState } from 'react';
import { fetchMarketSummary } from '../services/marketDataService';
import DataCard from './DataCard';

const SummaryComponent = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        const summaryText = await fetchMarketSummary();
        setSummary(summaryText);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) {
    return <div className="loading">Loading market summary...</div>;
  }

  if (error) {
    return <div className="error">Error fetching market summary: {error}</div>;
  }

  return (
    <DataCard
      title="Market Summary"
      value={<div className="summary-text">{summary}</div>}
      timestamp={Date.now()}
      chartData={null}
      category="Overview"
      explanation={null}
      chartConfig={{}} // Provide an empty object instead of null
      isRealtime={true}
    />
  );
};

export default SummaryComponent;

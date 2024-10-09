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
    <div className="data-card">
      <h2>Marktpuls</h2>
      <div className="summary-text">
        {summary}
      </div>
    </div>
  );
};

export default SummaryComponent;

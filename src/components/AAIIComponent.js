import React, { useEffect, useState } from 'react';
import { fetchLatestAAII, fetchHistoricalAAII } from '../services/marketDataService';
import DataCard from './DataCard';

const AAIIComponent = () => {
  const [aaiiData, setAAIIData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAAIIData = async () => {
      try {
        setLoading(true);
        const latestData = await fetchLatestAAII();
        const historicalAAII = await fetchHistoricalAAII();
        setAAIIData(latestData);
        setHistoricalData(historicalAAII.map(d => ({
          date: new Date(d.created_at).toLocaleDateString(),
          spread: d.spread
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAAIIData();
  }, []);

  if (loading) {
    return <div className="loading">Loading AAII data...</div>;
  }

  if (error) {
    return <div className="error">Error fetching AAII data: {error}</div>;
  }

  if (!aaiiData) {
    return <div className="error">No AAII data available.</div>;
  }

  const chartConfig = {
    xAxisDataKey: 'date',
    dataKey: 'spread'
  };

  const spread = aaiiData.spread * 100;
  const interpretationText = `The current AAII Sentiment spread is <strong>${spread.toFixed(2)}%</strong>. ${
    spread > 0
      ? "A positive spread indicates more bullish than bearish sentiment."
      : spread < 0
      ? "A negative spread indicates more bearish than bullish sentiment."
      : "A zero spread indicates equal bullish and bearish sentiment."
  } ${
    Math.abs(spread) > 20
      ? "This is considered an extreme reading, which could signal a potential market reversal."
      : "This is within the normal range."
  }`;

  return (
    <DataCard 
      title="AAII Sentiment"
      value={`${spread.toFixed(2)}%`}
      timestamp={aaiiData.created_at}
      chartData={historicalData}
      category="Investor Sentiment"
      explanation="The AAII Sentiment Survey measures the percentage of individual investors who are bullish, bearish, and neutral on the stock market for the next six months. The bull-bear spread indicates the difference between bullish and bearish sentiment, with positive values suggesting optimism and negative values indicating pessimism."
      chartConfig={chartConfig}
      interpretationText={interpretationText}
    />
  );
};

export default AAIIComponent;
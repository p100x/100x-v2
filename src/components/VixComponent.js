// src/components/VixComponent.js
import React, { useEffect, useState } from 'react';
import { fetchLatestVIX, fetchHistoricalVIX } from '../services/marketDataService';
import DataCard from './DataCard';

const VixComponent = () => {
  const [vixData, setVixData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVixData = async () => {
      try {
        setLoading(true);
        const latestData = await fetchLatestVIX();
        const historicalVIX = await fetchHistoricalVIX();
        setVixData(latestData);
        setHistoricalData(historicalVIX.map(d => ({
          date: new Date(d.timestamp).toLocaleDateString(),
          VIX: d.VIX
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadVixData();
  }, []);

  if (loading) {
    return <div className="loading">Loading VIX data...</div>;
  }

  if (error) {
    return <div className="error">Error fetching VIX data: {error}</div>;
  }

  if (!vixData) {
    return <div className="error">No VIX data available.</div>;
  }

  const chartConfig = {
    xAxisDataKey: 'date',
    dataKey: 'VIX'
  };

  return (
    <DataCard 
      title="VIX Index"
      value={vixData.VIX.toFixed(2)}
      timestamp={vixData.timestamp}
      chartData={historicalData}
      category="Market Volatility"
      explanation="The VIX Index, also known as the 'Fear Index', measures the stock market's expectation of volatility based on S&P 500 index options. A high VIX value indicates increased market uncertainty, while a low value suggests relative calm."
      chartConfig={{
        xAxisDataKey: 'date',
        dataKey: 'VIX'
      }}
      isRealtime={true} // Set this to true if the data is real-time, or false if it's delayed
    />
  );
};

export default VixComponent;

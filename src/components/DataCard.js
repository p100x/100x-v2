// src/components/DataCard.js
import React, { useMemo } from 'react';
import '../App.css'; // Import the CSS here to style DataCard
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DataCard = ({ title, value, timestamp, chartData, category, explanation }) => {
  const yAxisDomain = useMemo(() => {
    if (!chartData || chartData.length === 0) return [0, 'auto'];
    
    const values = chartData.map(item => item.VIX);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Add a 10% padding to the top and bottom of the chart
    const padding = (maxValue - minValue) * 0.1;
    return [Math.max(0, minValue - padding), maxValue + padding];
  }, [chartData]);

  // Custom tick formatter to round to one decimal place
  const formatYAxis = (tickItem) => Number(tickItem).toFixed(1);

  return (
    <div className="data-card">
      <div className="data-card-header">
        <h2>{title}</h2>
        {category && <span className="category-tag">{category}</span>}
      </div>
      <div className="data-card-content">
        <div className="data-card-value">
          <h3>{value}</h3>
          <small>as of {new Date(timestamp).toLocaleString()}</small>
        </div>
        {explanation && <p className="data-card-explanation">{explanation}</p>}
      </div>
      {chartData && (
        <div className="data-card-chart">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 255, 51, 0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-light)" 
                tick={{ fill: 'var(--text-light)', fontSize: 12 }}
              />
              <YAxis 
                stroke="var(--text-light)" 
                tick={{ fill: 'var(--text-light)', fontSize: 12 }}
                domain={yAxisDomain}
                allowDataOverflow={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--dark-bg)', 
                  border: '1px solid var(--primary-green)',
                  color: 'var(--text-light)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="VIX" 
                stroke="var(--primary-green)" 
                strokeWidth={2}
                dot={false}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DataCard;

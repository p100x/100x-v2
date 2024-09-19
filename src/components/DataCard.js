// src/components/DataCard.js
import React, { useMemo } from 'react';
import '../App.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import RealtimeIndicator from './RealtimeIndicator';

const DataCard = ({ title, value, chartData, category, explanation, chartConfig = {}, isRealtime = false }) => {
  const yAxisDomain = useMemo(() => {
    if (!chartData || chartData.length === 0 || !chartConfig.dataKey) return [0, 'auto'];
    
    const values = chartData.map(item => item[chartConfig.dataKey]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    const padding = (maxValue - minValue) * 0.1;
    return [Math.max(0, minValue - padding), maxValue + padding];
  }, [chartData, chartConfig.dataKey]);

  const formatYAxis = (tickItem) => Number(tickItem).toFixed(1);

  return (
    <div className="data-card">
      <div className="data-card-header">
        <h2>{title} <RealtimeIndicator isRealtime={isRealtime} /></h2>
        {category && <span className="category-tag">{category}</span>}
      </div>
      <div className="data-card-content">
        <div className="data-card-value">
          {typeof value === 'string' ? <h3>{value}</h3> : value}
        </div>
        {explanation && <p className="data-card-explanation">{explanation}</p>}
      </div>
      {chartData && chartConfig && chartConfig.dataKey && (
        <div className="data-card-chart">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis 
                dataKey={chartConfig.xAxisDataKey} 
                stroke="var(--primary-text)" 
                tick={{ fill: 'var(--primary-text)', fontSize: 12 }}
              />
              <YAxis 
                stroke="var(--primary-text)" 
                tick={{ fill: 'var(--primary-text)', fontSize: 12 }}
                domain={yAxisDomain}
                allowDataOverflow={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--secondary-bg)', 
                  border: '1px solid var(--primary-text)',
                  color: 'var(--primary-text)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={chartConfig.dataKey} 
                stroke="var(--chart-line)" 
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

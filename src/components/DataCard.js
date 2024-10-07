// src/components/DataCard.js
import React, { useMemo, useState } from 'react';
import '../App.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import RealtimeIndicator from './RealtimeIndicator';

const DataCard = ({ title, value, chartData, category, explanation, chartConfig = {}, isRealtime = false, interpretationText, warningMessage, children }) => {
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);

  const yAxisDomain = useMemo(() => {
    if (chartConfig.yAxisDomain) return chartConfig.yAxisDomain;
    if (!chartData || chartData.length === 0 || !chartConfig.dataKey) return [0, 'auto'];
    
    const values = chartData.map(item => item[chartConfig.dataKey]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Set the minimum y-axis value to 3% for unemployment rate
    const minYAxis = title.toLowerCase().includes('arbeitslosigkeit') ? 3 : Math.min(0, minValue);
    
    const padding = (maxValue - minValue) * 0.1;
    return [minYAxis, Math.max(minYAxis, maxValue + padding)];
  }, [chartData, chartConfig.dataKey, chartConfig.yAxisDomain, title]);

  const formatYAxis = (tickItem) => {
    if (chartConfig.yAxisFormatter) {
      return chartConfig.yAxisFormatter(tickItem);
    }
    return Number(tickItem).toFixed(1);
  };

  return (
    <div className="data-card">
      <div className="data-card-header">
        <h2>{title} <RealtimeIndicator isRealtime={isRealtime} /></h2>
        {category && <span className="category-tag">{category}</span>}
      </div>
      <div className="data-card-content">
        {warningMessage && (
          <div className="data-card-warning">
            <p>⚠️ {warningMessage}</p>
          </div>
        )}
        <div className="data-card-value">
          {typeof value === 'string' ? <h3>{value}</h3> : value}
        </div>
        {explanation && (
          <div className="data-card-explanation-container">
            <button 
              className="explanation-toggle"
              onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
            >
              {isExplanationExpanded ? 'Erklärung ausblenden' : 'Erklärung anzeigen'}
            </button>
            {isExplanationExpanded && (
              <p className="data-card-explanation">{explanation}</p>
            )}
          </div>
        )}
        {interpretationText && <p className="data-card-interpretation" dangerouslySetInnerHTML={{ __html: interpretationText }}></p>}
      </div>
      <div className="data-card-chart">
        {children ? children : (
          chartData && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfig.xAxisDataKey} />
                <YAxis domain={yAxisDomain} tickFormatter={formatYAxis} />
                <Tooltip />
                {chartConfig.referenceLine && (
                  <ReferenceLine y={chartConfig.referenceLine.y} stroke={chartConfig.referenceLine.stroke} strokeDasharray="3 3" />
                )}
                <Line 
                  type="monotone" 
                  dataKey={chartConfig.dataKey} 
                  stroke="var(--highlight)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </div>
  );
};

export default DataCard;

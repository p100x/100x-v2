import React from 'react';
import DataCard from './DataCard';

const UnemploymentComponent = () => {
  // Manually set unemployment data
  const unemploymentData = {
    unemployment: 4.2,
    timestamp: new Date().toISOString()
  };

  // Manually set historical data (last 13 months)
  const historicalData = [
    { date: '2023-05-01', unemployment: 2.5 },
    { date: '2023-06-01', unemployment: 2.6 },
    { date: '2023-07-01', unemployment: 2.5 },
    { date: '2023-08-01', unemployment: 2.6 },
    { date: '2023-09-01', unemployment: 2.7 },
    { date: '2023-10-01', unemployment: 2.8 },
    { date: '2023-11-01', unemployment: 2.9 },
    { date: '2023-12-01', unemployment: 3.0 },
    { date: '2024-01-01', unemployment: 3.1 },
    { date: '2024-02-01', unemployment: 3.8 },
    { date: '2024-03-01', unemployment: 3.9 },
    { date: '2024-04-01', unemployment: 4.0 },
    { date: '2024-05-01', unemployment: 4.2 },
  ];

  const getUnemploymentState = (current, previous) => {
    if (current === previous) return 'stable';
    return current > previous ? 'rising' : 'falling';
  };

  // Manually set Sahm rule to triggered
  const sahmRuleTriggered = true;

  const state = getUnemploymentState(unemploymentData.unemployment, historicalData[1].unemployment);

  const chartConfig = {
    xAxisDataKey: 'date',
    dataKey: 'unemployment'
  };

  const interpretationText = `The current unemployment rate is <strong>${unemploymentData.unemployment.toFixed(1)}%</strong> and is ${state}. ${
    unemploymentData.unemployment < 4
      ? "This is considered low unemployment, indicating a strong job market."
      : unemploymentData.unemployment >= 4 && unemploymentData.unemployment < 6
      ? "This is still within the normal range for unemployment but could change quickly."
      : "This is considered high unemployment, indicating potential economic challenges."
  } ${
    sahmRuleTriggered
      ? "The Sahm rule has been triggered, suggesting a possible recession."
      : "The Sahm rule has not been triggered, indicating relative economic stability."
  }`;

  return (
    <DataCard 
      title="US Unemployment"
      value={`${unemploymentData.unemployment.toFixed(1)}% (${state})`}
      timestamp={unemploymentData.timestamp}
      chartData={historicalData}
      category="Labor Market"
      explanation={`The unemployment rate measures the percentage of the labor force that is jobless and actively seeking employment. ${sahmRuleTriggered ? 'The Sahm rule has been triggered, indicating a possible recession.' : 'The Sahm rule has not been triggered.'} The Sahm rule is triggered when the 3-month average unemployment rate rises 0.5 percentage points or more above its low during the previous 12 months.`}
      chartConfig={chartConfig}
      isRealtime={false}
      interpretationText={interpretationText}
    />
  );
};

export default UnemploymentComponent;
import React, { useState, useEffect } from 'react';
import { fetchLatestVIX, fetchLatestAAII } from '../services/marketDataService';
import DataCard from './DataCard';

const SIGNAL_LEVELS = {
  VERY_BEARISH: -2,
  BEARISH: -1,
  NEUTRAL: 0,
  BULLISH: 1,
  VERY_BULLISH: 2
};

const SIGNAL_WEIGHTS = {
  VIX: 1,
  AAII: 1,
  Unemployment: 1.5,
  FiscalFlows: 1.5
};

const getVIXSignal = (vix) => {
  if (vix >= 40) return SIGNAL_LEVELS.VERY_BULLISH;
  if (vix >= 30) return SIGNAL_LEVELS.BULLISH;
  if (vix >= 20) return SIGNAL_LEVELS.NEUTRAL;
  if (vix >= 10) return SIGNAL_LEVELS.BEARISH;
  return SIGNAL_LEVELS.VERY_BEARISH;
};

const getAAIISignal = (aaiiSpread) => {
  if (aaiiSpread >= 30) return SIGNAL_LEVELS.VERY_BEARISH;
  if (aaiiSpread >= 15) return SIGNAL_LEVELS.BEARISH;
  if (aaiiSpread >= 0) return SIGNAL_LEVELS.NEUTRAL;
  if (aaiiSpread >= -30) return SIGNAL_LEVELS.BULLISH;
  return SIGNAL_LEVELS.VERY_BULLISH;
};

const getUnemploymentSignal = (state, sahmRuleTriggered) => {
  if (sahmRuleTriggered) return SIGNAL_LEVELS.VERY_BEARISH;
  if (state === 'rising') return SIGNAL_LEVELS.BEARISH;
  if (state === 'stable') return SIGNAL_LEVELS.BULLISH;
  if (state === 'falling') return SIGNAL_LEVELS.VERY_BULLISH;
  return SIGNAL_LEVELS.NEUTRAL;
};

const getFiscalFlowsSignal = (state) => {
  if (state === 'increasing') return SIGNAL_LEVELS.BULLISH;
  if (state === 'stable') return SIGNAL_LEVELS.NEUTRAL;
  if (state === 'decreasing') return SIGNAL_LEVELS.VERY_BEARISH;
  return SIGNAL_LEVELS.NEUTRAL;
};

const calculateScore = (signals) => {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, signal] of Object.entries(signals)) {
    const weight = SIGNAL_WEIGHTS[key] || 1; // Use default weight of 1 if not specified
    const signalValue = typeof signal === 'number' ? signal : 0; // Ensure signal is a number
    totalScore += signalValue * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 50; // Return a neutral score if no valid signals

  const normalizedScore = (totalScore / totalWeight + 2) / 4; // Normalize to 0-1 range
  return Math.max(0, Math.min(100, normalizedScore * 100)); // Ensure score is between 0-100
};

const MarketScoreComponent = ({ fiscalFlowsState }) => {
  const [marketScore, setMarketScore] = useState(null);
  const [signals, setSignals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateMarketScore = async () => {
      try {
        setLoading(true);
        const vixData = await fetchLatestVIX();
        const aaiiData = await fetchLatestAAII();

        // Manually set unemployment data
        const unemploymentData = {
          state: 'rising',
          sahmRuleTriggered: true
        };

        const vixSignal = getVIXSignal(vixData.VIX);
        const aaiiSignal = getAAIISignal(aaiiData.spread);
        const unemploymentSignal = getUnemploymentSignal(unemploymentData.state, unemploymentData.sahmRuleTriggered);
        const fiscalFlowsSignal = getFiscalFlowsSignal(fiscalFlowsState);

        setSignals({
          VIX: vixSignal,
          AAII: aaiiSignal,
          Unemployment: unemploymentSignal,
          FiscalFlows: fiscalFlowsSignal
        });

        const score = calculateScore({
          VIX: vixSignal,
          AAII: aaiiSignal,
          Unemployment: unemploymentSignal,
          FiscalFlows: fiscalFlowsSignal
        });
        setMarketScore(score);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    calculateMarketScore();
  }, [fiscalFlowsState]); // Add fiscalFlowsState to the dependency array

  const getMarketCondition = (score) => {
    if (score >= 80) return "Very Bullish";
    if (score >= 60) return "Bullish";
    if (score >= 40) return "Neutral";
    if (score >= 20) return "Bearish";
    return "Very Bearish";
  };

  const renderScoreScale = (score) => {
    const position = `${score}%`;
    return (
      <div className="market-score-scale-container">
        <div className="market-score-scale">
          <div 
            className="market-score-indicator" 
            style={{ left: position }}
          ></div>
        </div>
        <div className="market-score-labels">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Calculating market score...</div>;
  }

  if (error) {
    return <div className="error">Error calculating market score: {error}</div>;
  }

  const condition = getMarketCondition(marketScore);

  return (
    <DataCard
      title="Market Score"
      value={`${marketScore.toFixed(2)}`}
      timestamp={Date.now()}
      category="Market Health"
      explanation={
        <div className="market-score-content">
          <div className="market-score-header">
            <h3>{condition}</h3>
            <p>This score emphasizes extreme signals to capture significant market movements.</p>
          </div>
          {renderScoreScale(marketScore)}
          <div className="market-score-table">
            {Object.entries(signals).map(([key, value]) => (
              <div key={key} className="market-score-row">
                <span className="signal-name">{key}:</span>
                <span className={`pill ${Object.keys(SIGNAL_LEVELS).find(k => SIGNAL_LEVELS[k] === value).toLowerCase()}`}>
                  {Object.keys(SIGNAL_LEVELS).find(k => SIGNAL_LEVELS[k] === value)}
                </span>
                <span className="signal-weight">Weight: {SIGNAL_WEIGHTS[key]}</span>
              </div>
            ))}
          </div>
        </div>
      }
      isRealtime={true}
    />
  );
};

export default MarketScoreComponent;
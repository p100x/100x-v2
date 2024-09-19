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

  for (const signal of signals) {
    const weight = Math.exp(Math.abs(signal));
    totalScore += signal * weight;
    totalWeight += weight;
  }

  const normalizedScore = (totalScore / totalWeight + 2) / 4; // Normalize to 0-1 range
  return normalizedScore * 100; // Convert to 0-100 scale
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

        const score = calculateScore([vixSignal, aaiiSignal, unemploymentSignal, fiscalFlowsSignal]);
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
      value={`${marketScore.toFixed(2)} - ${condition}`}
      timestamp={Date.now()}
      category="Market Health"
      explanation={
        <div className="market-score-table">
          <div className="market-score-row">
            <span>VIX:</span>
            <span className={`pill ${Object.keys(SIGNAL_LEVELS).find(key => SIGNAL_LEVELS[key] === signals.VIX).toLowerCase()}`}>
              {Object.keys(SIGNAL_LEVELS).find(key => SIGNAL_LEVELS[key] === signals.VIX)}
            </span>
          </div>
          <div className="market-score-row">
            <span>AAII:</span>
            <span className={`pill ${Object.keys(SIGNAL_LEVELS).find(key => SIGNAL_LEVELS[key] === signals.AAII).toLowerCase()}`}>
              {Object.keys(SIGNAL_LEVELS).find(key => SIGNAL_LEVELS[key] === signals.AAII)}
            </span>
          </div>
          <div className="market-score-row">
            <span>Unemployment:</span>
            <span className={`pill ${Object.keys(SIGNAL_LEVELS).find(key => SIGNAL_LEVELS[key] === signals.Unemployment).toLowerCase()}`}>
              {Object.keys(SIGNAL_LEVELS).find(key => SIGNAL_LEVELS[key] === signals.Unemployment)}
            </span>
          </div>
          <div className="market-score-row">
            <span>Fiscal Flows:</span>
            <span className={`pill ${Object.keys(SIGNAL_LEVELS).find(key => SIGNAL_LEVELS[key] === signals.FiscalFlows).toLowerCase()}`}>
              {Object.keys(SIGNAL_LEVELS).find(key => SIGNAL_LEVELS[key] === signals.FiscalFlows)}
            </span>
          </div>
          <p>This score emphasizes extreme signals to capture significant market movements.</p>
        </div>
      }
    />
  );
};

export default MarketScoreComponent;
import React, { useState, useEffect } from 'react';
import { 
  fetchLatestVIX, 
  fetchLatestAAII, 
  fetchLatestM2Data, 
  fetchLatestCreditCardDelinquency, 
  fetchLatestPersonalSavingRate, 
  fetchHistoricalLiquidityData
} from '../services/marketDataService';
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
  FiscalFlows: 1.5,
  M2Growth: 1.5,
  CreditCardDelinquency: 1.5,
  PersonalSavingRate: 1.5,  // Add weight for Personal Saving Rate
  GlobalLiquidity: 1.5,  // Add weight for Global Liquidity Index
  RecessionIndicator: 2  // Add weight for Recession Indicator (higher weight due to its importance)
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

const getM2GrowthSignal = (m2Growth) => {
  if (m2Growth < 0) return SIGNAL_LEVELS.VERY_BEARISH;
  if (m2Growth < 5) return SIGNAL_LEVELS.BEARISH;
  if (m2Growth < 6) return SIGNAL_LEVELS.BULLISH;
  return SIGNAL_LEVELS.VERY_BULLISH;
};

const getCreditCardDelinquencySignal = (rate) => {
  if (rate >= 4) return SIGNAL_LEVELS.VERY_BEARISH;
  if (rate >= 3) return SIGNAL_LEVELS.BEARISH;
  if (rate >= 2.5) return SIGNAL_LEVELS.NEUTRAL;
  if (rate >= 2) return SIGNAL_LEVELS.BULLISH;
  return SIGNAL_LEVELS.VERY_BULLISH;
};

const getPersonalSavingRateSignal = (rate) => {
  if (rate < 2) return SIGNAL_LEVELS.VERY_BEARISH;
  if (rate < 5) return SIGNAL_LEVELS.BEARISH;
  if (rate < 7) return SIGNAL_LEVELS.NEUTRAL;
  if (rate < 10) return SIGNAL_LEVELS.BULLISH;
  return SIGNAL_LEVELS.VERY_BULLISH;
};

const getGlobalLiquiditySignal = (currentLiquidity, oneMonthAvg, threeMonthAvg) => {
  const isDecreasing1Month = currentLiquidity < oneMonthAvg;
  const isDecreasing3Month = currentLiquidity < threeMonthAvg;

  if (isDecreasing1Month && isDecreasing3Month) return SIGNAL_LEVELS.VERY_BEARISH;
  if (isDecreasing1Month || isDecreasing3Month) return SIGNAL_LEVELS.BEARISH;
  if (!isDecreasing1Month && !isDecreasing3Month) return SIGNAL_LEVELS.VERY_BULLISH;
  return SIGNAL_LEVELS.BULLISH;
};

const getRecessionIndicatorSignal = (currentValue) => {
  if (currentValue > 50) return SIGNAL_LEVELS.VERY_BEARISH;
  if (currentValue > 30) return SIGNAL_LEVELS.BEARISH;
  if (currentValue > 20) return SIGNAL_LEVELS.NEUTRAL;
  if (currentValue > 10) return SIGNAL_LEVELS.BULLISH;
  return SIGNAL_LEVELS.VERY_BULLISH;
};

const calculateScore = (signals) => {
  const expectedSignals = Object.keys(SIGNAL_WEIGHTS);
  const missingSignals = expectedSignals.filter(signal => !(signal in signals));
  
  if (missingSignals.length > 0) {
    console.warn(`Missing signals: ${missingSignals.join(', ')}`);
  }

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
        const m2Data = await fetchLatestM2Data();
        const creditCardDelinquencyData = await fetchLatestCreditCardDelinquency();
        const personalSavingRateData = await fetchLatestPersonalSavingRate();
        const liquidityData = await fetchHistoricalLiquidityData();

        // Use hardcoded recession data
        const recessionData = [
          { date: 'Apr 24', value: 29 },
          { date: 'May 24', value: 27 },
          { date: 'Jun 24', value: 30 },
          { date: 'Jul 24', value: 31 },
          { date: 'Aug 24', value: 34 },
          { date: 'Sep 24', value: 35 },
        ];
        const latestRecessionIndicator = recessionData[recessionData.length - 1];

        const vixSignal = getVIXSignal(vixData.VIX);
        const aaiiSignal = getAAIISignal(aaiiData.spread);
        const unemploymentSignal = getUnemploymentSignal('rising', true); // Hardcoded for now
        const fiscalFlowsSignal = getFiscalFlowsSignal(fiscalFlowsState);
        const m2GrowthSignal = getM2GrowthSignal(m2Data.yoy);
        const creditCardDelinquencySignal = getCreditCardDelinquencySignal(creditCardDelinquencyData.delinquency_rate);
        const personalSavingRateSignal = getPersonalSavingRateSignal(personalSavingRateData.saving_rate);
        const globalLiquiditySignal = getGlobalLiquiditySignal(
          liquidityData[liquidityData.length - 1].liquidity,
          liquidityData.reduce((sum, d) => sum + d.liquidity, 0) / liquidityData.length,
          liquidityData.reduce((sum, d) => sum + d.liquidity, 0) / liquidityData.length
        );
        const recessionIndicatorSignal = getRecessionIndicatorSignal(latestRecessionIndicator.value);

        setSignals({
          VIX: vixSignal,
          AAII: aaiiSignal,
          Unemployment: unemploymentSignal,
          FiscalFlows: fiscalFlowsSignal,
          M2Growth: m2GrowthSignal,
          CreditCardDelinquency: creditCardDelinquencySignal,
          PersonalSavingRate: personalSavingRateSignal,
          GlobalLiquidity: globalLiquiditySignal,
          RecessionIndicator: recessionIndicatorSignal
        });

        const score = calculateScore({
          VIX: vixSignal,
          AAII: aaiiSignal,
          Unemployment: unemploymentSignal,
          FiscalFlows: fiscalFlowsSignal,
          M2Growth: m2GrowthSignal,
          CreditCardDelinquency: creditCardDelinquencySignal,
          PersonalSavingRate: personalSavingRateSignal,
          GlobalLiquidity: globalLiquiditySignal,
          RecessionIndicator: recessionIndicatorSignal
        });
        setMarketScore(score);
      } catch (err) {
        console.error('Error in calculateMarketScore:', err);
        setError('Ein Fehler ist bei der Berechnung der Marktbewertung aufgetreten. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };

    calculateMarketScore();
  }, [fiscalFlowsState]);

  const getMarketCondition = (score) => {
    if (score >= 80) return "Sehr Bullisch";
    if (score >= 60) return "Bullisch";
    if (score >= 40) return "Neutral";
    if (score >= 20) return "Bärisch";
    return "Sehr Bärisch";
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
    return <div className="loading">Marktbewertung wird berechnet...</div>;
  }

  if (error) {
    return <div className="error">Fehler bei der Berechnung der Marktbewertung: {error}</div>;
  }

  const condition = getMarketCondition(marketScore);

  const signalTranslations = {
    VIX: "VIX",
    AAII: "AAII",
    Unemployment: "Arbeitslosigkeit",
    FiscalFlows: "Fiskalströme",
    M2Growth: "M2-Wachstum",
    CreditCardDelinquency: "Kreditkartenverzug",
    PersonalSavingRate: "Persönliche Sparquote",
    GlobalLiquidity: "Globaler Liquiditätsindex",
    RecessionIndicator: "Rezessionsindikator"
  };

  const signalLevelTranslations = {
    VERY_BEARISH: "SEHR BÄRISCH",
    BEARISH: "BÄRISCH",
    NEUTRAL: "NEUTRAL",
    BULLISH: "BULLISCH",
    VERY_BULLISH: "SEHR BULLISCH"
  };

  return (
    <DataCard
      title="Marktbewertung"
      value={`${marketScore.toFixed(2)}`}
      timestamp={Date.now()}
      category="Marktgesundheit"
      explanation={
        <div className="market-score-content">
          <div className="market-score-header">
            <h3>{condition}</h3>
            <p>Diese Bewertung betont extreme Signale, um signifikante Marktbewegungen zu erfassen.</p>
          </div>
          {renderScoreScale(marketScore)}
          <div className="market-score-table">
            {Object.entries(signals).map(([key, value]) => (
              <div key={key} className="market-score-row">
                <span className="signal-name">{signalTranslations[key]}:</span>
                <span className={`pill ${Object.keys(SIGNAL_LEVELS).find(k => SIGNAL_LEVELS[k] === value).toLowerCase()}`}>
                  {signalLevelTranslations[Object.keys(SIGNAL_LEVELS).find(k => SIGNAL_LEVELS[k] === value)]}
                </span>
                <span className="signal-weight">Gewichtung: {SIGNAL_WEIGHTS[key]}</span>
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
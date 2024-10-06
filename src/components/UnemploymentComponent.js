import React from 'react';
import DataCard from './DataCard';

const UnemploymentComponent = () => {
  // Manually set historical data (ensure at least 15 data points)
  const historicalData = [
    { date: '2023-10-01', unemployment: 3.6 },
    { date: '2022-11-01', unemployment: 3.6 },
    { date: '2022-12-01', unemployment: 3.5 },
    { date: '2023-01-01', unemployment: 3.4 },
    { date: '2023-02-01', unemployment: 3.6 },
    { date: '2023-03-01', unemployment: 3.5 },
    { date: '2023-04-01', unemployment: 3.4 },
    { date: '2023-05-01', unemployment: 3.7 },
    { date: '2023-06-01', unemployment: 3.6 },
    { date: '2023-07-01', unemployment: 3.5 },
    { date: '2023-08-01', unemployment: 3.8 },
    { date: '2023-09-01', unemployment: 3.8 },
    { date: '2023-10-01', unemployment: 3.8 },
    { date: '2023-11-01', unemployment: 3.7 },
    { date: '2023-12-01', unemployment: 3.7 },
    { date: '2024-01-01', unemployment: 3.7 },
    { date: '2024-02-01', unemployment: 3.9 },
    { date: '2024-03-01', unemployment: 3.8 },
    { date: '2024-04-01', unemployment: 3.9 },
    { date: '2024-05-01', unemployment: 4.0},
    { date: '2024-06-01', unemployment: 4.1 },
    { date: '2024-07-01', unemployment: 4.3 },
    { date: '2024-08-01', unemployment: 4.2 },
    { date: '2024-09-01', unemployment: 4.1 },
  ];

  // Get the latest and previous month's unemployment data
  const latestDataPoint = historicalData[historicalData.length - 1];
  const previousDataPoint = historicalData[historicalData.length - 2];

  const unemploymentData = {
    unemployment: latestDataPoint.unemployment,
    timestamp: new Date(latestDataPoint.date).toISOString(),
  };

  const getUnemploymentState = (current, previous) => {
    const difference = current - previous;
    if (Math.abs(difference) < 0.1) return 'stabil';
    return difference > 0 ? 'steigend' : 'fallend';
  };

  const state = getUnemploymentState(
    latestDataPoint.unemployment,
    previousDataPoint.unemployment
  );

  // Calculate Sahm Rule
  const calculateSahmRule = () => {
    if (historicalData.length < 15) {
      return { triggered: false, level: null, debug: 'Insufficient data' };
    }

    const unemploymentRates = historicalData.map((d) => d.unemployment);
    let sahmRuleValues = [];
    let debugInfo = [];

    // Start from index 14 to ensure we have enough data for 3-month average and prior 12 months
    for (let t = 14; t < unemploymentRates.length; t++) {
      // Current 3-month moving average
      const currentThreeMonthAvg =
        (unemploymentRates[t] +
          unemploymentRates[t - 1] +
          unemploymentRates[t - 2]) /
        3;

      // Minimum unemployment rate over the prior 12 months
      const prior12MonthsRates = unemploymentRates.slice(t - 12, t);
      const minUnemploymentRate = Math.min(...prior12MonthsRates);

      // Sahm Rule value
      const sahmValue = currentThreeMonthAvg - minUnemploymentRate;
      sahmRuleValues.push(sahmValue);

      debugInfo.push({
        month: historicalData[t].date,
        currentThreeMonthAvg,
        minUnemploymentRate,
        sahmValue,
        prior12MonthsRates,
      });
    }

    const latestSahmValue = sahmRuleValues[sahmRuleValues.length - 1];
    const sahmRuleTriggered = latestSahmValue >= 0.5;

    return {
      triggered: sahmRuleTriggered,
      level: latestSahmValue,
      debug: debugInfo,
    };
  };

  const sahmRuleResult = calculateSahmRule();

  const chartConfig = {
    xAxisDataKey: 'date',
    dataKey: 'unemployment',
    referenceLine: {
      y: 0.5,
      stroke: 'red',
      strokeDasharray: '3 3',
      label: {
        value: 'Sahm-Regel Schwelle',
        position: 'insideTopLeft',
        fill: 'red',
      },
    },
  };

  const interpretationText = `Die aktuelle Arbeitslosenquote beträgt <strong>${unemploymentData.unemployment.toFixed(
    1
  )}%</strong> und ist ${state}. ${
    unemploymentData.unemployment < 4
      ? 'Dies gilt als niedrige Arbeitslosigkeit und deutet auf einen starken Arbeitsmarkt hin.'
      : unemploymentData.unemployment >= 4 && unemploymentData.unemployment < 6
      ? 'Dies liegt noch im normalen Bereich für die Arbeitslosigkeit, könnte sich aber schnell ändern.'
      : 'Dies gilt als hohe Arbeitslosigkeit und deutet auf mögliche wirtschaftliche Herausforderungen hin.'
  } Der aktuelle Sahm-Regel-Indikator beträgt <strong>${sahmRuleResult.level.toFixed(
    2
  )}</strong>. ${
    sahmRuleResult.triggered
      ? 'Die Sahm-Regel wurde ausgelöst (≥ 0,5), was auf eine mögliche Rezession hindeutet.'
      : 'Die Sahm-Regel wurde nicht ausgelöst (< 0,5), was auf relative wirtschaftliche Stabilität hindeutet.'
  }`;

  const expandedExplanation = `
Die Arbeitslosenquote misst den Prozentsatz der Erwerbsbevölkerung, der arbeitslos ist und aktiv nach Arbeit sucht. 

1. Niedrige Arbeitslosigkeit (< 4%):
   • Starker Arbeitsmarkt, oft bullisch für die Wirtschaft
   • Konträre Sicht: Möglicher Arbeitskräftemangel, Lohninflationsdruck
   • Strategie: Fokus auf Unternehmen mit starker Preissetzungsmacht

2. Moderate Arbeitslosigkeit (4-6%):
   • Gesunder Arbeitsmarkt, Gleichgewicht zwischen Angebot und Nachfrage
   • Konträre Sicht: Potenzial für weitere Verbesserung
   • Strategie: Ausgewogene Investitionen in verschiedene Sektoren

3. Hohe Arbeitslosigkeit (> 6%):
   • Schwacher Arbeitsmarkt, oft bearish für die Wirtschaft
   • Konträre Sicht: Möglichkeit für geldpolitische Stimuli
   • Strategie: Defensive Sektoren, Qualitätsunternehmen mit stabilen Cashflows

4. Sahm-Regel:
   Die Sahm-Regel ist ein Indikator für den Beginn einer Rezession, basierend auf Veränderungen in der Arbeitslosenquote. Sie wird ausgelöst, wenn der 3-Monats-Durchschnitt der Arbeitslosenquote um 0,5 Prozentpunkte oder mehr über dem Tiefstwert der letzten 12 Monate liegt.

   • Ausgelöst: Starkes Rezessionssignal
   • Nicht ausgelöst: Relative wirtschaftliche Stabilität
   • Strategie: Bei Auslösung Vorbereitung auf mögliche Rezession, Anpassung des Portfolios

5. Trendwenden:
   • Beginn des Anstiegs: Möglicher Indikator für wirtschaftliche Abschwächung
   • Beginn des Rückgangs: Möglicher Indikator für wirtschaftliche Erholung
   • Strategie: Frühzeitige Positionierung für den nächsten Wirtschaftszyklus

Wichtiger Hinweis:
Die Arbeitslosenquote ist ein nachlaufender Indikator. Sie sollte in Kombination mit anderen wirtschaftlichen Indikatoren betrachtet werden, um ein vollständiges Bild der wirtschaftlichen Lage zu erhalten.
`;

  const warningMessage = `Achtung: Die Genauigkeit der aktuellen Arbeitslosendaten ist aufgrund von Datenrevisionen und einem ungewöhnlich hohen Wachstum der Regierungsjobs möglicherweise beeinträchtigt.`;

  return (
    <DataCard
      title="US-Arbeitslosigkeit"
      value={`${unemploymentData.unemployment.toFixed(1)}% (${state})`}
      timestamp={unemploymentData.timestamp}
      chartData={historicalData}
      category="Arbeitsmarkt"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      chartConfig={chartConfig}
      isRealtime={false}
      interpretationText={interpretationText}
      warningMessage={warningMessage}
    />
  );
};

export default UnemploymentComponent;

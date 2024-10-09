import React, { useEffect, useState } from 'react';
import { fetchLatestAAII, fetchHistoricalAAII } from '../services/marketDataService';
import DataCard from './DataCard';
import { supabase } from '../supabaseClient';  // Add this line

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
        console.error('Error in AAIIComponent:', err);
        const session = await supabase.auth.getSession();
        console.error('Current auth status:', session);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAAIIData();
  }, []);

  if (loading) {
    return <div className="loading">AAII-Daten werden geladen...</div>;
  }

  if (error) {
    return <div className="error">Fehler beim Abrufen der AAII-Daten: {error}</div>;
  }

  if (!aaiiData) {
    return <div className="error">Keine AAII-Daten verfügbar.</div>;
  }

  const chartConfig = {
    xAxisDataKey: 'date',
    dataKey: 'spread',
    referenceLine: { y: 0, stroke: 'red', strokeDasharray: '3 3' }
  };

  const spread = aaiiData.spread * 100;
  const interpretationText = `Die aktuelle AAII-Stimmungsdifferenz beträgt <strong>${spread.toFixed(2)}%</strong>. ${
    spread > 0
      ? "Eine positive Differenz deutet auf eine überwiegend bullische Stimmung hin."
      : spread < 0
      ? "Eine negative Differenz deutet auf eine überwiegend bärische Stimmung hin."
      : "Eine Differenz von Null deutet auf eine ausgeglichene bullische und bärische Stimmung hin."
  } ${
    Math.abs(spread) > 20
      ? "Dies gilt als extreme Messung und könnte auf eine potenzielle Marktumkehr hindeuten."
      : "Dies liegt im normalen Bereich."
  }`;

  const expandedExplanation = `
Die AAII-Stimmungsumfrage misst den Prozentsatz der Privatanleger, die für die nächsten sechs Monate bullisch, bärisch oder neutral gegenüber dem Aktienmarkt eingestellt sind.

Aus der Perspektive eines konträren Investors:

1. Extreme Werte:
   • Hohe positive Differenz (> 20%): Übermäßiger Optimismus, potenzielles Verkaufssignal
   • Hohe negative Differenz (< -20%): Übermäßiger Pessimismus, potenzielle Kaufgelegenheit

2. Konträre Indikatoren:
   • Wenn die Mehrheit bullisch ist, erwägen konträre Investoren bearish zu sein und umgekehrt
   • Basiert auf der Annahme, dass die Masse oft falsch liegt, besonders bei Extremen

3. Market Timing:
   • Extreme Werte können auf überkaufte oder überverkaufte Marktbedingungen hinweisen
   • Mögliche Einstiegs- oder Ausstiegspunkte für konträre Strategien

4. Sentiment als Frühindikator:
   • Stimmungsänderungen können Marktbewegungen vorausgehen
   • Ermöglicht es Investoren, sich auf potenzielle Trendwenden vorzubereiten

5. Kombination mit anderen Indikatoren:
   • AAII-Daten sollten nicht isoliert betrachtet werden
   • Kombination mit technischen und fundamentalen Analysen für robustere Entscheidungen

6. Langfristige Perspektive:
   • Einzelne Umfragen können irreführend sein
   • Betrachtung längerfristiger Trends für zuverlässigere Signale

Wichtiger Hinweis:
Konträres Investieren birgt Risiken. Märkte können länger irrational bleiben als erwartet. Gründliche Analyse und striktes Risikomanagement sind unerlässlich.
`;

  return (
    <DataCard 
      title="AAII-Stimmung"
      value={`${spread.toFixed(2)}%`}
      timestamp={aaiiData.created_at}
      chartData={historicalData}
      category="Anlegerstimmung"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      chartConfig={chartConfig}
      interpretationText={interpretationText}
    />
  );
};

export default AAIIComponent;
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
    return <div className="loading">VIX-Daten werden geladen...</div>;
  }

  if (error) {
    return <div className="error">Fehler beim Abrufen der VIX-Daten: {error}</div>;
  }

  if (!vixData) {
    return <div className="error">Keine VIX-Daten verfügbar.</div>;
  }

  const chartConfig = {
    xAxisDataKey: 'date',
    dataKey: 'VIX'
  };

  const interpretationText = `Der aktuelle VIX-Indexwert beträgt <strong>${vixData.VIX.toFixed(2)}</strong>. ${
    vixData.VIX < 20
      ? "Dies deutet auf eine geringe Marktvolatilität und relative Ruhe hin."
      : vixData.VIX >= 20 && vixData.VIX < 30
      ? "Dies deutet auf eine moderate Marktvolatilität hin."
      : "Dies zeigt eine hohe Marktvolatilität und erhöhte Unsicherheit an."
  }`;

  const expandedExplanation = `
Der VIX-Index, auch bekannt als 'Angstbarometer', misst die vom Aktienmarkt erwartete Volatilität basierend auf S&P 500-Indexoptionen. 

• Hoher VIX-Wert → Erhöhte Marktunsicherheit
• Niedriger VIX-Wert → Relative Ruhe im Markt

Aus der Perspektive eines konträren Investors:

1. Übermäßiger Pessimismus (VIX > 40):
   - Mögliche Panik und übertriebener Pessimismus
   - Potenzielle Kaufgelegenheit (Märkte könnten überverkauft sein)

2. Übermäßiger Optimismus (VIX < 15):
   - Hinweis auf Selbstgefälligkeit und übermäßigen Optimismus
   - Mögliches Verkaufssignal (Märkte könnten überbewertet sein)

3. Mean Reversion:
   - VIX tendiert zur Rückkehr zum Durchschnitt
   - Extreme Werte bieten oft Gelegenheiten für konträre Strategien

4. Sentiment-Indikator:
   - VIX spiegelt Marktstimmung wider
   - Ermöglicht Handel gegen extreme Trends

5. Volatilitäts-Arbitrage:
   - Erfahrene Händler nutzen Diskrepanzen zwischen VIX und tatsächlicher Marktvolatilität

6. Diversifikation:
   - In Zeiten niedriger Volatilität: Erhöhter Schutz im Portfolio empfohlen
   - Unerwartete Volatilität kann schnell und heftig auftreten

Wichtiger Hinweis:
Der konträre Ansatz birgt Risiken und ist nicht immer erfolgreich. Märkte können länger irrational bleiben als erwartet. Sorgfältige Analyse und striktes Risikomanagement sind unerlässlich.
`;

return (
  <DataCard 
    title="VIX-Index"
    value={vixData.VIX.toFixed(2)}
    timestamp={vixData.timestamp}
    chartData={historicalData}
    category="Marktvolatilität"
    explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
    chartConfig={{
      xAxisDataKey: 'date',
      dataKey: 'VIX'
    }}
    isRealtime={true}
    interpretationText={interpretationText}
  />
);
};

export default VixComponent;

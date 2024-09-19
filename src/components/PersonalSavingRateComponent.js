import React, { useEffect, useState, useMemo } from 'react';
import { fetchLatestPersonalSavingRate, fetchHistoricalPersonalSavingRate } from '../services/marketDataService';
import DataCard from './DataCard';

const PersonalSavingRateComponent = () => {
  const [savingRateData, setSavingRateData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSavingRateData = async () => {
      try {
        setLoading(true);
        const latestData = await fetchLatestPersonalSavingRate();
        const historicalSavingRate = await fetchHistoricalPersonalSavingRate();
        setSavingRateData(latestData);
        setHistoricalData(historicalSavingRate.map(d => ({
          date: new Date(d.date).toLocaleDateString(),
          value: d.saving_rate
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSavingRateData();
  }, []);

  const chartConfig = useMemo(() => {
    return {
      xAxisDataKey: 'date',
      dataKey: 'value',
      yAxisDomain: [2.5, 5.5],
      yAxisTicks: [2.5, 3, 3.5, 4, 4.5, 5, 5.5],
      tooltipFormatter: (value) => `${value.toFixed(1)}%`,
      yAxisFormatter: (value) => `${value}%`,
    };
  }, []);

  if (loading) {
    return <div className="loading">Persönliche Sparquote wird geladen...</div>;
  }

  if (error) {
    return <div className="error">Fehler beim Abrufen der persönlichen Sparquote: {error}</div>;
  }

  if (!savingRateData) {
    return <div className="error">Keine Daten zur persönlichen Sparquote verfügbar.</div>;
  }

  const currentRate = savingRateData.saving_rate;

  const interpretationText = currentRate !== undefined ? 
    `Die aktuelle persönliche Sparquote beträgt <strong>${currentRate.toFixed(1)}%</strong>. ${
      currentRate > 10
        ? "Dies gilt als hoch und deutet darauf hin, dass die Verbraucher einen erheblichen Teil ihres verfügbaren Einkommens sparen."
        : currentRate < 5
        ? "Dies ist relativ niedrig und deutet darauf hin, dass die Verbraucher weniger von ihrem verfügbaren Einkommen sparen."
        : "Dies liegt im normalen historischen Bereich."
    }` : 'Interpretation aufgrund fehlender Daten nicht verfügbar.';

  const expandedExplanation = `
Die persönliche Sparquote repräsentiert den Prozentsatz des verfügbaren persönlichen Einkommens, der gespart wird. Sie ist ein wichtiger Indikator für das Verbraucherverhalten und die wirtschaftlichen Bedingungen.

Aus der Perspektive eines konträren Investors:

1. Hohe Sparquote (> 10%):
   • Konventionelle Sicht: Wirtschaftliche Unsicherheit, Vorsicht der Verbraucher
   • Konträre Sicht: Potenzial für zukünftigen Konsumanstieg, aufgestaute Nachfrage
   • Strategie: Positionierung in Konsumgüteraktien, Einzelhandel für zukünftige Erholung

2. Niedrige Sparquote (< 5%):
   • Konventionelle Sicht: Starker Konsum, wirtschaftliche Zuversicht
   • Konträre Sicht: Übermäßiger Optimismus, Risiko einer Überschuldung der Verbraucher
   • Strategie: Vorsicht bei zyklischen Konsumgütern, Fokus auf defensive Sektoren

3. Trendwenden:
   • Beginn steigender Sparquote: Möglicher Indikator für wirtschaftliche Unsicherheit
   • Beginn fallender Sparquote: Möglicher Indikator für wachsendes Verbrauchervertrauen
   • Strategie: Anpassung der Sektorallokation basierend auf erwarteten Konsumtrends

4. Makroökonomische Implikationen:
   • Hohe Sparquote: Potenziell deflationär, könnte zu niedrigeren Zinsen führen
   • Niedrige Sparquote: Potenziell inflationär, könnte zu höheren Zinsen führen
   • Strategie: Anpassung der Anleihen- und Aktienallokation entsprechend

5. Langfristige Perspektive:
   • Betrachtung der Nachhaltigkeit aktueller Spartrends
   • Analyse demografischer Veränderungen und deren Auswirkungen auf Sparverhalten
   • Strategie: Positionierung für langfristige strukturelle Veränderungen im Konsumverhalten

6. Globale Betrachtung:
   • Vergleich der Sparquoten zwischen verschiedenen Ländern
   • Identifikation von Ländern mit konträren Spartrends
   • Strategie: Geografische Diversifikation, Fokus auf Länder mit unterbewerteten Konsummärkten

Wichtiger Hinweis:
Konträres Investieren basierend auf der persönlichen Sparquote erfordert ein tiefes Verständnis makroökonomischer Zusammenhänge. Die Sparquote sollte in Kombination mit anderen wirtschaftlichen Indikatoren betrachtet werden, um ein vollständiges Bild zu erhalten.
`;

  return (
    <DataCard 
      title="Persönliche Sparquote"
      value={currentRate !== undefined ? `${currentRate.toFixed(1)}%` : 'N/A'}
      timestamp={savingRateData.date}
      chartData={historicalData}
      category="Verbraucherverhalten"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      chartConfig={chartConfig}
      interpretationText={interpretationText}
    />
  );
};

export default PersonalSavingRateComponent;
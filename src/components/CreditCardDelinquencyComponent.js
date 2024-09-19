import React, { useEffect, useState, useMemo } from 'react';
import { fetchLatestCreditCardDelinquency, fetchHistoricalCreditCardDelinquency } from '../services/marketDataService';
import DataCard from './DataCard';

const CreditCardDelinquencyComponent = () => {
  const [delinquencyData, setDelinquencyData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDelinquencyData = async () => {
      try {
        setLoading(true);
        const latestData = await fetchLatestCreditCardDelinquency();
        const historicalDelinquency = await fetchHistoricalCreditCardDelinquency();
        setDelinquencyData(latestData);
        setHistoricalData(historicalDelinquency.map(d => ({
          date: new Date(d.date).toLocaleDateString(),
          value: d.delinquency_rate
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDelinquencyData();
  }, []);

  const chartConfig = useMemo(() => {
    return {
      xAxisDataKey: 'date',
      dataKey: 'value',
      yAxisDomain: [2, 4],
      yAxisTicks: [2, 2.5, 3, 3.5, 4],
      tooltipFormatter: (value) => `${value.toFixed(2)}%`,
      yAxisFormatter: (value) => `${value}%`,
    };
  }, []);

  if (loading) {
    return <div className="loading">Kreditkarten-Säumnisquote wird geladen...</div>;
  }

  if (error) {
    return <div className="error">Fehler beim Abrufen der Kreditkarten-Säumnisquote: {error}</div>;
  }

  if (!delinquencyData) {
    return <div className="error">Keine Daten zur Kreditkarten-Säumnisquote verfügbar.</div>;
  }

  const currentRate = delinquencyData.delinquency_rate;

  const interpretationText = currentRate !== undefined ? 
    `Die aktuelle Kreditkarten-Säumnisquote beträgt <strong>${currentRate.toFixed(2)}%</strong>. ${
      currentRate > 3
        ? "Dies gilt als hoch und könnte auf finanzielle Belastungen der Verbraucher hindeuten."
        : currentRate < 2
        ? "Dies ist relativ niedrig und deutet darauf hin, dass die Verbraucher ihre Kreditkartenschulden gut bewältigen."
        : "Dies liegt im normalen historischen Bereich."
    }` : 'Interpretation aufgrund fehlender Daten nicht verfügbar.';

  const expandedExplanation = `
Die Kreditkarten-Säumnisquote repräsentiert den Prozentsatz der Kreditkartensalden, die 30 Tage oder länger überfällig sind. Sie ist ein wichtiger Indikator für die finanzielle Gesundheit der Verbraucher und die wirtschaftlichen Bedingungen.

Aus der Perspektive eines konträren Investors:

1. Hohe Säumnisquote (> 3%):
   • Konventionelle Sicht: Wirtschaftliche Schwierigkeiten, Risiko für Finanzsektor
   • Konträre Sicht: Potenzial für politische Intervention, zukünftige Erholung
   • Strategie: Vorsichtige Akkumulation von Finanzaktien, Vorbereitung auf Stimulus

2. Niedrige Säumnisquote (< 2%):
   • Konventionelle Sicht: Starke Verbraucherfinanzen, positiv für Wirtschaft
   • Konträre Sicht: Mögliche Überhitzung, Risiko zukünftiger Verschlechterung
   • Strategie: Vorsicht bei Konsumkrediten, Fokus auf Qualitätsaktien

3. Trendwenden:
   • Beginn steigender Säumnisquote: Möglicher Indikator für wirtschaftliche Schwierigkeiten
   • Beginn fallender Säumnisquote: Möglicher Indikator für wirtschaftliche Erholung
   • Strategie: Anpassung der Sektorallokation basierend auf erwarteten Trends

4. Sektorale Auswirkungen:
   • Hohe Säumnisquote: Negativ für Banken, Kreditkartenunternehmen
   • Niedrige Säumnisquote: Positiv für Einzelhandel, Konsumgüter
   • Strategie: Sektorrotation basierend auf Säumnistrends

5. Makroökonomische Implikationen:
   • Steigende Säumnisquote: Könnte zu strafferer Kreditvergabe führen
   • Fallende Säumnisquote: Könnte zu lockererer Kreditvergabe führen
   • Strategie: Anpassung der Anleihen- und Aktienallokation entsprechend

6. Verbraucherverhaltensanalyse:
   • Hohe Säumnisquote: Könnte auf übermäßigen Konsum in der Vergangenheit hindeuten
   • Niedrige Säumnisquote: Könnte auf vorsichtiges Ausgabeverhalten hindeuten
   • Strategie: Positionierung in Sektoren, die von Verhaltensänderungen profitieren könnten

Wichtiger Hinweis:
Konträres Investieren basierend auf der Kreditkarten-Säumnisquote erfordert ein tiefes Verständnis der Verbraucherfinanzen und makroökonomischen Zusammenhänge. Die Säumnisquote sollte in Kombination mit anderen wirtschaftlichen Indikatoren betrachtet werden, um ein vollständiges Bild zu erhalten.
`;

  return (
    <DataCard 
      title="Kreditkarten-Säumnisquote"
      value={currentRate !== undefined ? `${currentRate.toFixed(2)}%` : 'N/A'}
      timestamp={delinquencyData.date}
      chartData={historicalData}
      category="Verbraucherkredit"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      chartConfig={chartConfig}
      interpretationText={interpretationText}
    />
  );
};

export default CreditCardDelinquencyComponent;
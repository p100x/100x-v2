import React, { useEffect, useState } from 'react';
import { fetchLatestM2Data, fetchHistoricalM2Data } from '../services/marketDataService';
import DataCard from './DataCard';

const M2MoneyGrowthComponent = () => {
  const [m2Data, setM2Data] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadM2Data = async () => {
      try {
        setLoading(true);
        const latestData = await fetchLatestM2Data();
        const historicalM2 = await fetchHistoricalM2Data();
        setM2Data(latestData);
        setHistoricalData(historicalM2.map(d => ({
          date: new Date(d.date).toLocaleDateString(),
          yoy: d.yoy
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadM2Data();
  }, []);

  if (loading) {
    return <div className="loading">M2-Geldmengenwachstumsdaten werden geladen...</div>;
  }

  if (error) {
    return <div className="error">Fehler beim Abrufen der M2-Geldmengenwachstumsdaten: {error}</div>;
  }

  if (!m2Data) {
    return <div className="error">Keine M2-Geldmengenwachstumsdaten verfügbar.</div>;
  }

  const chartConfig = {
    xAxisDataKey: 'date',
    dataKey: 'yoy',
    referenceLine: { y: 0, stroke: 'red', strokeDasharray: '3 3' }
  };

  const yoy = m2Data.yoy;
  const interpretationText = `Die aktuelle M2-Geldmengenwachstumsrate beträgt <strong>${yoy.toFixed(2)}%</strong> im Jahresvergleich. ${
    yoy < 0
      ? "Eine negative Wachstumsrate gilt als ausgesprochen bärisch und deutet auf eine signifikante Kontraktion der Geldmenge hin. Dies könnte zu deflationärem Druck und wirtschaftlicher Verlangsamung führen."
      : yoy < 5
      ? "Diese Wachstumsrate ist sehr schwach und kann problematisch sein. Sie deutet auf eine träge Expansion der Geldmenge hin, was zu wirtschaftlichen Herausforderungen und potenziell deflationärem Druck führen könnte."
      : yoy < 10
      ? "Diese Wachstumsrate zeigt eine moderate Expansion der Geldmenge an, was im Allgemeinen als gesund für das Wirtschaftswachstum angesehen wird."
      : "Dies ist eine starke Wachstumsrate, die auf eine signifikante Expansion der Geldmenge hindeutet. Während dies das Wirtschaftswachstum unterstützen kann, könnte es auch Bedenken hinsichtlich potenzieller Inflationsrisiken wecken, wenn es anhält."
  }`;

  const expandedExplanation = `
Das M2-Geldmengenwachstum misst die jährliche Veränderung der M2-Geldmenge. M2 umfasst Bargeld, Sichteinlagen und leicht konvertierbare Quasi-Geldmittel.

1. Hohes M2-Wachstum (> 10%):
   • Wirtschaftliche Expansion, bullisch für Aktien
   • Konträre Sicht: Inflationsrisiken, potenzielle Blasenbildung
   • Strategie: Vorsicht bei Anleihen, Fokus auf inflationsgeschützte Anlagen

2. Niedriges M2-Wachstum (< 5%):
   • Wirtschaftliche Verlangsamung, bearish für Aktien
   • Konträre Sicht: Potenzial für geldpolitische Lockerung, zukünftige Erholung
   • Strategie: Suche nach unterbewerteten Aktien, Vorbereitung auf Stimulus

3. Negatives M2-Wachstum:
   • Deflationäre Tendenzen, sehr bearish
   • Konträre Sicht: Extreme Maßnahmen der Zentralbank wahrscheinlich
   • Strategie: Vorsichtige Akkumulation von Qualitätsaktien, Bargeldreserven

4. Trendwenden:
   • Möglicher Indikator für Konjunkturabschwung
   • Beginn der Beschleunigung: Möglicher Indikator für wirtschaftliche Erholung
   • Strategie: Positionierung für den nächsten Wirtschaftszyklus

5. Sektorale Auswirkungen:
   • Hohes Wachstum: Vorteilhaft für zyklische Sektoren, Rohstoffe
   • Niedriges Wachstum: Vorteilhaft für defensive Sektoren, Versorger
   • Strategie: Sektorrotation basierend auf Geldmengentrends

6. Globale Perspektive:
   • Vergleich des M2-Wachstums zwischen verschiedenen Ländern
   • Identifikation von Ländern mit divergierenden geldpolitischen Trends
   • Strategie: Geografische Diversifikation, Währungsstrategien

Wichtiger Hinweis:
Konträres Investieren basierend auf M2-Wachstum erfordert ein tiefes Verständnis monetärer Zusammenhänge. Das M2-Wachstum sollte in Kombination mit anderen wirtschaftlichen Indikatoren betrachtet werden, um ein vollständiges Bild zu erhalten.
`;

  return (
    <DataCard 
      title="M2-Geldmengenwachstum"
      value={`${yoy.toFixed(2)}%`}
      timestamp={m2Data.date}
      chartData={historicalData}
      category="Wirtschaft"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      chartConfig={chartConfig}
      interpretationText={interpretationText}
    />
  );
};

export default M2MoneyGrowthComponent;
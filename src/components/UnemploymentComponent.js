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
    if (current === previous) return 'stabil';
    return current > previous ? 'steigend' : 'fallend';
  };

  // Manually set Sahm rule to triggered
  const sahmRuleTriggered = true;

  const state = getUnemploymentState(unemploymentData.unemployment, historicalData[1].unemployment);

  const chartConfig = {
    xAxisDataKey: 'date',
    dataKey: 'unemployment'
  };

  const interpretationText = `Die aktuelle Arbeitslosenquote beträgt <strong>${unemploymentData.unemployment.toFixed(1)}%</strong> und ist ${state}. ${
    unemploymentData.unemployment < 4
      ? "Dies gilt als niedrige Arbeitslosigkeit und deutet auf einen starken Arbeitsmarkt hin."
      : unemploymentData.unemployment >= 4 && unemploymentData.unemployment < 6
      ? "Dies liegt noch im normalen Bereich für die Arbeitslosigkeit, könnte sich aber schnell ändern."
      : "Dies gilt als hohe Arbeitslosigkeit und deutet auf mögliche wirtschaftliche Herausforderungen hin."
  } ${
    sahmRuleTriggered
      ? "Die Sahm-Regel wurde ausgelöst, was auf eine mögliche Rezession hindeutet."
      : "Die Sahm-Regel wurde nicht ausgelöst, was auf relative wirtschaftliche Stabilität hindeutet."
  }`;

  const expandedExplanation = `
Die Arbeitslosenquote misst den Prozentsatz der Erwerbsbevölkerung, der arbeitslos ist und aktiv nach Arbeit sucht. Aus der Perspektive eines konträren Investors:

1. Niedrige Arbeitslosigkeit (< 4%):
   • Konventionelle Sicht: Starke Wirtschaft, gute Investitionsbedingungen
   • Konträre Sicht: Mögliche Überhitzung, Lohninflation, Zinserhöhungen
   • Strategie: Vorsicht bei zyklischen Aktien, Fokus auf defensive Sektoren

2. Hohe Arbeitslosigkeit (> 6%):
   • Konventionelle Sicht: Schwache Wirtschaft, schlechte Investitionsbedingungen
   • Konträre Sicht: Potenzial für wirtschaftliche Erholung, expansive Geldpolitik
   • Strategie: Suche nach unterbewerteten zyklischen Aktien, Vorbereitung auf Erholung

3. Trendwenden:
   • Beginn steigender Arbeitslosigkeit: Möglicher Indikator für Rezession
   • Beginn fallender Arbeitslosigkeit: Möglicher Indikator für wirtschaftliche Erholung
   • Strategie: Positionierung für den nächsten Wirtschaftszyklus

4. Sahm-Regel:
   • Definition: Ausgelöst, wenn der 3-Monats-Durchschnitt der Arbeitslosenquote um 0,5 Prozentpunkte oder mehr über dem Tief der letzten 12 Monate liegt
   • Konventionelle Sicht: Warnsignal für Rezession
   • Konträre Sicht: Möglicher Wendepunkt, Beginn einer Erholungsphase
   • Strategie: Vorbereitung auf antizyklische Investitionen

5. Sektorale Auswirkungen:
   • Niedrige Arbeitslosigkeit: Vorteilhaft für Konsumgüter, Einzelhandel
   • Hohe Arbeitslosigkeit: Vorteilhaft für defensive Sektoren, Grundbedarfsgüter
   • Strategie: Sektorrotation basierend auf Arbeitsmarkttrends

6. Geldpolitische Implikationen:
   • Niedrige Arbeitslosigkeit: Mögliche Zinserhöhungen
   • Hohe Arbeitslosigkeit: Mögliche geldpolitische Lockerung
   • Strategie: Anpassung der Anleihen- und Aktienallokation

Wichtiger Hinweis:
Konträres Investieren basierend auf Arbeitslosendaten erfordert sorgfältige Analyse und Timing. Die Arbeitslosenquote ist ein nachlaufender Indikator und sollte in Kombination mit anderen wirtschaftlichen Daten betrachtet werden.
`;

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
    />
  );
};

export default UnemploymentComponent;
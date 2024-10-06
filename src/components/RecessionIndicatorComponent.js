import React, { useMemo } from 'react';
import DataCard from './DataCard';

const RecessionIndicatorComponent = () => {
  const recessionData = [
    { date: 'Apr 24', value: 29 },
    { date: 'May 24', value: 27 },
    { date: 'Jun 24', value: 30 },
    { date: 'Jul 24', value: 31 },
    { date: 'Aug 24', value: 34 },
    { date: 'Sep 24', value: 35 },
  ];

  const latestData = recessionData[recessionData.length - 1];

  const chartConfig = useMemo(() => ({
    xAxisDataKey: 'date',
    dataKey: 'value',
    yAxisDomain: [25, 40],
    yAxisTicks: [25, 30, 35, 40],
    tooltipFormatter: (value) => `${value}%`,
    yAxisFormatter: (value) => `${value}%`,
  }), []);

  const interpretationText = `Der aktuelle 100X Rezessionsindikator liegt bei <strong>${latestData.value}%</strong>. ${
    latestData.value > 50
      ? "Dies deutet auf eine erhöhte Wahrscheinlichkeit einer Rezession hin."
      : latestData.value < 30
      ? "Dies signalisiert eine relativ geringe Wahrscheinlichkeit einer Rezession."
      : "Dies liegt im neutralen Bereich, was auf eine moderate Unsicherheit hindeutet."
  }`;

  const expandedExplanation = `
Der 100X Rezessionsindikator ist ein umfassender Indikator, der die Wahrscheinlichkeit einer wirtschaftlichen Verschlechterung im aktuellen Monat einschätzt. Er basiert auf einer Vielzahl von Daten, darunter Konsum, Beschäftigung, Produktion, Finanzen und Rohstoffe.

Interpretation des Indikators:
• Werte über 50% deuten auf eine erhöhte Rezessionswahrscheinlichkeit hin
• Werte unter 50% signalisieren eine geringere Rezessionswahrscheinlichkeit

Wichtiger Hinweis:
Konträres Investieren basierend auf dem Rezessionsindikator erfordert eine sorgfältige Analyse und sollte im Kontext anderer wirtschaftlicher und marktbezogener Daten betrachtet werden.
`;

  return (
    <DataCard 
      title="100X Rezessionsindikator"
      value={`${latestData.value}%`}
      timestamp={latestData.date}
      chartData={recessionData}
      category="Wirtschaftliche Gesundheit"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      chartConfig={chartConfig}
      interpretationText={interpretationText}
    />
  );
};

export default RecessionIndicatorComponent;
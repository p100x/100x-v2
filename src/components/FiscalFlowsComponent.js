import React, { useState, useEffect } from 'react';
import DataCard from './DataCard';
import { fetchFiscalFlows } from '../services/marketDataService';

const FiscalFlowsComponent = ({ setFiscalFlowsState }) => {
  const [fiscalFlowsState, setLocalFiscalFlowsState] = useState('stabil');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFiscalFlows = async () => {
      try {
        const flows = await fetchFiscalFlows();
        setLocalFiscalFlowsState(flows);
        setFiscalFlowsState({ state: flows, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Fehler beim Abrufen der Fiskalströme:', error);
        setError('Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      }
    };

    loadFiscalFlows();
  }, [setFiscalFlowsState]);

  const getStateDescription = (state) => {
    switch (state) {
      case 'abnehmend':
        return 'Die Fiskalströme nehmen ab, was auf eine potenzielle wirtschaftliche Kontraktion hindeutet.';
      case 'zunehmend':
        return 'Die Fiskalströme nehmen zu, was auf eine potenzielle wirtschaftliche Expansion hindeutet.';
      default:
        return 'Die Fiskalströme sind stabil, was auf einen ausgeglichenen wirtschaftlichen Zustand hindeutet.';
    }
  };

  const interpretationText = `Der aktuelle Zustand der Fiskalströme ist <strong>${fiscalFlowsState}</strong>. ${getStateDescription(fiscalFlowsState)}`;

  const expandedExplanation = `
Fiskalströme repräsentieren die Bewegung von Geld zwischen der Regierung und der Wirtschaft. Dies umfasst Staatsausgaben, Steuereinnahmen und andere finanzielle Aktivitäten, die die gesamtwirtschaftlichen Bedingungen beeinflussen.

1. Zunehmende Fiskalströme:
   • Wirtschaftliche Expansion, positiv für Aktienmärkte
   • Strategie: Vorsicht bei zyklischen Aktien, Fokus auf inflationsgeschützte Anlagen

2. Abnehmende Fiskalströme:
   • Wirtschaftliche Kontraktion, negativ für Aktienmärkte
   • Strategie: Suche nach unterbewerteten Wachstumsaktien, Vorbereitung auf mögliche geldpolitische Lockerung

3. Stabile Fiskalströme:
   • Wirtschaftliche Stabilität, neutral für Märkte

4. Auswirkungen auf Sektoren:
   • Zunehmende Ströme: Vorteilhaft für Infrastruktur, Verteidigung, Gesundheitswesen
   • Abnehmende Ströme: Vorteilhaft für defensive Sektoren, Versorger
   • Strategie: Sektorrotation basierend auf fiskalischen Trends

5. Langfristige Perspektive:
   • Betrachtung der Nachhaltigkeit aktueller Fiskalströme
   • Analyse potenzieller zukünftiger Politikänderungen
   • Strategie: Positionierung für langfristige strukturelle Veränderungen

6. Globale Betrachtung:
   • Vergleich der Fiskalströme zwischen verschiedenen Ländern
   • Identifikation von Ländern mit konträren fiskalischen Trends
   • Strategie: Geografische Diversifikation, Fokus auf Länder mit unterbewerteten Währungen

Wichtiger Hinweis:
Konträres Investieren basierend auf Fiskalströmen erfordert ein tiefes Verständnis makroökonomischer Zusammenhänge. Fiskalströme sollten in Kombination mit anderen wirtschaftlichen Indikatoren betrachtet werden, um ein vollständiges Bild zu erhalten.
`;

  return (
    <DataCard 
      title="Fiskalströme"
      value={fiscalFlowsState.charAt(0).toUpperCase() + fiscalFlowsState.slice(1)}
      timestamp={new Date().toISOString()}
      category="Wirtschaftsindikator"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      customContent={
        <div style={{ fontWeight: 'bold' }}>
          <p>{getStateDescription(fiscalFlowsState)}</p>
        </div>
      }
      isRealtime={true}
      interpretationText={interpretationText}
    />
  );
};

export default FiscalFlowsComponent;
import React, { useEffect, useState } from 'react';
import { fetchLatestVIX, fetchHistoricalVIX } from '../services/marketDataService';
import DataCard from './DataCard';

const VixComponent = () => {
  const [vixData, setVixData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateInput) => {
    if (typeof dateInput === 'string') {
      // Handle the "DD.MM.YYYY" format
      const [day, month, year] = dateInput.split('.');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const date = new Date(dateInput);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const parseDate = (dateString) => {
    if (typeof dateString === 'string') {
      // Handle the "DD.MM.YYYY" format
      const [day, month, year] = dateString.split('.');
      return new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
    }
    return new Date(dateString);
  };

  useEffect(() => {
    const loadVixData = async () => {
      try {
        setLoading(true);
        console.log('Fetching latest VIX data...');
        const latestData = await fetchLatestVIX();
        console.log('Latest VIX data:', latestData);
        
        console.log('Fetching historical VIX data...');
        const historicalVIX = await fetchHistoricalVIX();
        console.log('Raw historical VIX data:', historicalVIX);

        if (!latestData || !historicalVIX || historicalVIX.length === 0) {
          throw new Error('No VIX data returned from API');
        }

        setVixData(latestData);

        console.log('Starting to process historical data...');
        console.log('Historical data length:', historicalVIX.length);
        
        let validDataPoints = 0;
        const processedData = historicalVIX.map((d, index) => {
          console.log(`Processing data point ${index}:`, JSON.stringify(d));
          
          if (!d) {
            console.error(`Data point ${index} is null or undefined`);
            return null;
          }
          
          if (!d.date && !d.timestamp) {
            console.error(`Missing date/timestamp at index ${index}:`, JSON.stringify(d));
            return null;
          }
          
          if (d.VIX === undefined) {
            console.error(`Missing VIX value at index ${index}:`, JSON.stringify(d));
            return null;
          }

          let date = parseDate(d.date || d.timestamp);

          if (isNaN(date.getTime())) {
            console.error(`Invalid date at index ${index}:`, d.date || d.timestamp);
            return null;
          }

          const vixValue = parseFloat(d.VIX);
          if (isNaN(vixValue)) {
            console.error(`Invalid VIX value at index ${index}:`, d.VIX);
            return null;
          }

          validDataPoints++;
          console.log(`Successfully processed data point ${index}`);
          return {
            date: date.getTime(), // Store as timestamp
            formattedDate: formatDate(date), // Add formatted date
            VIX: vixValue
          };
        }).filter(Boolean);

        console.log('Processed historical data:', JSON.stringify(processedData));
        console.log(`Valid data points: ${validDataPoints} out of ${historicalVIX.length}`);

        if (processedData.length === 0) {
          throw new Error(`No valid historical VIX data after processing. Valid: ${validDataPoints}, Total: ${historicalVIX.length}`);
        }

        setHistoricalData(processedData);
      } catch (err) {
        console.error('Error in loadVixData:', err);
        setError(`${err.message || 'An error occurred while fetching VIX data'}. Check console for details.`);
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

  if (!vixData || historicalData.length === 0) {
    return <div className="error">Keine VIX-Daten verfügbar. Bitte überprüfen Sie die Konsolenausgabe für weitere Details.</div>;
  }

  const chartConfig = {
    xAxisDataKey: 'formattedDate', // Use the formatted date for x-axis
    dataKey: 'VIX',
    xAxisFormatter: formatDate,
    tooltipFormatter: (value, name, props) => {
      if (name === 'VIX') {
        return [`VIX: ${value.toFixed(2)}`, `Datum: ${props.payload.formattedDate}`];
      }
      return [value, name];
    }
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
      category="Marktstimmung"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      chartConfig={chartConfig}
      isRealtime={true}
      interpretationText={interpretationText}
    />
  );
};

export default VixComponent;
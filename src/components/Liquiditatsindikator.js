import React, { useEffect, useState, useMemo } from 'react';
import { 
  ComposedChart, 
  Area, 
  Line,
  XAxis,
  YAxis as RechartsYAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { supabase } from '../supabaseClient';
import DataCard from './DataCard';

const Liquiditatsindikator = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('liquidity_vs_qqq')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedData = data.map(item => ({
        date: new Date(item.date).getTime(),
        qqq: parseFloat(item.qqq),
        liquidity: parseFloat(item.liquidity)
      }));

      setData(formattedData);
      
      // Add these logging statements
      console.log('Fetched data count:', formattedData.length);
      console.log('First data point:', formattedData[0]);
      console.log('Last data point:', formattedData[formattedData.length - 1]);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const crossPointDate = new Date('2023-05-30'); // Target date
    const crossPointValue = 349.98;

    // Function to compare dates ignoring time components
    const isSameDate = (date1, date2) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    return data.map(item => {
      const itemDate = new Date(item.date);
      return {
        ...item,
        crossPoint: isSameDate(itemDate, crossPointDate) ? { x: item.date, y: crossPointValue } : null
      };
    });
  }, [data]);

  const chartConfig = useMemo(() => {
    if (data.length === 0) return {};

    const qqqValues = data.map(item => item.qqq);
    const liquidityValues = data.map(item => item.liquidity);

    return {
      yAxisDomainQQQ: [Math.min(...qqqValues), Math.max(...qqqValues)],
      yAxisDomainLiquidity: [Math.min(...liquidityValues), Math.max(...liquidityValues)],
      yAxisFormatter: (value) => value.toFixed(2),
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Datum: ${new Date(label).toLocaleDateString()}`}</p>
          <p className="info">
            <span className="qqq-dot">●</span> Nasdaq100: {payload[0].value.toFixed(2)}
          </p>
          <p className="info">
            <span className="liquidity-dot">●</span> Global Liquidity Index: {payload[1].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // CrossPoint component
  const CrossPoint = (props) => {
    const { cx, cy } = props;
    return (
      <g>
        {/* Outer glow */}
        <circle cx={cx} cy={cy} r={12} fill="rgba(255, 215, 0, 0.3)">
          <animate 
            attributeName="r" 
            values="12;16;12" 
            dur="2s" 
            repeatCount="indefinite" 
            keyTimes="0;0.5;1"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            calcMode="spline"
          />
          <animate 
            attributeName="opacity" 
            values="0.6;0.2;0.6" 
            dur="2s" 
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            calcMode="spline"
          />
        </circle>
        {/* Main dot */}
        <circle cx={cx} cy={cy} r={7} fill="#FFD700" stroke="#000000" strokeWidth="2">
          <animate 
            attributeName="r" 
            values="7;9;7" 
            dur="2s" 
            repeatCount="indefinite"
            keyTimes="0;0.5;1"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
            calcMode="spline"
          />
        </circle>
      </g>
    );
  };

  const CustomChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          domain={['dataMin', 'dataMax']}
          type="number"
          tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
          tickCount={5}
        />
        <RechartsYAxis 
          yAxisId="left"
          orientation="left"
          domain={chartConfig.yAxisDomainQQQ}
          tickFormatter={chartConfig.yAxisFormatter}
          stroke="var(--highlight)"
        />
        <RechartsYAxis 
          yAxisId="right"
          orientation="right"
          domain={chartConfig.yAxisDomainLiquidity}
          tickFormatter={chartConfig.yAxisFormatter}
          stroke="#ff0000"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="qqq" 
          stroke="var(--highlight)" 
          fill="var(--highlight)"
          fillOpacity={0.3}
          strokeWidth={2}
          dot={false}
          name="Nasdaq100"
          yAxisId="left"
        />
        <Line 
          type="monotone" 
          dataKey="liquidity" 
          stroke="#ff0000" 
          strokeWidth={2}
          dot={false}
          name="Liquidity Index"
          yAxisId="right"
          filter="url(#glow)"
        />
        {/* Add the ReferenceDot where crossPoint exists */}
        {chartData.map((entry, index) => (
          entry.crossPoint && (
            <ReferenceDot
              key={index}
              x={entry.date}
              y={entry.crossPoint.y}
              yAxisId="left"
              shape={<CrossPoint />}
            />
          )
        ))}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </ComposedChart>
    </ResponsiveContainer>
  );

  const { currentLiquidity, oneMonthAvg, threeMonthAvg, trend } = useMemo(() => {
    if (data.length === 0) return { currentLiquidity: null, oneMonthAvg: null, threeMonthAvg: null, trend: null };

    const currentLiquidity = data[data.length - 1].liquidity;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const oneMonthData = data.filter(d => new Date(d.date) >= oneMonthAgo);
    const threeMonthData = data.filter(d => new Date(d.date) >= threeMonthsAgo);

    const oneMonthAvg = oneMonthData.reduce((sum, d) => sum + d.liquidity, 0) / oneMonthData.length;
    const threeMonthAvg = threeMonthData.reduce((sum, d) => sum + d.liquidity, 0) / threeMonthData.length;

    let trend;
    if (currentLiquidity < oneMonthAvg && currentLiquidity < threeMonthAvg) {
      trend = "stark fallend";
    } else if (currentLiquidity < oneMonthAvg || currentLiquidity < threeMonthAvg) {
      trend = "leicht fallend";
    } else if (currentLiquidity > oneMonthAvg && currentLiquidity > threeMonthAvg) {
      trend = "stark steigend";
    } else if (currentLiquidity > oneMonthAvg || currentLiquidity > threeMonthAvg) {
      trend = "leicht steigend";
    } else {
      trend = "stabil";
    }

    return { currentLiquidity, oneMonthAvg, threeMonthAvg, trend };
  }, [data]);

  const expandedExplanation = `
Die 100X Liquiditätsmessung vergleicht die globalale Liquidität mit dem Nasdaq 100 Index über die letzten drei Jahre. 

Wichtige Aspekte:

1. 100X Liquiditätsmessung:
   • Misst die weltweite Verfügbarkeit von Liquidität
   • Werte über 100 deuten auf überdurchschnittliche Liquidität hin
   • Werte unter 100 signalisieren unterdurchschnittliche Liquidität

   Formel:
   Global Liquidity Index = Federal Reserve System (FED) - Treasury General Account (TGA) - Reverse Repurchase Agreements (RRP) + European Central Bank (ECB) + People's Bank of China (PBC) + Bank of Japan (BOJ) + Bank of England (BOE) + Bank of Canada (BOC) + Reserve Bank of Australia (RBA) + Reserve Bank of India (RBI) + Swiss National Bank (SNB) + Central Bank of the Russian Federation (CBR) + Central Bank of Brazil (BCB) + Bank of Korea (BOK) + Reserve Bank of New Zealand (RBNZ) + Sweden's Central Bank (Riksbank) + Central Bank of Malaysia (BNM)

2. Nasdaq 100:
   • Repräsentiert die Performance großer Technologie- und Wachstumsunternehmen
   • Dient als Proxy für risikoreiche Anlagen

3. Zusammenhang:
   • Hohe Liquidität tendiert dazu, Risikoanlagen zu unterstützen
   • Niedrige Liquidität kann Druck auf Risikoanlagen ausüben

4. Interpretation:
   • Divergenzen zwischen Liquidität und Nasdaq 100 können auf potenzielle Trendwenden hindeuten
   • Anhaltende Trends in beiden Indikatoren verstärken die Marktsignale

5. Konträre Sichtweise:
   • Extreme Werte in beiden Richtungen können auf überkaufte oder überverkaufte Bedingungen hinweisen
   • Gegenläufige Bewegungen zwischen Liquidität und Marktperformance können Gelegenheiten für antizyklische Strategien bieten

6. Risiken:
   • Liquidität allein bestimmt nicht die Marktrichtung
   • Andere Faktoren wie Wirtschaftswachstum, Geldpolitik und geopolitische Ereignisse spielen ebenfalls eine wichtige Rolle

Beachten Sie, dass dieser Indikator als Teil einer umfassenderen Analyse betrachtet werden sollte und nicht als alleiniges Signal für Investitionsentscheidungen dienen sollte.
`;

  const interpretationText = currentLiquidity !== null ? 
    `Der aktuelle Wert des 100X Liquidity Index beträgt <strong>${currentLiquidity.toFixed(2)}</strong>. 
    Im Vergleich zum 1-Monats-Durchschnitt (${oneMonthAvg.toFixed(2)}) und 3-Monats-Durchschnitt (${threeMonthAvg.toFixed(2)}) 
    ist der Trend <strong>${trend}</strong>. ${
      currentLiquidity > 100
        ? "Dies deutet auf überdurchschnittliche globale Liquidität hin, was tendenziell positiv für Risikoanlagen ist."
        : currentLiquidity < 100
        ? "Dies deutet auf unterdurchschnittliche globale Liquidität hin, was möglicherweise Vorsicht bei Risikoanlagen erfordert."
        : "Dies entspricht dem langfristigen Durchschnitt der globalen Liquidität."
    }` : 'Interpretation aufgrund fehlender Daten nicht verfügbar.';

  const warningMessage = `Achtung: Die globale Liquidität nimmt ab, während die Aktienkurse weiter steigen. Dies ist ein seltenes Phänomen und könnte auf ein erhöhtes Marktrisiko hindeuten.`;

  if (loading) {
    return <div className="loading">Liquiditätsindikator wird geladen...</div>;
  }

  if (error) {
    return <div className="error">Fehler beim Abrufen des Liquiditätsindikators: {error}</div>;
  }

  const latestData = data[data.length - 1];

  return (
    <DataCard 
      title="100X Liquiditätsmessung"
      value={currentLiquidity !== null ? `${currentLiquidity.toFixed(2)}` : 'N/A'}
      timestamp={latestData ? new Date(latestData.date).toLocaleDateString() : null}
      category="Marktliquidität"
      explanation={<pre className="expanded-explanation">{expandedExplanation}</pre>}
      chartConfig={chartConfig}
      interpretationText={interpretationText}
      chartData={data}
      warningMessage={warningMessage}
      isRealtime={true}
    >
      <CustomChart />
    </DataCard>
  );
};

export default Liquiditatsindikator;
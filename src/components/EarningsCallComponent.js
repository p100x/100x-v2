import React, { useState, useEffect } from 'react';
import DataCard from './DataCard';
import { fetchLatestEarningsCalls } from '../services/marketDataService';
import ReactMarkdown from 'react-markdown';

const EarningsCallComponent = () => {
  const [earningsCalls, setEarningsCalls] = useState([]);
  const [expandedCall, setExpandedCall] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState('Calculating...');

  useEffect(() => {
    const loadEarningsCalls = async () => {
      try {
        const calls = await fetchLatestEarningsCalls();
        if (Array.isArray(calls) && calls.length > 0) {
          setEarningsCalls(calls);
        } else {
          setError('No earnings calls data available');
        }
      } catch (error) {
        setError(error.message || 'An error occurred while fetching earnings calls');
      }
    };

    loadEarningsCalls();

    const nextEarningsDate = new Date('2024-09-26T21:00:00Z');
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = nextEarningsDate - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCountdown(`${days} Tage, ${hours} Stunden`);
      } else {
        setCountdown('In Kürze!');
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000 * 60);

    return () => clearInterval(timer);
  }, []);

  const toggleExpand = (index) => {
    setExpandedCall(expandedCall === index ? null : index);
  };

  const renderCallSummary = (call, index) => (
    <div key={index} className={`earnings-call-item ${expandedCall === index ? 'expanded' : ''}`}>
      <div className="earnings-call-summary" onClick={() => toggleExpand(index)}>
        <div className="earnings-call-header">
          <div className="earnings-call-company-container">
            <span className="earnings-call-company">{call.company}</span>
          </div>
          <div className="earnings-call-info">
            <span className="earnings-call-date">{new Date(call.date).toLocaleDateString()}</span>
            {call.interpretation && (
              <span className={`earnings-call-interpretation ${call.interpretation.toLowerCase()}`}>
                {call.interpretation}
              </span>
            )}
          </div>
        </div>
        <p className="earnings-call-text">{call.summary}</p>
      </div>
      <div className="earnings-call-details">
        {call.company_info && (
          <div className="earnings-call-section">
            <h4 className="earnings-call-subtitle">Über das Unternehmen</h4>
            <p className="earnings-call-text">{call.company_info}</p>
          </div>
        )}
        <div className="earnings-call-section">
          <h4 className="earnings-call-subtitle">Marktreaktion</h4>
          <p className="earnings-call-text">{call.stock_response}%</p>
        </div>
        {call.key_points && (
          <div className="earnings-call-section">
            <h4 className="earnings-call-subtitle">Hauptpunkte</h4>
            <ul className="earnings-call-list">
              {call.key_points.map((point, i) => (
                <li key={i} className="earnings-call-text">{point}</li>
              ))}
            </ul>
          </div>
        )}
        {call.context && (
          <div className="earnings-call-section">
            <h4 className="earnings-call-subtitle">Kontext</h4>
            <ReactMarkdown>{call.context}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );

  const customContent = (
    <div className="earnings-call-container">
      <div className="earnings-call-countdown">
        <h4>Nächster wichtiger Geschäftsbericht:</h4>
        <p>{countdown}</p>
      </div>
      {error ? (
        <p className="earnings-call-text">Fehler: {error}</p>
      ) : earningsCalls.length === 0 ? (
        <p className="earnings-call-text">Keine Geschäftsberichte verfügbar.</p>
      ) : (
        earningsCalls.map((call, index) => renderCallSummary(call, index))
      )}
    </div>
  );

  return (
    <DataCard 
      title="Geschäftsberichte"
      category="Unternehmensanalyse"
      value={customContent}
      isRealtime={false}
      interpretationText="Die neuesten Geschäftsberichte geben Einblicke in die finanzielle Leistung und zukünftige Aussichten wichtiger Unternehmen."
    />
  );
};

export default EarningsCallComponent;
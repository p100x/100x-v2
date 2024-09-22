import React, { useEffect } from 'react';
import { format } from 'date-fns';

const EarningsCalendar = ({ isOpen, setIsOpen }) => {
  const upcomingEarnings = [
    { company: 'Apple Inc.', date: new Date(2024, 9, 15) },
    { company: 'Microsoft Corporation', date: new Date(2024, 9, 18) },
    { company: 'Amazon.com, Inc.', date: new Date(2024, 9, 22) },
    { company: 'Alphabet Inc.', date: new Date(2024, 9, 25) },
    { company: 'Meta Platforms, Inc.', date: new Date(2024, 9, 29) },
  ];

  const economicData = [
    { event: 'BIP-Bericht', date: new Date(2024, 9, 20) },
    { event: 'Arbeitslosenzahlen', date: new Date(2024, 9, 23) },
    { event: 'Inflationsrate', date: new Date(2024, 9, 27) },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content calendar-modal">
        <h2>Finanzkalender</h2>
        
        <h3>Kommende Geschäftsberichte</h3>
        <ul className="calendar-list">
          {upcomingEarnings.map((earning, index) => (
            <li key={`earning-${index}`}>
              <span className="calendar-company">{earning.company}</span>
              <span className="calendar-date">{format(earning.date, 'dd.MM.yyyy')}</span>
            </li>
          ))}
        </ul>

        <h3>Wirtschaftsdaten-Veröffentlichungen</h3>
        <ul className="calendar-list">
          {economicData.map((data, index) => (
            <li key={`economic-${index}`}>
              <span className="calendar-event">{data.event}</span>
              <span className="calendar-date">{format(data.date, 'dd.MM.yyyy')}</span>
            </li>
          ))}
        </ul>

        <button className="modal-close" onClick={() => setIsOpen(false)}>Schließen</button>
      </div>
    </div>
  );
};

export default EarningsCalendar;
import React from 'react';

const RealtimeIndicator = ({ isRealtime }) => {
  return (
    <span className={isRealtime ? 'realtime-indicator' : 'delayed-indicator'}>
      <span className="indicator-box">{isRealtime ? 'ECHTZEIT-DATEN' : 'VERZÖGERTE DATEN'}</span>
    </span>
  );
};

export default RealtimeIndicator;
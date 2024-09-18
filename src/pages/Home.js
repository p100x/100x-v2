// src/pages/Home.js
import React from 'react';
import VixComponent from '../components/VixComponent';
import SummaryComponent from '../components/SummaryComponent'; // Import new summary component

const Home = () => {
  return (
    <div>
      <h1>Market Data Overview</h1>
      <SummaryComponent />  {/* New summary component */}
      <VixComponent />
    </div>
  );
};

export default Home;

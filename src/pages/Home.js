// src/pages/Home.js
import React from 'react';
import VixComponent from '../components/VixComponent';
import SummaryComponent from '../components/SummaryComponent'; // Import new summary component
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Market Data Overview</h1>
      <SummaryComponent />  {/* New summary component */}
      <VixComponent />
      <Link to="/account">Manage Account</Link>
    </div>
  );
};

export default Home;

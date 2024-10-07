import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import Spinner from '../components/Spinner';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    // Simulating data fetching
    const fetchPortfolio = async () => {
      // Replace this with actual API call in the future
      const mockPortfolio = [
        { name: 'Tesla', symbol: 'TSLA', positionSize: 34.37, currentGain: 743.79 },
        { name: 'Meta Platforms', symbol: 'META', positionSize: 11.04, currentGain: 103.41 },
        { name: 'iShares 20+ Year Treasury Bond ETF', symbol: 'TLT', positionSize: 9.20, currentGain: -5.02 },
        { name: 'Amazon', symbol: 'AMZN', positionSize: 6.68, currentGain: 370.23 },
        { name: 'Palantir Technologies', symbol: 'PLTR', positionSize: 5.77, currentGain: 278.45 },
        { name: 'KraneShares CSI China Internet ETF', symbol: 'KWEB', positionSize: 5.15, currentGain: 4.63 },
        { name: 'Tencent', symbol: 'TCEHY', positionSize: 5.03, currentGain: 3.53 },
        { name: 'Mercado Libre', symbol: 'MELI', positionSize: 4.36, currentGain: 189.63 },
        { name: 'Wise', symbol: 'WISE', positionSize: 3.65, currentGain: 1.97 },
        { name: 'Cloudflare', symbol: 'NET', positionSize: 3.20, currentGain: 12.41 },
        { name: 'SoFi Technologies', symbol: 'SOFI', positionSize: 2.91, currentGain: -20.60 },
        { name: 'The Trade Desk', symbol: 'TTD', positionSize: 2.89, currentGain: 75.34 },
        { name: 'Shopify', symbol: 'SHOP', positionSize: 1.85, currentGain: 153.31 },
        { name: 'Airbnb', symbol: 'ABNB', positionSize: 1.36, currentGain: -6.53 },
        { name: 'Enphase Energy', symbol: 'ENPH', positionSize: 0.93, currentGain: -13.19 },
        { name: 'Roblox', symbol: 'RBLX', positionSize: 0.77, currentGain: -45.39 },
        { name: 'Lithium Americas', symbol: 'LAC', positionSize: 0.49, currentGain: -50.50 },
        { name: 'Rocket Lab USA', symbol: 'RKLB', positionSize: 0.36, currentGain: 74.54 },
      ];

      setPortfolio(mockPortfolio);
      setIsLoading(false);
    };

    fetchPortfolio();
  }, []);

  return (
    <div className="portfolio-page">
      <h1>Aktienportfolio</h1>
      <br />
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="portfolio-list data-card">
          {portfolio.map((stock, index) => (
            <div key={index} className="portfolio-item">
              <div className="portfolio-item-main">
                <div className="portfolio-item-name">
                  <h2>{stock.name}</h2>
                  <span className="portfolio-item-symbol">{stock.symbol}</span>
                </div>
                <div className={`portfolio-item-gain ${stock.currentGain >= 0 ? 'positive' : 'negative'}`}>
                  {stock.currentGain.toFixed(2)}%
                </div>
              </div>
              <div className="portfolio-item-details">
                <span>Positionsgröße: {stock.positionSize.toFixed(2)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Portfolio;

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
        { 
          name: 'Tesla', 
          symbol: 'TSLA', 
          positionSize: 34.37, 
          currentGain: 743.79, 
          info: 'Tesla ist ein Unternehmen für Elektrofahrzeuge und saubere Energie. Es ist bekannt für seinen innovativen Ansatz in den Bereichen nachhaltiger Transport und Energielösungen.' 
        },
        { 
          name: 'Meta Platforms', 
          symbol: 'META', 
          positionSize: 11.04, 
          currentGain: 103.41, 
          info: 'Meta Platforms, ehemals Facebook, ist ein Technologieunternehmen mit Fokus auf soziale Medien und virtuelle Realität. Es besitzt beliebte Plattformen wie Facebook, Instagram und WhatsApp.' 
        },
        { 
          name: 'iShares 20+ Year Treasury Bond ETF', 
          symbol: 'TLT', 
          positionSize: 9.20, 
          currentGain: -5.02, 
          info: 'TLT ist ein börsengehandelter Fonds, der langfristige US-Staatsanleihen abbildet. Er bietet Zugang zum US-Staatsanleihenmarkt mit Schwerpunkt auf Anleihen mit Laufzeiten von über 20 Jahren.' 
        },
        { 
          name: 'Amazon', 
          symbol: 'AMZN', 
          positionSize: 6.68, 
          currentGain: 370.23, 
          info: 'Amazon ist ein multinationales Technologieunternehmen mit Schwerpunkt auf E-Commerce, Cloud Computing und künstlicher Intelligenz. Es ist bekannt für seine breite Palette an Produkten und Dienstleistungen, einschließlich Amazon Prime und AWS.' 
        },
        { 
          name: 'Palantir Technologies', 
          symbol: 'PLTR', 
          positionSize: 5.77, 
          currentGain: 278.45, 
          info: 'Palantir Technologies ist ein Softwareunternehmen, das sich auf Big-Data-Analysen spezialisiert hat. Es bietet Lösungen für Datenintegration und -analyse für Regierungsbehörden und große Unternehmen.' 
        },
        { 
          name: 'KraneShares CSI China Internet ETF', 
          symbol: 'KWEB', 
          positionSize: 5.15, 
          currentGain: 4.63, 
          info: 'KWEB ist ein ETF, der chinesische Internet- und E-Commerce-Unternehmen abbildet. Er bietet Zugang zum wachsenden Technologiesektor und Online-Verbrauchermarkt Chinas.' 
        },
        { 
          name: 'Tencent', 
          symbol: 'TCEHY', 
          positionSize: 5.03, 
          currentGain: 3.53, 
          info: 'Tencent ist ein chinesischer multinationaler Technologiekonzern. Es ist bekannt für seine Social-Media-Plattformen, seine Spieleabteilung und verschiedene internetbezogene Dienste.' 
        },
        { 
          name: 'Mercado Libre', 
          symbol: 'MELI', 
          positionSize: 4.36, 
          currentGain: 189.63, 
          info: 'Mercado Libre ist ein E-Commerce- und Fintech-Unternehmen in Lateinamerika. Es betreibt Online-Marktplätze und bietet digitale Zahlungslösungen in mehreren Ländern der Region an.' 
        },
        { 
          name: 'Wise', 
          symbol: 'WISE', 
          positionSize: 3.65, 
          currentGain: 1.97, 
          info: 'Wise, ehemals TransferWise, ist ein globales Technologieunternehmen, das sich auf internationale Geldtransfers spezialisiert hat. Es bietet internationale Überweisungen und Multi-Währungs-Konten an.' 
        },
        { 
          name: 'Cloudflare', 
          symbol: 'NET', 
          positionSize: 3.20, 
          currentGain: 12.41, 
          info: 'Cloudflare ist ein Unternehmen für Web-Infrastruktur und Website-Sicherheit. Es bietet Content Delivery Network-Dienste, DDoS-Schutz und Internetsicherheitslösungen an.' 
        },
        { 
          name: 'SoFi Technologies', 
          symbol: 'SOFI', 
          positionSize: 2.91, 
          currentGain: -20.60, 
          info: 'SoFi Technologies ist ein Finanzunternehmen, das eine Reihe von Finanzprodukten anbietet. Es bietet Privatkredite, Studentenkreditrefinanzierung, Hypotheken und Anlagedienstleistungen an.' 
        },
        { 
          name: 'The Trade Desk', 
          symbol: 'TTD', 
          positionSize: 2.89, 
          currentGain: 75.34, 
          info: 'The Trade Desk ist ein Technologieunternehmen im Bereich digitale Werbung. Es bietet eine Self-Service-Plattform für Werbetreibende zur Erstellung und Verwaltung digitaler Werbekampagnen.' 
        },
        { 
          name: 'Shopify', 
          symbol: 'SHOP', 
          positionSize: 1.85, 
          currentGain: 153.31, 
          info: 'Shopify ist eine E-Commerce-Plattform für Online-Shops und Einzelhandelskassensysteme. Es bietet Tools und Dienstleistungen für Unternehmen zur Erstellung und Betreibung ihrer Online-Shops.' 
        },
        { 
          name: 'Airbnb', 
          symbol: 'ABNB', 
          positionSize: 1.36, 
          currentGain: -6.53, 
          info: 'Airbnb ist ein Online-Marktplatz für Unterkünfte, hauptsächlich für Ferienwohnungen. Es verbindet Gastgeber, die einzigartige Unterkünfte anbieten, mit Reisenden, die Alternativen zu traditionellen Hotels suchen.' 
        },
        { 
          name: 'Enphase Energy', 
          symbol: 'ENPH', 
          positionSize: 0.93, 
          currentGain: -13.19, 
          info: 'Enphase Energy ist ein Technologieunternehmen, das sich auf Solarenergielösungen spezialisiert hat. Es entwickelt und produziert softwaregesteuerte Heimenergielösungen für Solarstromerzeugung, Heimenergiespeicherung und webbasierte Überwachung und Steuerung.' 
        },
        { 
          name: 'Roblox', 
          symbol: 'RBLX', 
          positionSize: 0.77, 
          currentGain: -45.39, 
          info: 'Roblox ist eine Online-Spieleplattform und ein Spieleentwicklungssystem. Es ermöglicht Benutzern, Spiele zu programmieren und von anderen Benutzern erstellte Spiele zu spielen, und fördert so ein einzigartiges Ökosystem für nutzergenerierte Inhalte.' 
        },
        { 
          name: 'Lithium Americas', 
          symbol: 'LAC', 
          positionSize: 0.49, 
          currentGain: -50.50, 
          info: 'Lithium Americas ist ein Ressourcenunternehmen, das sich auf die Entwicklung von Lithiumprojekten konzentriert. Es arbeitet an der Förderung von Lithiumprojekten in Argentinien und den Vereinigten Staaten.' 
        },
        { 
          name: 'Rocket Lab USA', 
          symbol: 'RKLB', 
          positionSize: 0.36, 
          currentGain: 74.54, 
          info: 'Rocket Lab USA ist ein Luft- und Raumfahrthersteller und Anbieter von Startdiensten für Kleinsatelliten. Es entwickelt und produziert kleine Raketen und andere Raumfahrzeuge für kommerzielle, staatliche und wissenschaftliche Kunden.' 
        },
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
              <div className="portfolio-item-info">
                <p>{stock.info}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Tooltip } from 'react-tooltip';

const EarningsCalendar = ({ isOpen, setIsOpen }) => {
  const wirtschaftsdaten = [
    { ereignis: 'FOMC Protokoll', datum: new Date(2024, 9, 9, 20, 0), konsens: '-', vorherig: '-', aktuell: '-', erklaerung: 'Detaillierte Aufzeichnungen der Fed-Sitzungen. Gibt Einblicke in zukünftige Geldpolitik und kann Zinssätze und Währungskurse beeinflussen.' },
    { ereignis: 'Kerninflationsrate MoM SEP', datum: new Date(2024, 9, 10, 14, 30), konsens: '0,2%', vorherig: '0,3%', aktuell: '-', erklaerung: 'Misst Preisänderungen ohne volatile Lebensmittel- und Energiepreise. Wichtiger Indikator für die zugrunde liegende Inflation und beeinflusst die Geldpolitik.' },
    { ereignis: 'Kerninflationsrate YoY SEP', datum: new Date(2024, 9, 10, 14, 30), konsens: '3,2%', vorherig: '3,2%', aktuell: '-', erklaerung: 'Jährliche Veränderung der Kerninflation. Zeigt langfristige Inflationstrends und ist entscheidend für geldpolitische Entscheidungen.' },
    { ereignis: 'Inflationsrate MoM SEP', datum: new Date(2024, 9, 10, 14, 30), konsens: '0,1%', vorherig: '0,2%', aktuell: '-', erklaerung: 'Monatliche Veränderung der Verbraucherpreise. Wichtiger Indikator für kurzfristige Inflationstrends und kann Märkte stark beeinflussen.' },
    { ereignis: 'Inflationsrate YoY SEP', datum: new Date(2024, 9, 10, 14, 30), konsens: '2,3%', vorherig: '2,5%', aktuell: '-', erklaerung: 'Jährliche Inflationsrate. Zentral für geldpolitische Entscheidungen und beeinflusst Anleiherenditen und Währungskurse.' },
    { ereignis: 'Erzeugerpreisindex MoM SEP', datum: new Date(2024, 9, 11, 14, 30), konsens: '0,1%', vorherig: '0,2%', aktuell: '-', erklaerung: 'Misst Preisänderungen auf Produzentenebene. Frühindikator für Verbraucherpreisinflation und wichtig für Unternehmenserträge.' },
    { ereignis: 'Michigan Verbrauchervertrauen Vorl. OKT', datum: new Date(2024, 9, 11, 16, 0), konsens: '70,8', vorherig: '70,1', aktuell: '-', erklaerung: 'Misst die Verbraucherstimmung. Wichtiger Indikator für zukünftiges Konsumverhalten und kann Einzelhandels- und Konsumaktien beeinflussen.' },
    { ereignis: 'Einzelhandelsumsätze MoM SEP', datum: new Date(2024, 9, 17, 14, 30), konsens: '-', vorherig: '0,1%', aktuell: '-', erklaerung: 'Zeigt Veränderungen im Konsumverhalten. Wichtig für BIP-Prognosen und kann Einzelhandels- und Konsumaktien stark beeinflussen.' },
    { ereignis: 'Baugenehmigungen Vorl. SEP', datum: new Date(2024, 9, 18, 14, 30), konsens: '1,46 Mio.', vorherig: '1,470 Mio.', aktuell: '-', erklaerung: 'Indikator für zukünftige Bauaktivitäten. Wichtig für Immobilien- und Baustoffsektor sowie als Konjunkturindikator.' },
    { ereignis: 'Auftragseingang langlebiger Güter MoM SEP', datum: new Date(2024, 9, 25, 14, 30), konsens: '-', vorherig: '0,0%', aktuell: '-', erklaerung: 'Misst Bestellungen für langlebige Produkte. Wichtiger Indikator für Industrieproduktion und Unternehmensausgaben.' },
    { ereignis: 'JOLTs Stellenangebote SEP', datum: new Date(2024, 9, 29, 16, 0), konsens: '8,4 Mio.', vorherig: '8,04 Mio.', aktuell: '-', erklaerung: 'Zeigt offene Stellen in der Wirtschaft. Wichtiger Indikator für Arbeitsmarktdynamik und kann Lohnwachstum und Inflation beeinflussen.' },
    { ereignis: 'BIP-Wachstumsrate QoQ Vorl. Q3', datum: new Date(2024, 9, 30, 14, 30), konsens: '1,2%', vorherig: '3%', aktuell: '-', erklaerung: 'Misst das Wirtschaftswachstum. Einer der wichtigsten Wirtschaftsindikatoren, der Aktien-, Anleihe- und Währungsmärkte stark beeinflusst.' },
    { ereignis: 'Kern-PCE-Preisindex MoM SEP', datum: new Date(2024, 9, 31, 14, 30), konsens: '-0,1%', vorherig: '0,1%', aktuell: '-', erklaerung: 'Bevorzugtes Inflationsmaß der Fed. Sehr wichtig für geldpolitische Entscheidungen und kann Märkte signifikant beeinflussen.' },
    { ereignis: 'Persönliches Einkommen MoM SEP', datum: new Date(2024, 9, 31, 14, 30), konsens: '0,2%', vorherig: '0,2%', aktuell: '-', erklaerung: 'Zeigt Veränderungen im Einkommen der Verbraucher. Wichtig für Konsumprognosen und kann Einzelhandels- und Konsumaktien beeinflussen.' },
    { ereignis: 'Persönliche Ausgaben MoM SEP', datum: new Date(2024, 9, 31, 14, 30), konsens: '0,1%', vorherig: '0,2%', aktuell: '-', erklaerung: 'Misst Veränderungen in den Verbraucherausgaben. Wichtiger Indikator für Konsumtrends und gesamtwirtschaftliche Nachfrage.' },
    { ereignis: 'Beschäftigung außerhalb der Landwirtschaft OKT', datum: new Date(2024, 10, 1, 14, 30), konsens: '180,0K', vorherig: '254K', aktuell: '-', erklaerung: 'Zeigt die Anzahl neuer Arbeitsplätze. Einer der wichtigsten Arbeitsmarktindikatoren, der Aktien-, Anleihe- und Währungsmärkte stark beeinflusst.' },
    { ereignis: 'Arbeitslosenquote OKT', datum: new Date(2024, 10, 1, 14, 30), konsens: '-', vorherig: '4,1%', aktuell: '-', erklaerung: 'Misst den Anteil der Arbeitslosen an der Erwerbsbevölkerung. Wichtiger Indikator für wirtschaftliche Gesundheit und kann geldpolitische Entscheidungen beeinflussen.' },
    { ereignis: 'ISM Produktions-PMI OKT', datum: new Date(2024, 10, 1, 16, 0), konsens: '-', vorherig: '-', aktuell: '-', erklaerung: 'Misst die Aktivität im verarbeitenden Gewerbe. Wichtiger Frühindikator für Wirtschaftswachstum und kann Industrieaktien beeinflussen.' },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content calendar-modal">
        <h2>Wirtschaftsdaten-Veröffentlichungen</h2>
        
        <div className="calendar-table-container">
          <table className="calendar-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Ereignis</th>
                <th>Konsens</th>
                <th>Vorherig</th>
                <th>Aktuell</th>
              </tr>
            </thead>
            <tbody>
              {wirtschaftsdaten.map((data, index) => (
                <tr key={`economic-${index}`}>
                  <td>{format(data.datum, "dd.MM.yyyy HH:mm", { locale: de })}</td>
                  <td>
                    <span data-tooltip-id={`tooltip-${index}`}>
                      {data.ereignis}
                    </span>
                    <Tooltip id={`tooltip-${index}`} className="custom-tooltip">
                      <span>{data.erklaerung}</span>
                    </Tooltip>
                  </td>
                  <td>{data.konsens}</td>
                  <td>{data.vorherig}</td>
                  <td>{data.aktuell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="modal-close" onClick={() => setIsOpen(false)}>Schließen</button>
      </div>
    </div>
  );
};

export default EarningsCalendar;
import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';

const Mastermind = () => {
  const { subscription } = useSubscription();
  const hasActiveSubscription = subscription && subscription.subscription_status === 'active';

  return (
    <div className="mastermind-page">
      <h1>100X Mastermind</h1>
      <p>Willkommen auf unserer umfassenden Bildungsplattform für Investoren aller Ebenen.</p>

      {!hasActiveSubscription && (
        <div className="upgrade-overlay">
          <div className="upgrade-message">
            <h2>Upgrade erforderlich</h2>
            <p>Um auf alle Funktionen zugreifen zu können, benötigen Sie ein aktives Abonnement.</p>
            <Link to="/upgrade" className="upgrade-button">Jetzt upgraden</Link>
          </div>
        </div>
      )}

      <div className={`components-grid ${!hasActiveSubscription ? 'blurred' : ''}`}>
        {/* Updated referral section */}
        <section className="ibkr-referral">
          <p>
            Für fortgeschrittene Strategien dringend empfohlen: 
            <a href="https://ibkr.com/referral/maximilian328" target="_blank" rel="noopener noreferrer" className="referral-link">
              IBKR Konto kostenlos eröffnen
            </a>
            <span className="bonus-text">Bonus: Gratis-Aktie bis zu 1.000 USD</span>
          </p>
        </section>

        <section className="course-section">
          <h2>Hervorgehobene Kurse</h2>
          <div className="course-grid">
            <div className="course-card">
              <div className="course-video-placeholder"></div>
              <h3>Kurs 1: ████████ ███████</h3>
              <p>███████ ███ ████████ ███ ██████████ ███ ███ ██████ ████████ ███ ████ ████████ ███████.</p>
              <button className="enroll-button">Jetzt einschreiben</button>
              <div className="coming-soon-overlay">In Kürze</div>
            </div>
            <div className="course-card">
              <div className="course-video-placeholder"></div>
              <h3>Kurs 2: ███████████ ██████████</h3>
              <p>██████ ███ ██ ████████ ████████████████ ███ ████████████ ██████████.</p>
              <button className="enroll-button">Jetzt einschreiben</button>
              <div className="coming-soon-overlay">In Kürze</div>
            </div>
            <div className="course-card">
              <div className="course-video-placeholder"></div>
              <h3>Kurs 3: ██████████████ ███████</h3>
              <p>██████ ███ ██████████ ██ █████████ ███ ██████████ ████████████████████████ ██ ███████.</p>
              <button className="enroll-button">Jetzt einschreiben</button>
              <div className="coming-soon-overlay">In Kürze</div>
            </div>
          </div>
        </section>

        <section className="resources-section">
          <h2>Bildungsressourcen</h2>
          <div className="resource-list">
            <div className="resource-item">
              <h3>████████████████ ███████</h3>
              <p>███ ██████████ ███████ ███ ██████████ ███ ████████████████ ███ ███████████.</p>
              <a href="#" className="resource-link">Mehr lesen</a>
              <div className="coming-soon-overlay">In Kürze</div>
            </div>
            <div className="resource-item">
              <h3>████████████ ███████████</h3>
              <p>███████ ███ ███ ███ ███████ ████ ████████ ███████ ██████ ███ ██████████.</p>
              <a href="#" className="resource-link">Neueste ansehen</a>
              <div className="coming-soon-overlay">In Kürze</div>
            </div>
            <div className="resource-item">
              <h3>████████████████████</h3>
              <p>███████ ███ ██████ ████ ███ ██████████ ████████████ ██ ████ ██████████████ ████████ ██ ██████.</p>
              <a href="#" className="resource-link">Tools verwenden</a>
              <div className="coming-soon-overlay">In Kürze</div>
            </div>
          </div>
        </section>

        <section className="webinar-section">
          <h2>Kommende Webinare</h2>
          <div className="webinar-list">
            <div className="webinar-item">
              <h3>████████: ███ ███████ ███ ███████</h3>
              <p>Datum: ██. ████ ████ | Zeit: ██:██ Uhr MEZ</p>
              <button className="register-button">Jetzt registrieren</button>
              <div className="coming-soon-overlay">In Kürze</div>
            </div>
            <div className="webinar-item">
              <h3>███████████ ██████████: ██████ ███ █████</h3>
              <p>Datum: ██. ████ ████ | Zeit: ██:██ Uhr MEZ</p>
              <button className="register-button">Jetzt registrieren</button>
              <div className="coming-soon-overlay">In Kürze</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Mastermind;
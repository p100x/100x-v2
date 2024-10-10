import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const loadGoogleAnalytics = () => {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9YWN4XBX5M';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-9YWN4XBX5M');
      };
    };

    loadGoogleAnalytics();
  }, []);

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-9YWN4XBX5M', { page_path: location.pathname });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
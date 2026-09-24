import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ErrorBanner from '../ui/ErrorBanner';
import { getHealth } from '../../services/api';

const Layout = ({ children }) => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [offlineError, setOfflineError] = useState(false);

  const checkBackendHealth = async () => {
    try {
      const data = await getHealth();
      setHealthStatus(data);
      setOfflineError(false);
    } catch (err) {
      setHealthStatus({ status: 'offline', model_loaded: false });
      setOfflineError(true);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    // Poll health status every 10 seconds
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Sidebar healthStatus={healthStatus} />
      <div className="main-wrapper">
        <Header />
        <main className="content-area">
          {offlineError && (
            <ErrorBanner
              message="Unable to connect to ML backend. Please start FastAPI on port 8000."
              onRetry={checkBackendHealth}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

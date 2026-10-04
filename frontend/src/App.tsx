import React, { useState, useEffect } from 'react';
import api from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TrafficSimulatorModal } from './components/TrafficSimulatorModal';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PoliceDashboard } from './pages/PoliceDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { DriverView } from './pages/DriverView';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MLInsightsPage } from './pages/MLInsightsPage';

export const App: React.FC = () => {
  const [viewState, setViewState] = useState<'LANDING' | 'LOGIN' | 'APP'>('LANDING');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [trafficLevel, setTrafficLevel] = useState<string>('HIGH');
  const [isTrafficSimOpen, setIsTrafficSimOpen] = useState<boolean>(false);
  const [policeAlertCount, setPoliceAlertCount] = useState<number>(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('sara_user');
    const token = localStorage.getItem('sara_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        setViewState('APP');
      } catch (e) {
        localStorage.removeItem('sara_user');
        localStorage.removeItem('sara_token');
      }
    }
  }, []);

  // Poll police alerts count for sidebar badge
  useEffect(() => {
    if (viewState === 'APP') {
      const checkAlerts = async () => {
        try {
          const res = await api.get('/police/alerts');
          const pending = res.data.filter((a: any) => a.status === 'PENDING').length;
          setPoliceAlertCount(pending);
        } catch (e) {
          // silent error catch
        }
      };
      checkAlerts();
      const interval = setInterval(checkAlerts, 4000);
      return () => clearInterval(interval);
    }
  }, [viewState]);

  const handleLogout = () => {
    localStorage.removeItem('sara_user');
    localStorage.removeItem('sara_token');
    setUser(null);
    setViewState('LANDING');
  };

  const handleStartSimulation = async () => {
    try {
      // 1. Start simulation
      const res = await api.post('/simulation/start');
      const emgId = res.data.emergency_id;
      setActiveTab('police-coordination');

      // 2. Automate step progression for demonstration
      setTimeout(async () => {
        await api.post(`/simulation/step/${emgId}?step=POLICE_ACKNOWLEDGE`);
      }, 2000);

      setTimeout(async () => {
        await api.post(`/simulation/step/${emgId}?step=ACTIVATE_CORRIDOR`);
      }, 4000);

      setTimeout(async () => {
        await api.post(`/simulation/step/${emgId}?step=PICKUP_PATIENT`);
      }, 6500);

      setTimeout(async () => {
        await api.post(`/simulation/step/${emgId}?step=NOTIFY_HOSPITAL`);
        setActiveTab('hospitals');
      }, 9000);

      setTimeout(async () => {
        await api.post(`/simulation/step/${emgId}?step=HOSPITAL_ACCEPT`);
      }, 11500);

      setTimeout(async () => {
        await api.post(`/simulation/step/${emgId}?step=ARRIVE_HOSPITAL`);
        setActiveTab('analytics');
      }, 14000);

    } catch (err) {
      console.error('Error starting live emergency simulation:', err);
    }
  };

  if (viewState === 'LANDING') {
    return <LandingPage onEnter={() => setViewState('LOGIN')} />;
  }

  if (viewState === 'LOGIN') {
    return (
      <LoginPage
        onLoginSuccess={(userData) => {
          setUser(userData);
          setViewState('APP');
          if (userData.role === 'POLICE') setActiveTab('police-coordination');
          else if (userData.role === 'HOSPITAL') setActiveTab('hospitals');
          else if (userData.role === 'DRIVER') setActiveTab('driver-view');
          else setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTrafficLevel={trafficLevel}
        onOpenTrafficSim={() => setIsTrafficSimOpen(true)}
        onStartSimulation={handleStartSimulation}
      />

      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={user?.role || 'ADMIN'}
          policeAlertCount={policeAlertCount}
        />

        <main className="flex-1 overflow-x-hidden">
          {(activeTab === 'dashboard' || activeTab === 'emergencies' || activeTab === 'ambulances' || activeTab === 'live-map') && (
            <AdminDashboard
              onStartSimulation={handleStartSimulation}
              onOpenTrafficSim={() => setIsTrafficSimOpen(true)}
            />
          )}

          {activeTab === 'police-coordination' && <PoliceDashboard />}
          {activeTab === 'hospitals' && <HospitalDashboard />}
          {activeTab === 'driver-view' && <DriverView />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'ml-insights' && <MLInsightsPage />}
        </main>
      </div>

      <TrafficSimulatorModal
        isOpen={isTrafficSimOpen}
        onClose={() => setIsTrafficSimOpen(false)}
        currentTraffic={trafficLevel}
        onSelectTraffic={(level) => setTrafficLevel(level)}
      />
    </div>
  );
};

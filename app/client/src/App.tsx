import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { Dashboard } from './pages/Dashboard';
import { Sites } from './pages/Sites';
import { Sensors } from './pages/Sensors';
import { Calibration } from './pages/Calibration';
import { Analytics } from './pages/Analytics';
import { Simulator } from './pages/Simulator';
import { Settings } from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { sitesApi } from './api/sites.api';
import type { Site } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const data = await sitesApi.list();
        setSites(data);
        if (data.length > 0 && !selectedSiteId) {
          setSelectedSiteId(data[0].id);
        }
      } catch (e) {
        console.error('Error fetching global sites list', e);
      }
    };
    loadSites();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Desktop + Mobile Drawer */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <TopNav
          onMenuClick={() => setSidebarOpen(true)}
          activeRoute={activeTab}
          sites={sites}
          selectedSiteId={selectedSiteId}
          onSelectSite={(id) => setSelectedSiteId(id)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'sites' && (
            <Sites
              onSelectSite={setSelectedSiteId}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'sensors' && (
            <Sensors onSelectSite={setSelectedSiteId} />
          )}

          {activeTab === 'calibration' && (
            <Calibration
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics
              selectedSiteId={selectedSiteId}
              onSelectSite={setSelectedSiteId}
            />
          )}

          {activeTab === 'simulator' && <Simulator />}

          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}

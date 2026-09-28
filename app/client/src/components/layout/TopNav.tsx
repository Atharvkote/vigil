import { useState, useEffect } from 'react';
import { 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  MapPin, 
  X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Site } from '../../types';

export interface TopNavProps {
  onMenuClick?: () => void;
  activeRoute: string;
  sites: Site[];
  selectedSiteId: number | null;
  onSelectSite: (id: number) => void;
}

export function TopNav({
  onMenuClick,
  activeRoute,
  sites,
  selectedSiteId,
  onSelectSite,
}: TopNavProps) {
  const { actualTheme, toggleTheme } = useTheme();
  const [time, setTime] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const routeTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Operational Overview', subtitle: 'Real-time telemetry and risk telemetry' },
    sites: { title: 'Monitored Perimeter Sites', subtitle: 'Facility management and coordinates' },
    sensors: { title: 'Sensor Fleet Management', subtitle: 'Hardware profile contracts and parameter states' },
    calibration: { title: 'Calibration Intelligence Center', subtitle: 'Rule-driven sensitivity and threshold adjustments' },
    analytics: { title: 'Observability & Analytics', subtitle: 'Risk distributions and correlation trends' },
    simulator: { title: 'Environmental Simulator', subtitle: 'What-if weather impact modeling' },
    settings: { title: 'System Engine & Profiles', subtitle: 'Platform configuration and diagnostics' },
  };

  const currentRouteMeta = routeTitles[activeRoute] || { title: activeRoute, subtitle: '' };

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 sm:px-6 relative z-30 select-none">
      {/* Left Context: Mobile trigger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded hover:bg-surface-secondary text-muted hover:text-foreground transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <span className="hover:text-foreground cursor-pointer">VIGILSENSE</span>
            <span>/</span>
          </div>
          <span className="text-xs font-semibold text-foreground tracking-tight">
            {currentRouteMeta.title}
          </span>
        </div>
      </div>

      {/* Center: Global Monitored Site Selector */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-secondary border border-border text-xs">
          <MapPin size={13} className="text-primary" />
          <span className="text-muted text-[11px] uppercase font-mono">Monitored Facility:</span>
          <select
            value={selectedSiteId || ''}
            onChange={(e) => onSelectSite(Number(e.target.value))}
            className="bg-transparent text-foreground font-semibold font-mono text-xs focus:outline-none cursor-pointer"
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id} className="bg-surface text-foreground font-sans">
                {site.name} ({site.locationLabel.split(',')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Telemetry Clock, Theme Switcher, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-secondary border border-border text-[11px] font-mono text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span>{time}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle light and dark mode"
          className="p-1.5 rounded hover:bg-surface-secondary text-muted hover:text-foreground transition-colors"
          title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {actualTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            className="p-1.5 rounded hover:bg-surface-secondary text-muted hover:text-foreground transition-colors relative"
          >
            <Bell size={17} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
          </button>

          {/* Notifications Dropdown Drawer */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-surface shadow-xl py-2 z-50 animate-in fade-in duration-100">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="text-xs font-semibold text-foreground tracking-tight">
                  Operational Alerts
                </span>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-muted hover:text-foreground p-0.5"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="divide-y divide-border text-xs max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-surface-secondary/40 transition-colors">
                  <div className="flex items-center justify-between font-mono text-[10px] text-primary mb-1">
                    <span>CALIBRATION ENGINE</span>
                    <span>10m ago</span>
                  </div>
                  <p className="text-foreground font-medium">Fiber Optic Sensitivity Recalibration</p>
                  <p className="text-muted text-[11px] mt-0.5">Atmospheric wind velocity triggers sensitivity increase rule.</p>
                </div>

                <div className="p-3 hover:bg-surface-secondary/40 transition-colors">
                  <div className="flex items-center justify-between font-mono text-[10px] text-warning mb-1">
                    <span>WEATHER TELEMETRY</span>
                    <span>32m ago</span>
                  </div>
                  <p className="text-foreground font-medium">Telemetry sync completed</p>
                  <p className="text-muted text-[11px] mt-0.5">Open-Meteo verified coordinates feed active.</p>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-border bg-surface-secondary/30 text-center">
                <span className="text-[11px] text-muted font-mono">Audit trail saved in system logs</span>
              </div>
            </div>
          )}
        </div>

        {/* User / Operator Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded bg-primary-subtle border border-primary/30 flex items-center justify-center text-primary font-mono text-xs font-bold">
            OP
          </div>
          <span className="text-xs font-medium text-foreground hidden md:inline">
            Operator
          </span>
        </div>
      </div>
    </header>
  );
}

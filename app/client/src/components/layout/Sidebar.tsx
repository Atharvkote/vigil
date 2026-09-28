
import { 
  LayoutDashboard, 
  Map, 
  Cpu, 
  Sliders, 
  BarChart3, 
  FlaskConical, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import clsx from 'clsx';

export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navSections = [
    {
      title: 'OPERATIONAL',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'sites', label: 'Perimeter Sites', icon: Map },
        { id: 'sensors', label: 'Sensor Fleet', icon: Cpu },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'calibration', label: 'Calibration Center', icon: Sliders },
        { id: 'analytics', label: 'Observability', icon: BarChart3 },
        { id: 'simulator', label: 'Weather Simulator', icon: FlaskConical },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        { id: 'settings', label: 'System Engine', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={clsx(
        'h-full border-r border-border bg-surface flex flex-col transition-all duration-200 select-none z-40',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded bg-primary-subtle border border-primary/40 flex items-center justify-center shrink-0">
            <Shield size={16} className="text-primary" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-xs tracking-wider text-foreground font-mono block truncate">
                VIGILSENSE
              </span>
              <span className="text-[10px] text-muted tracking-widest uppercase block -mt-0.5 truncate">
                Perimeter Intelligence
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 rounded text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-5 overflow-y-auto no-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold font-mono tracking-wider text-muted uppercase mb-1.5">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all group relative',
                    isActive
                      ? 'bg-primary-subtle text-primary font-semibold border border-primary/20 shadow-xs'
                      : 'text-muted hover:text-foreground hover:bg-surface-secondary'
                  )}
                >
                  <Icon
                    size={16}
                    className={clsx(
                      'shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <span className="ml-auto w-1 h-3.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-border bg-surface-secondary/20 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-muted flex items-center gap-1.5">
              <Activity size={13} className="text-success" />
              Engine Online
            </span>
            <span className="text-[10px] text-muted">v1.0.0</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Engine Online (v1.0.0)">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}

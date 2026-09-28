import { LayoutDashboard, Map, BarChart3, FlaskConical, ScrollText, Cpu, Settings } from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sites', label: 'Sites', icon: Map },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'simulator', label: 'Simulator', icon: FlaskConical },
  { id: 'logs', label: 'Sensor Logs', icon: ScrollText },
  { id: 'ai', label: 'AI Engine', icon: Cpu },
];

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  return (
    <div className="w-64 h-full bg-[#0c1015] border-r border-surface-border flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-brand/20 flex items-center justify-center border border-brand/50">
          <div className="w-4 h-4 bg-brand rounded-sm"></div>
        </div>
        <div>
          <h1 className="text-white font-bold tracking-wider text-sm leading-tight">VIGIL</h1>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest">Environmental<br/>Intelligence</div>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand/10 text-brand border border-brand/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white">
          <Settings size={18} />
          Settings
        </button>
        <div className="mt-4 pt-4 border-t border-surface-border flex items-center justify-between px-4">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">System Status</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(0,230,118,0.5)]"></div>
            <span className="text-xs text-status-success font-medium">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

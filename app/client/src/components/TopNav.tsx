import { Bell, RefreshCw, Sun, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-14 border-b border-surface-border flex items-center justify-between px-4 md:px-6 bg-[#0c1015]">
      <div className="flex items-center gap-2">
        <button className="lg:hidden text-gray-400 hover:text-white mr-2" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex w-6 h-6 rounded bg-brand/20 items-center justify-center">
          <div className="w-2 h-2 bg-brand rounded-full"></div>
        </div>
        <span className="font-medium text-sm">Site Alpha</span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden sm:flex items-center gap-2 text-brand text-sm font-mono tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
          {time}
        </div>
        
        <div className="flex items-center gap-3 md:gap-4 text-gray-400">
          <button className="hover:text-white transition-colors"><Sun size={18} /></button>
          <button className="hover:text-white transition-colors relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-status-danger rounded-full"></span>
          </button>
          <button className="hover:text-white transition-colors"><RefreshCw size={18} /></button>
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  icon: ReactNode;
  value: string;
  unit?: string;
  statusText: string;
  statusLevel: 'normal' | 'warning' | 'danger';
}

export function StatCard({ title, icon, value, unit, statusText, statusLevel }: StatCardProps) {
  return (
    <div className="card flex flex-col justify-between h-32 hover:border-gray-600 transition-colors cursor-pointer group">
      <div className="flex justify-between items-center text-gray-400 text-xs font-bold tracking-wider uppercase">
        {title}
        <span className="text-gray-500 group-hover:text-brand transition-colors">{icon}</span>
      </div>
      
      <div className="mt-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-sm text-gray-400 ml-1 font-medium">{unit}</span>}
      </div>
      
      <div className="mt-2 text-xs font-bold tracking-widest uppercase">
        <span className={clsx(
          statusLevel === 'normal' && "text-gray-500",
          statusLevel === 'warning' && "text-status-warning",
          statusLevel === 'danger' && "text-status-danger"
        )}>
          {statusText}
        </span>
      </div>
    </div>
  );
}

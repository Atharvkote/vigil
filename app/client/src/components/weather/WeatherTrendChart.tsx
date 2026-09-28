import { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import type { WeatherRecord } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export interface WeatherTrendChartProps {
  history: WeatherRecord[];
}

export function WeatherTrendChart({ history }: WeatherTrendChartProps) {
  const [metric, setMetric] = useState<'temp' | 'wind' | 'rain'>('temp');
  const { actualTheme } = useTheme();

  const isDark = actualTheme === 'dark';

  // Prepare chart data chronologically
  const chartData = [...history]
    .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime())
    .map((record) => {
      const date = new Date(record.observedAt);
      const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        time: timeLabel,
        temp: Number(record.temperatureC),
        wind: Number((Number(record.windSpeedMs) * 3.6).toFixed(1)),
        rain: Number(Number(record.rainfallMm).toFixed(1)),
      };
    });

  const metricConfig = {
    temp: {
      key: 'temp',
      label: 'Temperature',
      unit: '°C',
      stroke: '#f59e0b',
      fill: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
    },
    wind: {
      key: 'wind',
      label: 'Wind Speed',
      unit: 'km/h',
      stroke: '#0284c7',
      fill: isDark ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.1)',
    },
    rain: {
      key: 'rain',
      label: 'Rainfall',
      unit: 'mm/h',
      stroke: '#38bdf8',
      fill: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.1)',
    },
  };

  const currentConfig = metricConfig[metric];

  if (!chartData || chartData.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5 text-center text-xs text-muted">
        No historical weather trends available yet. Use Refresh to record telemetry points.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
            Atmospheric Historical Trends
          </h4>
          <p className="text-[11px] text-muted">Telemetry observations recorded over time</p>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-secondary p-1 rounded border border-border">
          {(['temp', 'wind', 'rain'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                metric === m
                  ? 'bg-surface text-foreground font-semibold shadow-xs'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {metricConfig[m].label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.stroke} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentConfig.stroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1e293b' : '#e2e8f0'}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v} ${currentConfig.unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#101620' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
                borderRadius: '6px',
                color: isDark ? '#f1f5f9' : '#0f172a',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
              formatter={(value: any) => [`${value} ${currentConfig.unit}`, currentConfig.label]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={currentConfig.stroke}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${metric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

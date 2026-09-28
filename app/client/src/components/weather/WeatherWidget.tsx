import { 
  Thermometer, 
  Wind, 
  CloudRain, 
  Droplets, 
  RotateCw, 
  Clock, 
  Database,
  AlertTriangle
} from 'lucide-react';
import type { WeatherRecord } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface WeatherWidgetProps {
  weather: WeatherRecord | null;
  siteName?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  layout?: 'vertical' | 'grid';
}

export function WeatherWidget({
  weather,
  siteName,
  onRefresh,
  isRefreshing,
  layout = 'vertical',
}: WeatherWidgetProps) {
  if (!weather) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5 text-center shadow-xs">
        <p className="text-xs text-muted">No telemetry weather data captured yet.</p>
        {onRefresh && (
          <Button
            variant="outline"
            size="xs"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="mt-3"
            leftIcon={<RotateCw size={13} />}
          >
            Fetch Live Atmospheric Feed
          </Button>
        )}
      </div>
    );
  }

  // WMO Weather Code helper
  const getWeatherDesc = (code: number) => {
    if (code === 0) return 'Clear Sky';
    if (code === 1 || code === 2) return 'Mainly Clear';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Foggy / Low Visibility';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain Showers';
    if (code >= 71 && code <= 77) return 'Snow Precipitation';
    if (code >= 80 && code <= 82) return 'Heavy Rain Showers';
    if (code >= 95) return 'Severe Thunderstorm';
    return 'Observed Atmospheric Conditions';
  };

  const windSpeedKmh = (Number(weather.windSpeedMs) * 3.6).toFixed(1);
  const windGustKmh = weather.windGustMs ? (Number(weather.windGustMs) * 3.6).toFixed(1) : null;

  return (
    <div className="rounded-lg border border-border bg-surface shadow-xs overflow-hidden">
      {/* Header bar: 2-row clean layout to prevent badge crowding */}
      <div className="px-5 py-3 border-b border-border bg-surface-secondary/40 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono truncate">
              Live Perimeter Telemetry
            </span>
            {siteName && (
              <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded bg-surface border border-border shrink-0">
                {siteName}
              </span>
            )}
          </div>

          {onRefresh && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onRefresh}
              isLoading={isRefreshing}
              aria-label="Refresh telemetry"
              className="h-7 w-7 p-0 shrink-0"
              title="Refresh weather telemetry"
            >
              <RotateCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            </Button>
          )}
        </div>

        {/* Status badges row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {weather.stormCondition ? (
            <Badge variant="danger" size="sm" dot>
              STORM ALERT
            </Badge>
          ) : (
            <Badge variant="success" size="sm" dot>
              ATMOSPHERIC STABLE
            </Badge>
          )}
          {weather.stale && (
            <Badge variant="warning" size="sm" dot>
              STALE FEED (&gt;30m)
            </Badge>
          )}
          {weather.partial && (
            <Badge variant="neutral" size="sm">
              PARTIAL
            </Badge>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5">
        {layout === 'vertical' ? (
          /* VERTICAL LIST LAYOUT (Perfect for sidebars/narrow columns) */
          <div className="space-y-2.5">
            {/* Temperature */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-warning-subtle text-warning flex items-center justify-center shrink-0 border border-warning/20">
                  <Thermometer size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground tracking-tight">Temperature</div>
                  <div className="text-[11px] text-muted">{getWeatherDesc(weather.weatherCode)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-foreground">
                  {Number(weather.temperatureC).toFixed(1)} <span className="text-xs font-normal text-muted">°C</span>
                </div>
              </div>
            </div>

            {/* Wind Velocity */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary-subtle text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Wind size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground tracking-tight">Wind Velocity</div>
                  <div className="text-[11px] text-muted">
                    {windGustKmh ? `Gusts up to ${windGustKmh} km/h` : `${Number(weather.windSpeedMs).toFixed(1)} m/s`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-foreground">
                  {windSpeedKmh} <span className="text-xs font-normal text-muted">km/h</span>
                </div>
              </div>
            </div>

            {/* Precipitation Rate */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-info-subtle text-info flex items-center justify-center shrink-0 border border-info/20">
                  <CloudRain size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground tracking-tight">Precipitation</div>
                  <div className="text-[11px] text-muted">
                    {Number(weather.rainfallMm) > 0 ? 'Precipitation Active' : 'Dry Perimeter Surface'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-foreground">
                  {Number(weather.rainfallMm).toFixed(1)} <span className="text-xs font-normal text-muted">mm/h</span>
                </div>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-secondary/20 hover:bg-surface-secondary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary-subtle text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Droplets size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground tracking-tight">Relative Humidity</div>
                  <div className="text-[11px] text-muted">Atmospheric moisture level</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-foreground">
                  {Number(weather.humidityPercent).toFixed(0)} <span className="text-xs font-normal text-muted">%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* GRID LAYOUT (For full-width views) */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
              <div className="flex items-center justify-between text-muted mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider">Temperature</span>
                <Thermometer size={14} className="text-warning" />
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {Number(weather.temperatureC).toFixed(1)} <span className="text-xs font-normal text-muted">°C</span>
              </div>
              <div className="text-[10px] text-muted font-mono mt-1">
                {getWeatherDesc(weather.weatherCode)}
              </div>
            </div>

            <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
              <div className="flex items-center justify-between text-muted mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider">Wind Speed</span>
                <Wind size={14} className="text-primary" />
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {windSpeedKmh} <span className="text-xs font-normal text-muted">km/h</span>
              </div>
              <div className="text-[10px] text-muted font-mono mt-1">
                {windGustKmh ? `Gusts to ${windGustKmh} km/h` : `${Number(weather.windSpeedMs).toFixed(1)} m/s`}
              </div>
            </div>

            <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
              <div className="flex items-center justify-between text-muted mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider">Rainfall</span>
                <CloudRain size={14} className="text-primary" />
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {Number(weather.rainfallMm).toFixed(1)} <span className="text-xs font-normal text-muted">mm/h</span>
              </div>
              <div className="text-[10px] text-muted font-mono mt-1">
                {Number(weather.rainfallMm) > 0 ? 'Precipitation Active' : 'Dry Perimeter Surface'}
              </div>
            </div>

            <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
              <div className="flex items-center justify-between text-muted mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider">Humidity</span>
                <Droplets size={14} className="text-primary" />
              </div>
              <div className="text-xl font-bold font-mono text-foreground">
                {Number(weather.humidityPercent).toFixed(0)} <span className="text-xs font-normal text-muted">%</span>
              </div>
              <div className="text-[10px] text-muted font-mono mt-1">
                Relative moisture
              </div>
            </div>
          </div>
        )}

        {/* Missing variables alert if partial */}
        {weather.missingVariables && weather.missingVariables.length > 0 && (
          <div className="mt-3 p-2.5 rounded bg-warning-subtle/20 border border-warning/30 flex items-center gap-2 text-xs text-warning">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Telemetry variables missing: {weather.missingVariables.join(', ')}</span>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted font-mono">
          <div className="flex items-center gap-2">
            <Clock size={12} />
            <span>Observed: {new Date(weather.observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Database size={12} />
            <span>Provider: {weather.source || 'Open-Meteo'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

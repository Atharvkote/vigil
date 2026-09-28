import { useState, useEffect } from 'react';
import type { Site, Sensor, WeatherRecord, CalibrationRecommendation, SensorProfile } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { StatusIndicator } from '../common/StatusIndicator';
import { WeatherWidget } from '../weather/WeatherWidget';
import { WeatherTrendChart } from '../weather/WeatherTrendChart';
import { PerimeterMap } from '../common/PerimeterMap';
import { sensorsApi } from '../../api/sensors.api';
import { weatherApi } from '../../api/weather.api';
import { calibrationApi } from '../../api/calibration.api';
import { useToast } from '../../context/ToastContext';
import { 
  RotateCw, 
  Plus, 
  Cpu, 
  Compass,
  ArrowRight
} from 'lucide-react';

export interface SiteDetailModalProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  profiles?: SensorProfile[];
  onOpenCreateSensor?: (siteId: number) => void;
  onSelectSensor?: (sensor: Sensor) => void;
}

export function SiteDetailModal({
  site,
  isOpen,
  onClose,
  onOpenCreateSensor,
  onSelectSensor,
}: SiteDetailModalProps) {
  const { showToast } = useToast();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [weather, setWeather] = useState<WeatherRecord | null>(null);
  const [weatherHistory, setWeatherHistory] = useState<WeatherRecord[]>([]);
  const [recommendations, setRecommendations] = useState<CalibrationRecommendation[]>([]);

  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  useEffect(() => {
    if (!site || !isOpen) return;

    const loadSiteData = async () => {
      try {
        const [sensorList, currentWeather, historyList] = await Promise.all([
          sensorsApi.listBySite(site.id).catch(() => []),
          weatherApi.current(site.id).catch(() => null),
          weatherApi.history(site.id).catch(() => []),
        ]);

        setSensors(sensorList);
        setWeather(currentWeather);
        setWeatherHistory(historyList);

        // Fetch latest calibration recommendation for each sensor
        if (sensorList.length > 0) {
          const recPromises = sensorList.map((s) =>
            calibrationApi.current(s.id).catch(() => null)
          );
          const recs = (await Promise.all(recPromises)).filter(Boolean) as CalibrationRecommendation[];
          setRecommendations(recs);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        console.error('Failed to load site details', err);
      }
    };

    loadSiteData();
  }, [site, isOpen]);

  const handleRefreshWeather = async () => {
    if (!site) return;
    try {
      setIsRefreshingWeather(true);
      const updated = await weatherApi.refresh(site.id);
      setWeather(updated);
      setWeatherHistory((prev) => [updated, ...prev]);
      showToast('success', 'Telemetry Refreshed', `Atmospheric telemetry updated for ${site.name}.`);
    } catch (err: any) {
      showToast('error', 'Weather Refresh Failed', err.message || 'Error updating weather data');
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  if (!site) return null;

  const activeSensors = sensors.filter((s) => s.status === 'ACTIVE').length;
  const maintenanceSensors = sensors.filter((s) => s.status === 'MAINTENANCE').length;
  const highRiskRecs = recommendations.filter((r) => r.riskLevel === 'HIGH').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={site.name}
      description={site.locationLabel}
      size="full"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted font-mono flex items-center gap-1.5">
            <Compass size={13} />
            <span>Lat: {Number(site.latitude).toFixed(4)}° | Lon: {Number(site.longitude).toFixed(4)}°</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshWeather}
              isLoading={isRefreshingWeather}
              leftIcon={<RotateCw size={14} />}
            >
              Refresh Weather
            </Button>
            {onOpenCreateSensor && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenCreateSensor(site.id);
                }}
                leftIcon={<Plus size={14} />}
              >
                Add Sensor
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
            <div className="text-[10px] font-mono uppercase text-muted tracking-wider">Total Sensors</div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">{sensors.length}</div>
            <div className="text-[11px] text-muted">{activeSensors} operational</div>
          </div>

          <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
            <div className="text-[10px] font-mono uppercase text-muted tracking-wider">Site Status</div>
            <div className="mt-2">
              <StatusIndicator status={maintenanceSensors > 0 ? 'maintenance' : 'online'} />
            </div>
            <div className="text-[11px] text-muted mt-1">{maintenanceSensors} need attention</div>
          </div>

          <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
            <div className="text-[10px] font-mono uppercase text-muted tracking-wider">Active Calibration Alerts</div>
            <div className="text-2xl font-bold font-mono text-foreground mt-1">{recommendations.length}</div>
            <div className="text-[11px] text-danger font-medium">{highRiskRecs} high risk</div>
          </div>

          <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
            <div className="text-[10px] font-mono uppercase text-muted tracking-wider">Telemetry Condition</div>
            <div className="text-lg font-bold font-mono text-foreground mt-1">
              {weather ? `${Number(weather.temperatureC).toFixed(1)}°C` : '--'}
            </div>
            <div className="text-[11px] text-muted">
              {weather?.stormCondition ? 'Storm alert active' : 'Atmosphere normal'}
            </div>
          </div>
        </div>

        {/* Live Atmospheric Telemetry & Perimeter Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeatherWidget
            weather={weather}
            siteName={site.name}
            onRefresh={handleRefreshWeather}
            isRefreshing={isRefreshingWeather}
            layout="vertical"
          />

          <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs flex flex-col">
            <div className="px-4 py-2.5 border-b border-border bg-surface-secondary/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass size={13} className="text-primary" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                  Perimeter Boundary & Radar Ring
                </span>
              </div>
              <Badge variant="neutral" size="sm">
                Continuous Zones (OSM)
              </Badge>
            </div>
            <div className="p-2 flex-1 min-h-[220px]">
              <PerimeterMap
                selectedSite={site}
                weatherMap={weather ? { [site.id]: weather } : {}}
                sensorCountMap={{ [site.id]: sensors.length }}
                height="100%"
                className="h-full min-h-[220px] border-0 rounded"
                zoom={14}
              />
            </div>
          </div>
        </div>

        {/* Sensors Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
              Perimeter Sensor Fleet ({sensors.length})
            </h4>
            {onOpenCreateSensor && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  onClose();
                  onOpenCreateSensor(site.id);
                }}
                leftIcon={<Plus size={12} />}
              >
                Register Sensor
              </Button>
            )}
          </div>

          {sensors.length === 0 ? (
            <div className="text-center py-8 rounded border border-dashed border-border p-6 text-xs text-muted">
              No sensors deployed at this site yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sensors.map((sensor) => {
                const rec = recommendations.find((r) => r.sensorId === sensor.id);
                return (
                  <div
                    key={sensor.id}
                    onClick={() => {
                      onClose();
                      onSelectSensor?.(sensor);
                    }}
                    className="p-4 rounded-lg border border-border bg-surface hover:border-primary/40 cursor-pointer transition-all shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu size={15} className="text-primary" />
                        <span className="text-sm font-semibold text-foreground">{sensor.name}</span>
                      </div>
                      <Badge variant={sensor.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                        {sensor.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted flex items-center justify-between">
                      <span>{sensor.profileCode} • {sensor.installationZone || 'Perimeter'}</span>
                      <span className="font-mono text-[11px]">ID: #{sensor.id}</span>
                    </div>

                    {/* Sensor parameters summary */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sensor.configuration.map((c) => (
                        <span
                          key={c.parameterId}
                          className="px-2 py-0.5 rounded bg-surface-secondary border border-border font-mono text-[11px] text-foreground"
                        >
                          {c.displayName}: <strong>{Number(c.currentValue).toFixed(0)} {c.unit}</strong>
                        </span>
                      ))}
                    </div>

                    {/* Calibration banner if exists */}
                    {rec && (
                      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-muted">Recommendation:</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={rec.riskLevel === 'HIGH' ? 'danger' : 'neutral'} size="sm">
                            {rec.action} ({rec.riskLevel})
                          </Badge>
                          <ArrowRight size={12} className="text-muted" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weather Trend History */}
        {weatherHistory.length > 0 && (
          <div>
            <WeatherTrendChart history={weatherHistory} />
          </div>
        )}
      </div>
    </Modal>
  );
}

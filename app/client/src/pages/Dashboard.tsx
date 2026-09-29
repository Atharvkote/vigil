import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Cpu, 
  Sliders, 
  CloudSun, 
  RotateCw,
  Plus,
  ArrowRight,
  Terminal,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import type { Site, Sensor, WeatherRecord, CalibrationRecommendation, SensorProfile, SystemLog } from '../types';
import { sitesApi } from '../api/sites.api';
import { sensorsApi } from '../api/sensors.api';
import { weatherApi } from '../api/weather.api';
import { calibrationApi } from '../api/calibration.api';
import { profilesApi } from '../api/profiles.api';
import { systemApi } from '../api/system.api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton, CardSkeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { WeatherWidget } from '../components/weather/WeatherWidget';
import { PerimeterMap } from '../components/common/PerimeterMap';
import { CalibrationCard } from '../components/calibration/CalibrationCard';
import { SensorModal } from '../components/sensors/SensorModal';
import { CreateSensorModal } from '../components/sensors/CreateSensorModal';
import { CreateSiteModal } from '../components/sites/CreateSiteModal';
import { useToast } from '../context/ToastContext';

export interface DashboardProps {
  selectedSiteId: number | null;
  onSelectSite: (id: number) => void;
  onNavigateTab: (tab: string) => void;
}

export function Dashboard({
  selectedSiteId,
  onSelectSite,
  onNavigateTab,
}: DashboardProps) {
  const { showToast } = useToast();

  // Data states
  const [sites, setSites] = useState<Site[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [profiles, setProfiles] = useState<SensorProfile[]>([]);
  const [weather, setWeather] = useState<WeatherRecord | null>(null);
  const [recommendations, setRecommendations] = useState<CalibrationRecommendation[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [inspectSensor, setInspectSensor] = useState<Sensor | null>(null);
  const [isCreateSensorOpen, setIsCreateSensorOpen] = useState(false);
  const [isCreateSiteOpen, setIsCreateSiteOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch sites, profiles, and engine logs
      const [sitesData, profilesData, logsData] = await Promise.all([
        sitesApi.list(),
        profilesApi.list(),
        systemApi.getLogs().catch(() => []),
      ]);

      setSites(sitesData);
      setProfiles(profilesData);
      setSystemLogs(logsData);

      // Select active site
      const activeSiteId = selectedSiteId || (sitesData[0]?.id ?? null);
      if (activeSiteId) {
        if (!selectedSiteId) {
          onSelectSite(activeSiteId);
        }

        // Fetch sensors and weather for active site
        const [sensorList, weatherData] = await Promise.all([
          sensorsApi.listBySite(activeSiteId).catch(() => []),
          weatherApi.current(activeSiteId).catch(() => null),
        ]);

        setSensors(sensorList);
        setWeather(weatherData);

        // Fetch latest calibration recommendation for sensors
        if (sensorList.length > 0) {
          const recPromises = sensorList.map((s) =>
            calibrationApi.current(s.id).catch(() => null)
          );
          const recResults = (await Promise.all(recPromises)).filter(Boolean) as CalibrationRecommendation[];
          setRecommendations(recResults);
        } else {
          setRecommendations([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to VigilSense backend service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedSiteId]);

  const handleRefresh = async () => {
    if (!selectedSiteId) return;
    try {
      setIsRefreshing(true);
      const [updatedWeather] = await Promise.all([
        weatherApi.refresh(selectedSiteId),
        loadDashboardData(),
      ]);
      setWeather(updatedWeather);
      showToast('success', 'Telemetry Refreshed', 'Site weather and sensor states synchronized.');
    } catch (err: any) {
      showToast('error', 'Refresh Failed', err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading && sites.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64 col-span-1" />
        </div>
      </div>
    );
  }

  if (error && sites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <ErrorState
          title="Telemetry Core Offline"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const activeSite = sites.find((s) => s.id === selectedSiteId) || sites[0];
  const activeSensors = sensors.filter((s) => s.status === 'ACTIVE').length;
  const attentionSensors = sensors.filter((s) => s.status !== 'ACTIVE').length;
  const highRiskCount = recommendations.filter((r) => r.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Operational Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground tracking-tight">
              Operational Command Console
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
          </div>
          <p className="text-xs text-muted mt-0.5">
            Atmospheric correlation and profile-driven calibration for perimeter PIDS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RotateCw size={13} />}
          >
            Sync Telemetry
          </Button>
          <Button
            variant="primary"
            size="xs"
            onClick={() => setIsCreateSensorOpen(true)}
            leftIcon={<Plus size={13} />}
          >
            Deploy Sensor
          </Button>
        </div>
      </div>

      {/* Restrained KPI Strip (Section 5 Requirement) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Sites */}
        <div 
          onClick={() => onNavigateTab('sites')}
          className="rounded-lg border border-border bg-surface p-4 hover:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>PERIMETER SITES</span>
            <MapPin size={15} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">{sites.length}</div>
          <div className="text-[11px] text-muted mt-1 flex items-center gap-1">
            <span>Active:</span>
            <strong className="text-foreground truncate">{activeSite?.name || 'None'}</strong>
          </div>
        </div>

        {/* KPI 2: Sensors */}
        <div 
          onClick={() => onNavigateTab('sensors')}
          className="rounded-lg border border-border bg-surface p-4 hover:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>SENSOR FLEET</span>
            <Cpu size={15} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">{sensors.length}</div>
          <div className="text-[11px] text-muted mt-1">
            {attentionSensors > 0 ? (
              <span className="text-warning font-medium">{attentionSensors} require review</span>
            ) : (
              <span className="text-success font-medium">All {activeSensors} operational</span>
            )}
          </div>
        </div>

        {/* KPI 3: Recommendations */}
        <div 
          onClick={() => onNavigateTab('calibration')}
          className="rounded-lg border border-border bg-surface p-4 hover:border-primary/50 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>ACTIVE RECOMMENDATIONS</span>
            <Sliders size={15} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">{recommendations.length}</div>
          <div className="text-[11px] mt-1">
            {highRiskCount > 0 ? (
              <span className="text-danger font-medium">{highRiskCount} high risk alerts</span>
            ) : (
              <span className="text-muted">Optimal calibration baseline</span>
            )}
          </div>
        </div>

        {/* KPI 4: Environmental Status */}
        <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>WEATHER STATUS</span>
            <CloudSun size={15} className="text-warning" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {weather ? `${Number(weather.temperatureC).toFixed(1)}°C` : '--'}
          </div>
          <div className="text-[11px] text-muted mt-1 truncate">
            {weather ? (
              weather.stormCondition ? (
                <span className="text-danger font-semibold">STORM COND. ACTIVE</span>
              ) : (
                `Wind: ${(Number(weather.windSpeedMs) * 3.6).toFixed(1)} km/h • Rain: ${Number(weather.rainfallMm).toFixed(1)} mm`
              )
            ) : (
              'Telemetry pending'
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Weather Telemetry + Primary Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Telemetry Overview */}
        <div className="lg:col-span-1 space-y-4">
          <WeatherWidget
            weather={weather}
            siteName={activeSite?.name}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            layout="vertical"
          />

          {/* Exact Perimeter Geospatial Location Map */}
          {activeSite && (
            <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
              <div className="px-4 py-2.5 border-b border-border bg-surface-secondary/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-primary" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted">
                    Perimeter Geospatial Location
                  </span>
                </div>
                <Badge variant="neutral" size="sm">
                  Continuous Zones (OSM)
                </Badge>
              </div>
              <div className="p-2">
                <PerimeterMap
                  selectedSite={activeSite}
                  weatherMap={weather ? { [activeSite.id]: weather } : {}}
                  sensorCountMap={{ [activeSite.id]: sensors.length }}
                  height="180px"
                  zoom={13}
                  className="border-0 rounded"
                />
              </div>
            </div>
          )}

          {/* Quick Facility Info */}
          <div className="rounded-lg border border-border bg-surface p-4 text-xs space-y-2.5 shadow-xs">
            <div className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">
              Facility Information
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Facility:</span>
              <span className="font-semibold text-foreground">{activeSite?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Location:</span>
              <span className="text-foreground truncate max-w-[200px]">{activeSite?.locationLabel}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted">Coordinates:</span>
              <span className="font-mono text-muted">
                {Number(activeSite?.latitude).toFixed(4)}°, {Number(activeSite?.longitude).toFixed(4)}°
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Installed Profiles:</span>
              <span className="font-mono text-foreground font-semibold">
                {new Set(sensors.map((s) => s.profileCode)).size} Types
              </span>
            </div>
          </div>
        </div>

        {/* Centerpiece: Active Calibration Recommendation */}
        <div className="lg:col-span-2 space-y-4">
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
                  Primary Recommendation Assessment
                </h3>
                <button
                  onClick={() => onNavigateTab('calibration')}
                  className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-medium transition-colors"
                >
                  <span>View All ({recommendations.length})</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <CalibrationCard
                recommendation={recommendations[0]}
                sensorName={sensors.find((s) => s.id === recommendations[0].sensorId)?.name}
                onEvaluate={handleRefresh}
                isEvaluating={isRefreshing}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-surface-secondary/20 p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-muted mx-auto">
                <Sliders size={20} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No Recommendations Generated Yet</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Trigger calibration evaluation for your sensors or register new hardware to correlate with live weather conditions.
              </p>
              {sensors.length > 0 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    if (sensors[0]) {
                      await calibrationApi.evaluate(sensors[0].id);
                      loadDashboardData();
                    }
                  }}
                >
                  Evaluate Sensor #{sensors[0]?.id}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateSensorOpen(true)}
                >
                  Deploy First Sensor
                </Button>
              )}
            </div>
          )}

          {/* Sensor Fleet Status List */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
                Site Sensors & Parameter Status ({sensors.length})
              </h4>
              <button
                onClick={() => onNavigateTab('sensors')}
                className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-medium"
              >
                <span>Fleet Manager</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-border">
              {sensors.map((sensor) => {
                const rec = recommendations.find((r) => r.sensorId === sensor.id);
                return (
                  <div
                    key={sensor.id}
                    onClick={() => setInspectSensor(sensor)}
                    className="py-2.5 flex items-center justify-between hover:bg-surface-secondary/30 px-2 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-surface-secondary flex items-center justify-center text-primary">
                        <Cpu size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                          <span>{sensor.name}</span>
                          <span className="text-[10px] text-muted font-mono">{sensor.profileCode}</span>
                        </div>
                        <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                          {sensor.configuration.map((c) => (
                            <span key={c.parameterId} className="font-mono">
                              {c.displayName}: <strong>{Number(c.currentValue).toFixed(0)}{c.unit}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {rec && (
                        <Badge variant={rec.riskLevel === 'HIGH' ? 'danger' : 'neutral'} size="sm">
                          {rec.action}
                        </Badge>
                      )}
                      <Badge variant={sensor.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                        {sensor.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Engine, Acknowledgements & Live Intelligence Feed */}
          <div className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-primary" />
                <h4 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
                  System Engine & Intelligence Feed
                </h4>
                <Badge variant="primary" size="sm">LIVE TELEMETRY</Badge>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigateTab('settings')}
                  className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Open System Console</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Third-Party & AI Acknowledgements Badge Strip */}
            <div className="p-3 rounded-lg bg-surface-secondary/40 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <BookOpen size={16} className="text-primary shrink-0" />
                <div>
                  <span className="font-semibold text-foreground block">
                    Third-Party, API & AI Citations Active
                  </span>
                  <span className="text-[11px] text-muted">
                    Open-Meteo Weather API • Leaflet & OpenStreetMap GIS • Spring Boot 3 & Java 21 • Explainable AI (XAI) Reasoner
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="success" size="sm">A-1 Launchpad Compliant</Badge>
                <button
                  onClick={() => onNavigateTab('settings')}
                  className="text-[11px] text-primary hover:underline font-mono flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>

            {/* Live Rule & AI Engine Logs Feed Ticker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted font-mono">
                <span>RECENT ENGINE EXECUTIONS (RULE & AI):</span>
                <span>Port 8081 • Spring AOP Active</span>
              </div>

              <div className="bg-[#0b0f17] rounded-md border border-[#1f2937] p-2.5 space-y-1.5 font-mono text-[11px] text-gray-300 max-h-48 overflow-y-auto">
                {systemLogs.slice(0, 4).map((log) => {
                  const isRule = log.subsystem === 'RULE_ENGINE';
                  const isAi = log.subsystem === 'AI_ENGINE';
                  return (
                    <div key={log.id} className="flex items-start gap-2 py-1 px-1.5 hover:bg-[#131b2a] rounded transition-colors">
                      <span className="text-gray-500 text-[10px] shrink-0 pt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span
                        className={`px-1 rounded text-[9px] uppercase font-bold shrink-0 ${
                          isRule
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : isAi
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {log.subsystem}
                      </span>
                      <span className="text-gray-200 truncate flex-1">
                        {log.message}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Modal */}
      <SensorModal
        sensor={inspectSensor}
        isOpen={Boolean(inspectSensor)}
        onClose={() => setInspectSensor(null)}
        onUpdated={loadDashboardData}
      />

      {/* Create Sensor Modal */}
      <CreateSensorModal
        isOpen={isCreateSensorOpen}
        onClose={() => setIsCreateSensorOpen(false)}
        sites={sites}
        profiles={profiles}
        defaultSiteId={selectedSiteId || undefined}
        onCreated={loadDashboardData}
      />

      {/* Create Site Modal */}
      <CreateSiteModal
        isOpen={isCreateSiteOpen}
        onClose={() => setIsCreateSiteOpen(false)}
        onCreated={loadDashboardData}
      />
    </div>
  );
}

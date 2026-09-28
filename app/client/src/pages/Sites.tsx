import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MapPin,
  RotateCw,
  LayoutGrid,
  Table as TableIcon,
  Map as MapIcon,
  ArrowRight,
  Trash2
} from 'lucide-react';
import type { Site, Sensor, WeatherRecord, SensorProfile } from '../types';
import { sitesApi } from '../api/sites.api';
import { sensorsApi } from '../api/sensors.api';
import { weatherApi } from '../api/weather.api';
import { profilesApi } from '../api/profiles.api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { PerimeterMap } from '../components/common/PerimeterMap';
import { CreateSiteModal } from '../components/sites/CreateSiteModal';
import { SiteDetailModal } from '../components/sites/SiteDetailModal';
import { CreateSensorModal } from '../components/sensors/CreateSensorModal';
import { SensorModal } from '../components/sensors/SensorModal';
import { useToast } from '../context/ToastContext';

export interface SitesProps {
  onSelectSite: (id: number) => void;
  onNavigateTab?: (tab: string) => void;
}

export function Sites({ onSelectSite }: SitesProps) {
  const { showToast } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [profiles, setProfiles] = useState<SensorProfile[]>([]);
  const [siteSensorsMap, setSiteSensorsMap] = useState<Record<number, Sensor[]>>({});
  const [siteWeatherMap, setSiteWeatherMap] = useState<Record<number, WeatherRecord>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'map'>('map');
  const [selectedMapSite, setSelectedMapSite] = useState<Site | null>(null);

  // Modals
  const [isCreateSiteOpen, setIsCreateSiteOpen] = useState(false);
  const [activeDetailSite, setActiveDetailSite] = useState<Site | null>(null);
  const [createSensorSiteId, setCreateSensorSiteId] = useState<number | null>(null);
  const [inspectSensor, setInspectSensor] = useState<Sensor | null>(null);

  const loadSitesData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [sitesData, profilesData] = await Promise.all([
        sitesApi.list(),
        profilesApi.list(),
      ]);

      setSites(sitesData);
      setProfiles(profilesData);
      if (sitesData.length > 0) {
        setSelectedMapSite((prev) => prev ? (sitesData.find((s) => s.id === prev.id) || sitesData[0]) : sitesData[0]);
      }

      // Load sensors and weather for each site
      const sensorsMap: Record<number, Sensor[]> = {};
      const weatherMap: Record<number, WeatherRecord> = {};

      await Promise.all(
        sitesData.map(async (site) => {
          try {
            const [sensors, weather] = await Promise.all([
              sensorsApi.listBySite(site.id).catch(() => []),
              weatherApi.current(site.id).catch(() => null),
            ]);
            sensorsMap[site.id] = sensors;
            if (weather) weatherMap[site.id] = weather;
          } catch (e) {
            console.error(`Error loading telemetry for site ${site.id}`, e);
          }
        })
      );

      setSiteSensorsMap(sensorsMap);
      setSiteWeatherMap(weatherMap);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve site directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSitesData();
  }, []);

  const handleRefreshWeather = async (siteId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const refreshed = await weatherApi.refresh(siteId);
      setSiteWeatherMap((prev) => ({ ...prev, [siteId]: refreshed }));
      showToast('success', 'Telemetry Refreshed', 'Latest atmospheric readings saved.');
    } catch (err: any) {
      showToast('error', 'Refresh Failed', err.message);
    }
  };

  const handleDeleteSite = async (siteId: number, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to remove facility "${name}"? All sensor associations will be removed.`)) {
      return;
    }
    try {
      await sitesApi.delete(siteId);
      showToast('info', 'Facility Removed', `Site "${name}" was uninstalled.`);
      loadSitesData();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  const filteredSites = sites.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.locationLabel.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground tracking-tight">
            Perimeter Monitored Facilities
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Geographic coordinates and real-time atmospheric sensor telemetry across facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={loadSitesData}
            leftIcon={<RotateCw size={12} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="xs"
            onClick={() => setIsCreateSiteOpen(true)}
            leftIcon={<Plus size={13} />}
          >
            Register Facility
          </Button>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search facilities or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-surface-secondary p-1 rounded border border-border">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'table' ? 'bg-surface text-foreground shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            title="Table View"
          >
            <TableIcon size={15} />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'cards' ? 'bg-surface text-foreground shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            title="Card View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded text-xs transition-colors ${viewMode === 'map' ? 'bg-surface text-foreground shadow-xs' : 'text-muted hover:text-foreground'
              }`}
            title="Geospatial Perimeter Map View"
          >
            <MapIcon size={15} />
          </button>
        </div>
      </div>

      {/* Main Content State */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadSitesData} />
      ) : filteredSites.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Monitored Sites Found"
          description={searchTerm ? 'No facilities matched your search filter.' : 'Deploy your first perimeter site to begin monitoring sensor calibration.'}
          actionLabel={searchTerm ? undefined : 'Register Facility'}
          onAction={() => setIsCreateSiteOpen(true)}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Section 6 & 22) */
        <div className="rounded-lg border border-border bg-surface overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/60 text-muted font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Facility Name</th>
                <th className="py-3 px-4 font-semibold">Location / Address</th>
                <th className="py-3 px-4 font-semibold">Coordinates</th>
                <th className="py-3 px-4 font-semibold">Sensor Fleet</th>
                <th className="py-3 px-4 font-semibold">Atmospheric Condition</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSites.map((site) => {
                const sensors = siteSensorsMap[site.id] || [];
                const weather = siteWeatherMap[site.id];
                const activeCount = sensors.filter((s) => s.status === 'ACTIVE').length;

                return (
                  <tr
                    key={site.id}
                    onClick={() => setActiveDetailSite(site)}
                    className="hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-medium text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary shrink-0" />
                        <span className="font-semibold">{site.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-muted truncate max-w-xs">
                      {site.locationLabel}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted text-[11px] whitespace-nowrap">
                      {Number(site.latitude).toFixed(4)}°, {Number(site.longitude).toFixed(4)}°
                    </td>
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <span className="font-semibold text-foreground">{sensors.length}</span>
                      <span className="text-muted text-[11px]"> ({activeCount} active)</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                      {weather ? (
                        <span>
                          {Number(weather.temperatureC).toFixed(1)}°C | {(Number(weather.windSpeedMs) * 3.6).toFixed(0)} km/h
                        </span>
                      ) : (
                        <span className="text-muted">Telemetry pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={sensors.length > 0 ? 'success' : 'neutral'} size="sm" dot>
                        {sensors.length > 0 ? 'MONITORED' : 'PENDING SENSORS'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => handleRefreshWeather(site.id, e)}
                          title="Refresh live weather"
                          className="h-7 w-7 p-0"
                        >
                          <RotateCw size={13} />
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSite(site.id);
                            setActiveDetailSite(site);
                          }}
                        >
                          Console
                        </Button>
                        <button
                          onClick={(e) => handleDeleteSite(site.id, site.name, e)}
                          className="text-muted hover:text-danger p-1 rounded transition-colors"
                          title="Remove site"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARD VIEW (Section 6) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site) => {
            const sensors = siteSensorsMap[site.id] || [];
            const weather = siteWeatherMap[site.id];
            const activeCount = sensors.filter((s) => s.status === 'ACTIVE').length;

            return (
              <div
                key={site.id}
                onClick={() => setActiveDetailSite(site)}
                className="p-5 rounded-lg border border-border bg-surface hover:border-primary/50 transition-all cursor-pointer shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                      <MapPin size={15} className="text-primary" />
                      {site.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">{site.locationLabel}</p>
                  </div>
                  <Badge variant={sensors.length > 0 ? 'success' : 'neutral'} size="sm">
                    {sensors.length > 0 ? 'ACTIVE' : 'IDLE'}
                  </Badge>
                </div>

                {/* Small Map showing exact site location */}
                <div className="overflow-hidden rounded border border-border">
                  <PerimeterMap
                    selectedSite={site}
                    weatherMap={weather ? { [site.id]: weather } : {}}
                    sensorCountMap={{ [site.id]: sensors.length }}
                    height="110px"
                    interactive={false}
                    zoom={12}
                    className="border-0 rounded-none pointer-events-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border">
                  <div>
                    <span className="text-[10px] font-mono text-muted uppercase block">Sensors</span>
                    <span className="font-mono font-bold text-foreground">{sensors.length} units ({activeCount} active)</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted uppercase block">Weather</span>
                    <span className="font-mono font-bold text-foreground">
                      {weather ? `${Number(weather.temperatureC).toFixed(1)}°C` : '--'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-mono text-[11px] text-muted">
                    {Number(site.latitude).toFixed(4)}°, {Number(site.longitude).toFixed(4)}°
                  </span>
                  <div className="flex items-center gap-1 text-primary font-medium text-xs">
                    <span>Inspect</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GEOSPATIAL MAP FLEET VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-lg border border-border bg-surface overflow-hidden shadow-xs flex flex-col">
            <div className="px-4 py-3 border-b border-border bg-surface-secondary/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon size={14} className="text-primary" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted">
                  Global Perimeter Fleet Map ({filteredSites.length} Facilities)
                </span>
              </div>
              <Badge variant="success" size="sm" dot>
                RADAR ACTIVE
              </Badge>
            </div>
            <div className="p-2 flex-1 min-h-[480px]">
              <PerimeterMap
                sites={filteredSites}
                selectedSite={selectedMapSite}
                weatherMap={siteWeatherMap}
                sensorCountMap={Object.fromEntries(
                  Object.entries(siteSensorsMap).map(([id, list]) => [Number(id), list.length])
                )}
                height="480px"
                interactive={true}
                onSelectSite={(site) => setSelectedMapSite(site)}
                className="border-0 rounded h-full"
              />
            </div>
          </div>

          {/* Selected Site Panel */}
          <div className="lg:col-span-1 space-y-4">
            {selectedMapSite ? (
              <div className="p-5 rounded-lg border border-border bg-surface shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                      <MapPin size={15} className="text-primary" />
                      {selectedMapSite.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{selectedMapSite.locationLabel}</p>
                  </div>
                  <Badge variant={(siteSensorsMap[selectedMapSite.id]?.length || 0) > 0 ? 'success' : 'neutral'} size="sm">
                    {(siteSensorsMap[selectedMapSite.id]?.length || 0) > 0 ? 'ACTIVE' : 'IDLE'}
                  </Badge>
                </div>

                <div className="space-y-2 py-2 border-y border-border text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Exact GPS:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {Number(selectedMapSite.latitude).toFixed(4)}°, {Number(selectedMapSite.longitude).toFixed(4)}°
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Sensors Installed:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {siteSensorsMap[selectedMapSite.id]?.length || 0} Units
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Atmosphere:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {siteWeatherMap[selectedMapSite.id]
                        ? `${Number(siteWeatherMap[selectedMapSite.id].temperatureC).toFixed(1)}°C (${(Number(siteWeatherMap[selectedMapSite.id].windSpeedMs) * 3.6).toFixed(0)} km/h)`
                        : 'No Data'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveDetailSite(selectedMapSite)}
                    leftIcon={<ArrowRight size={13} />}
                  >
                    Open Facility Console
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onSelectSite(selectedMapSite.id);
                      showToast('info', 'Active Site Changed', `Switched active dashboard to ${selectedMapSite.name}`);
                    }}
                  >
                    Set as Operational Console Site
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg border border-dashed border-border bg-surface text-center text-xs text-muted">
                Select a marker on the map to inspect facility parameters.
              </div>
            )}

            {/* Quick Site Switcher List */}
            <div className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-2.5">
              <div className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider">
                Fleet Facilities
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredSites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedMapSite(s)}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between ${selectedMapSite?.id === s.id
                        ? 'bg-primary-subtle text-primary border border-primary/30 font-medium'
                        : 'hover:bg-surface-secondary text-muted hover:text-foreground'
                      }`}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className="font-mono text-[10px] shrink-0 text-muted">
                      {Number(s.latitude).toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateSiteModal
        isOpen={isCreateSiteOpen}
        onClose={() => setIsCreateSiteOpen(false)}
        onCreated={loadSitesData}
      />

      <SiteDetailModal
        site={activeDetailSite}
        isOpen={Boolean(activeDetailSite)}
        onClose={() => setActiveDetailSite(null)}
        profiles={profiles}
        onOpenCreateSensor={(siteId) => setCreateSensorSiteId(siteId)}
        onSelectSensor={(sensor) => setInspectSensor(sensor)}
      />

      <CreateSensorModal
        isOpen={Boolean(createSensorSiteId)}
        onClose={() => setCreateSensorSiteId(null)}
        sites={sites}
        profiles={profiles}
        defaultSiteId={createSensorSiteId || undefined}
        onCreated={loadSitesData}
      />

      <SensorModal
        sensor={inspectSensor}
        isOpen={Boolean(inspectSensor)}
        onClose={() => setInspectSensor(null)}
        onUpdated={loadSitesData}
      />
    </div>
  );
}

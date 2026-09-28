import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Search, 
  Plus, 
  RotateCw, 
  Layers
} from 'lucide-react';
import type { Sensor, SensorProfile, Site, CalibrationRecommendation } from '../types';
import { sensorsApi } from '../api/sensors.api';
import { sitesApi } from '../api/sites.api';
import { profilesApi } from '../api/profiles.api';
import { calibrationApi } from '../api/calibration.api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { SensorModal } from '../components/sensors/SensorModal';
import { CreateSensorModal } from '../components/sensors/CreateSensorModal';

export interface SensorsProps {
  onSelectSite?: (siteId: number) => void;
}

export function Sensors({}: SensorsProps) {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [profiles, setProfiles] = useState<SensorProfile[]>([]);
  const [recommendationsMap, setRecommendationsMap] = useState<Record<number, CalibrationRecommendation>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSiteId, setFilterSiteId] = useState<string>('ALL');
  const [filterProfileCode, setFilterProfileCode] = useState<string>('ALL');

  // Modals
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isCreateSensorOpen, setIsCreateSensorOpen] = useState(false);

  const loadSensorsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [sitesData, profilesData] = await Promise.all([
        sitesApi.list(),
        profilesApi.list(),
      ]);

      setSites(sitesData);
      setProfiles(profilesData);

      // Fetch all sensors across all sites
      const allSensorsPromises = sitesData.map((s) => sensorsApi.listBySite(s.id).catch(() => []));
      const sensorsBySite = await Promise.all(allSensorsPromises);
      const flattenedSensors = sensorsBySite.flat();

      setSensors(flattenedSensors);

      // Fetch calibration recommendation for each sensor
      const recMap: Record<number, CalibrationRecommendation> = {};
      await Promise.all(
        flattenedSensors.map(async (sensor) => {
          try {
            const rec = await calibrationApi.current(sensor.id);
            if (rec) recMap[sensor.id] = rec;
          } catch {
            // No recommendation yet
          }
        })
      );
      setRecommendationsMap(recMap);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve sensor fleet');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSensorsData();
  }, []);

  const filteredSensors = sensors.filter((sensor) => {
    const matchesSearch =
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.installationZone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.profileCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSite = filterSiteId === 'ALL' || sensor.siteId === Number(filterSiteId);
    const matchesProfile = filterProfileCode === 'ALL' || sensor.profileCode === filterProfileCode;

    return matchesSearch && matchesSite && matchesProfile;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground tracking-tight">
            Perimeter Sensor Fleet Management
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Hardware configuration parameter profiles and calibration state audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={loadSensorsData}
            leftIcon={<RotateCw size={12} />}
          >
            Refresh
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

      {/* Profiles Banner (Section 8 Reminder) */}
      <div className="p-4 rounded-lg border border-border bg-surface-secondary/30 text-xs">
        <div className="flex items-center gap-2 font-mono uppercase font-bold text-foreground text-[11px] mb-1">
          <Layers size={14} className="text-primary" />
          <span>Active Sensor Profile Architectures</span>
        </div>
        <p className="text-muted leading-relaxed">
          Different sensor types support distinct parameters. For example, <strong>Fiber-Optic</strong> sensors configure sensitivity and alarm threshold, whereas <strong>Microwave</strong> barriers calibrate detection range and delay. VigilSense strictly validates configurations against each sensor's profile contract.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by name, zone, manufacturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={14} />}
        />

        <Select
          value={filterSiteId}
          onChange={(e) => setFilterSiteId(e.target.value)}
        >
          <option value="ALL">All Monitored Facilities ({sites.length})</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select
          value={filterProfileCode}
          onChange={(e) => setFilterProfileCode(e.target.value)}
        >
          <option value="ALL">All Sensor Profile Types ({profiles.length})</option>
          {profiles.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name} ({p.code})
            </option>
          ))}
        </Select>
      </div>

      {/* Sensor Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadSensorsData} />
      ) : filteredSensors.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No Perimeter Sensors Matching Filters"
          description={searchTerm || filterSiteId !== 'ALL' ? 'Try adjusting your search query or filters.' : 'Deploy a hardware sensor to begin automated environmental calibration.'}
          actionLabel="Deploy Sensor"
          onAction={() => setIsCreateSensorOpen(true)}
        />
      ) : (
        <div className="rounded-lg border border-border bg-surface overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/60 text-muted font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Sensor Identifier</th>
                <th className="py-3 px-4 font-semibold">Profile Contract</th>
                <th className="py-3 px-4 font-semibold">Facility / Sector</th>
                <th className="py-3 px-4 font-semibold">Hardware Make & Model</th>
                <th className="py-3 px-4 font-semibold">Active Configuration</th>
                <th className="py-3 px-4 font-semibold">Calibration Assessment</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSensors.map((sensor) => {
                const siteName = sites.find((s) => s.id === sensor.siteId)?.name || `Site #${sensor.siteId}`;
                const rec = recommendationsMap[sensor.id];

                return (
                  <tr
                    key={sensor.id}
                    onClick={() => setSelectedSensor(sensor)}
                    className="hover:bg-surface-secondary/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-medium text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Cpu size={14} className="text-primary shrink-0" />
                        <div>
                          <span className="font-semibold block">{sensor.name}</span>
                          <span className="text-[10px] text-muted font-mono">ID: #{sensor.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="primary" size="sm">
                        {sensor.profileCode} v{sensor.profileVersion}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-foreground font-medium">{siteName}</div>
                      <div className="text-[11px] text-muted">{sensor.installationZone || 'Perimeter Sector'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-muted whitespace-nowrap">
                      <span className="text-foreground font-mono">{sensor.manufacturer || 'Generic'}</span>
                      <span className="text-[11px] text-muted block">{sensor.model || 'Demo'}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {sensor.configuration.map((c) => (
                          <span
                            key={c.parameterId}
                            className="px-1.5 py-0.5 rounded bg-surface-secondary border border-border font-mono text-[11px] text-foreground"
                          >
                            {c.displayName}: <strong>{Number(c.currentValue).toFixed(0)}{c.unit}</strong>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {rec ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant={rec.riskLevel === 'HIGH' ? 'danger' : 'neutral'} size="sm" dot>
                            {rec.action} ({rec.riskLevel})
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted text-[11px] font-mono">Pending eval</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={sensor.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                        {sensor.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSensor(sensor);
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sensor Modal */}
      <SensorModal
        sensor={selectedSensor}
        isOpen={Boolean(selectedSensor)}
        onClose={() => setSelectedSensor(null)}
        onUpdated={loadSensorsData}
      />

      {/* Create Sensor Wizard */}
      <CreateSensorModal
        isOpen={isCreateSensorOpen}
        onClose={() => setIsCreateSensorOpen(false)}
        sites={sites}
        profiles={profiles}
        defaultSiteId={filterSiteId !== 'ALL' ? Number(filterSiteId) : undefined}
        onCreated={loadSensorsData}
      />
    </div>
  );
}

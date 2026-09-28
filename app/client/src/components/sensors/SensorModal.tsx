import { useState, useEffect } from 'react';
import type { 
  Sensor, 
  SensorProfile, 
  CalibrationRecommendation, 
  WeatherRecord, 
  ParameterValueRequest 
} from '../../types';
import { Modal } from '../common/Modal';
import { Tabs } from '../common/Tabs';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { StatusIndicator } from '../common/StatusIndicator';
import { sensorsApi } from '../../api/sensors.api';
import { calibrationApi } from '../../api/calibration.api';
import { weatherApi } from '../../api/weather.api';
import { CalibrationCard } from '../calibration/CalibrationCard';
import { CalibrationHistoryTable } from '../calibration/CalibrationHistoryTable';
import { WeatherWidget } from '../weather/WeatherWidget';
import { useToast } from '../../context/ToastContext';
import { 
  Cpu, 
  Sliders, 
  CloudSun, 
  CheckCircle2, 
  History, 
  RotateCw,
  Save
} from 'lucide-react';

export interface SensorModalProps {
  sensor: Sensor | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function SensorModal({
  sensor,
  isOpen,
  onClose,
  onUpdated,
}: SensorModalProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Async data states
  const [profile, setProfile] = useState<SensorProfile | null>(null);
  const [currentRec, setCurrentRec] = useState<CalibrationRecommendation | null>(null);
  const [history, setHistory] = useState<CalibrationRecommendation[]>([]);
  const [weather, setWeather] = useState<WeatherRecord | null>(null);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Configuration editing state
  const [editableConfigs, setEditableConfigs] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!sensor || !isOpen) return;

    // Initialize config values
    const initialConfig: Record<string, number> = {};
    sensor.configuration.forEach((c) => {
      initialConfig[c.parameterKey] = Number(c.currentValue);
    });
    setEditableConfigs(initialConfig);

    // Fetch related profile, calibration and weather
    const loadSensorData = async () => {
      try {
        const [profData, recData, histData, weatherData] = await Promise.all([
          sensorsApi.getProfile(sensor.id).catch(() => null),
          calibrationApi.current(sensor.id).catch(() => null),
          calibrationApi.history(sensor.id).catch(() => []),
          weatherApi.current(sensor.siteId).catch(() => null),
        ]);

        setProfile(profData);
        setCurrentRec(recData);
        setHistory(histData || []);
        setWeather(weatherData);
      } catch (err: any) {
        console.error('Failed to load sensor detail data', err);
      }
    };

    loadSensorData();
  }, [sensor, isOpen]);

  const handleEvaluate = async () => {
    if (!sensor) return;
    try {
      setIsEvaluating(true);
      const newRec = await calibrationApi.evaluate(sensor.id);
      setCurrentRec(newRec);
      setHistory((prev) => [newRec, ...prev]);
      showToast('success', 'Recommendation Calculated', `Generated recommendation with ${newRec.riskLevel} risk assessment.`);
    } catch (err: any) {
      showToast('error', 'Evaluation Failed', err.message || 'Error running calibration engine');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!sensor) return;
    try {
      setIsSavingConfig(true);
      const configuration: ParameterValueRequest[] = Object.entries(editableConfigs).map(
        ([parameterKey, value]) => ({
          parameterKey,
          value,
        })
      );

      await sensorsApi.update(sensor.id, {
        name: sensor.name,
        manufacturer: sensor.manufacturer,
        model: sensor.model,
        installationZone: sensor.installationZone,
        status: sensor.status,
        configuration,
      });

      showToast('success', 'Configuration Updated', 'Sensor parameter values persisted successfully.');
      onUpdated?.();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Error saving sensor configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  if (!sensor) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Cpu size={14} /> },
    { id: 'configuration', label: 'Configuration', icon: <Sliders size={14} /> },
    { id: 'calibration', label: 'Calibration', icon: <CheckCircle2 size={14} /> },
    { id: 'weather', label: 'Weather Context', icon: <CloudSun size={14} /> },
    { id: 'history', label: 'History', icon: <History size={14} /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sensor.name}
      description={`${sensor.profileCode} v${sensor.profileVersion} • ${sensor.installationZone || 'General Zone'}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Top Info Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <StatusIndicator
              status={sensor.status === 'ACTIVE' ? 'active' : sensor.status === 'MAINTENANCE' ? 'maintenance' : 'inactive'}
            />
            <span className="text-xs text-muted font-mono">
              Site ID: #{sensor.siteId} | Sensor ID: #{sensor.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={handleEvaluate}
              isLoading={isEvaluating}
              leftIcon={<RotateCw size={12} />}
            >
              Run Calibration Evaluation
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div className="pt-2">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-surface-secondary/20 space-y-2 text-xs">
                  <div className="text-[10px] font-bold font-mono text-muted uppercase tracking-wider mb-2">
                    Hardware Specifications
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted">Sensor Name:</span>
                    <span className="font-semibold text-foreground">{sensor.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted">Manufacturer:</span>
                    <span className="text-foreground">{sensor.manufacturer || 'Generic / Demo'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted">Model Identifier:</span>
                    <span className="font-mono text-foreground">{sensor.model || 'Demo'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted">Installation Sector:</span>
                    <span className="text-foreground">{sensor.installationZone || 'General Perimeter'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted">Registered:</span>
                    <span className="font-mono text-muted">
                      {new Date(sensor.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-surface-secondary/20 space-y-2 text-xs">
                  <div className="text-[10px] font-bold font-mono text-muted uppercase tracking-wider mb-2">
                    Sensor Profile Contract
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted">Profile Name:</span>
                    <span className="font-semibold text-primary">{profile?.name || sensor.profileCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted">Profile Code:</span>
                    <span className="font-mono text-foreground">{sensor.profileCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border">
                    <span className="text-muted">Profile Version:</span>
                    <span className="font-mono text-foreground">v{sensor.profileVersion}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-muted block text-[11px] mb-1">Correlated Weather Factors:</span>
                    <div className="flex flex-wrap gap-1">
                      {profile?.relevantWeatherFactors?.map((wf) => (
                        <Badge key={wf} variant="neutral" size="sm">
                          {wf}
                        </Badge>
                      )) || <span className="text-muted">Standard Factors</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest Recommendation Preview */}
              {currentRec && (
                <div className="pt-2">
                  <div className="text-[10px] font-bold font-mono text-muted uppercase tracking-wider mb-2">
                    Active Operational Recommendation
                  </div>
                  <CalibrationCard
                    recommendation={currentRec}
                    sensorName={sensor.name}
                    onEvaluate={handleEvaluate}
                    isEvaluating={isEvaluating}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONFIGURATION */}
          {activeTab === 'configuration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Profile Parameters</h4>
                  <p className="text-[11px] text-muted">
                    Adjust supported parameter values according to the hardware profile.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={handleSaveConfig}
                  isLoading={isSavingConfig}
                  leftIcon={<Save size={13} />}
                >
                  Save Configuration
                </Button>
              </div>

              <div className="space-y-3">
                {sensor.configuration.map((config) => {
                  const paramMeta = profile?.parameters.find((p) => p.parameterKey === config.parameterKey);
                  const min = paramMeta?.minValue !== null && paramMeta?.minValue !== undefined ? Number(paramMeta.minValue) : 0;
                  const max = paramMeta?.maxValue !== null && paramMeta?.maxValue !== undefined ? Number(paramMeta.maxValue) : 100;
                  const step = paramMeta?.dataType === 'INTEGER' ? 1 : 0.5;
                  const currentVal = editableConfigs[config.parameterKey] ?? Number(config.currentValue);

                  return (
                    <div
                      key={config.parameterId}
                      className="p-4 rounded-lg border border-border bg-surface-secondary/20 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Sliders size={13} className="text-primary" />
                          {config.displayName}
                        </span>
                        <span className="font-mono px-2 py-0.5 rounded bg-surface border border-border text-foreground font-bold">
                          {currentVal} <span className="text-muted font-normal text-[11px]">{config.unit}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={currentVal}
                          onChange={(e) =>
                            setEditableConfigs((prev) => ({
                              ...prev,
                              [config.parameterKey]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-primary"
                        />
                        <input
                          type="number"
                          min={min}
                          max={max}
                          step={step}
                          value={currentVal}
                          onChange={(e) =>
                            setEditableConfigs((prev) => ({
                              ...prev,
                              [config.parameterKey]: Number(e.target.value),
                            }))
                          }
                          className="w-20 h-8 rounded bg-surface border border-border text-center text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-muted font-mono">
                        <span>Range: {min} – {max} {config.unit}</span>
                        <span>Captured: {new Date(config.capturedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CALIBRATION */}
          {activeTab === 'calibration' && (
            <div className="space-y-4">
              {currentRec ? (
                <CalibrationCard
                  recommendation={currentRec}
                  sensorName={sensor.name}
                  onEvaluate={handleEvaluate}
                  isEvaluating={isEvaluating}
                />
              ) : (
                <div className="text-center py-10 rounded border border-dashed border-border p-6 space-y-3">
                  <p className="text-xs text-muted">No calibration recommendation generated for this sensor yet.</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleEvaluate}
                    isLoading={isEvaluating}
                    leftIcon={<RotateCw size={14} />}
                  >
                    Run First Calibration Evaluation
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEATHER CONTEXT */}
          {activeTab === 'weather' && (
            <div className="space-y-4">
              <WeatherWidget weather={weather} siteName={`Site #${sensor.siteId}`} />
            </div>
          )}

          {/* TAB 5: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <CalibrationHistoryTable
                history={history}
                sensorNameMap={{ [sensor.id]: sensor.name }}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

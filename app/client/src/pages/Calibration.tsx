import { useState, useEffect } from 'react';
import { 
  Sliders, 
  RotateCw, 
  Cpu, 
  Sparkles
} from 'lucide-react';
import type { Sensor, CalibrationRecommendation } from '../types';
import { sensorsApi } from '../api/sensors.api';
import { sitesApi } from '../api/sites.api';
import { calibrationApi } from '../api/calibration.api';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { CalibrationCard } from '../components/calibration/CalibrationCard';
import { CalibrationHistoryTable } from '../components/calibration/CalibrationHistoryTable';
import { useToast } from '../context/ToastContext';

export interface CalibrationProps {
  selectedSiteId: number | null;
  onSelectSite: (id: number) => void;
}

export function Calibration({ selectedSiteId, onSelectSite }: CalibrationProps) {
  const { showToast } = useToast();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [activeSensorId, setActiveSensorId] = useState<number | null>(null);

  const [currentRec, setCurrentRec] = useState<CalibrationRecommendation | null>(null);
  const [history, setHistory] = useState<CalibrationRecommendation[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sites and sensors
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sitesData = await sitesApi.list();
      const targetSiteId = selectedSiteId || (sitesData[0]?.id ?? null);
      if (targetSiteId) {
        if (!selectedSiteId) onSelectSite(targetSiteId);
        const sensorList = await sensorsApi.listBySite(targetSiteId);
        setSensors(sensorList);

        if (sensorList.length > 0) {
          const firstSensorId = sensorList[0].id;
          setActiveSensorId(firstSensorId);
          await loadSensorCalibration(firstSensorId);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load calibration interface');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSensorCalibration = async (sensorId: number) => {
    try {
      const [rec, hist] = await Promise.all([
        calibrationApi.current(sensorId).catch(() => null),
        calibrationApi.history(sensorId).catch(() => []),
      ]);
      setCurrentRec(rec);
      setHistory(hist || []);
    } catch (e) {
      console.error('Error fetching calibration data for sensor', sensorId, e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [selectedSiteId]);

  const handleSelectSensor = async (sensorId: number) => {
    setActiveSensorId(sensorId);
    await loadSensorCalibration(sensorId);
  };

  const handleRunEvaluation = async () => {
    if (!activeSensorId) return;
    try {
      setIsEvaluating(true);
      const newRec = await calibrationApi.evaluate(activeSensorId);
      setCurrentRec(newRec);
      setHistory((prev) => [newRec, ...prev]);
      showToast('success', 'Recommendation Evaluated', `Engine calculated ${newRec.action} with ${newRec.riskLevel} risk.`);
    } catch (err: any) {
      showToast('error', 'Evaluation Failed', err.message || 'Calibration execution error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const activeSensor = sensors.find((s) => s.id === activeSensorId);
  const sensorNameMap = Object.fromEntries(sensors.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground tracking-tight">
              Calibration Intelligence Center
            </h1>
            <Badge variant="primary" size="sm">
              DETERMINISTIC V1.0 + AI OBSERVABILITY
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Operational sensitivity and threshold calibration driven by local atmospheric telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => activeSensorId && loadSensorCalibration(activeSensorId)}
            leftIcon={<RotateCw size={12} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="xs"
            onClick={handleRunEvaluation}
            isLoading={isEvaluating}
            leftIcon={<Sparkles size={13} />}
          >
            Evaluate Selected Sensor
          </Button>
        </div>
      </div>

      {/* Sensor Selector Strip */}
      <div className="rounded-lg border border-border bg-surface p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-primary" />
            <span className="text-xs font-semibold text-foreground font-mono uppercase">
              Target Sensor For Calibration Inspection
            </span>
          </div>

          <div className="w-full sm:w-80">
            <Select
              value={activeSensorId || ''}
              onChange={(e) => handleSelectSensor(Number(e.target.value))}
            >
              {sensors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.profileCode})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {activeSensor && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border text-xs text-muted">
            <span>Profile: <strong className="text-foreground">{activeSensor.profileCode} v{activeSensor.profileVersion}</strong></span>
            <span>•</span>
            <span>Make: <strong className="text-foreground">{activeSensor.manufacturer || 'Generic'}</strong></span>
            <span>•</span>
            <span>Zone: <strong className="text-foreground">{activeSensor.installationZone || 'General'}</strong></span>
            <span>•</span>
            <span>Status: <Badge variant="success" size="sm">{activeSensor.status}</Badge></span>
          </div>
        )}
      </div>

      {/* Loading or Error States */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadInitialData} />
      ) : !activeSensor ? (
        <EmptyState
          icon={Sliders}
          title="No Sensors Available for Calibration"
          description="Register sensors for this perimeter facility to generate rule-based calibration recommendations."
        />
      ) : (
        <div className="space-y-6">
          {/* Active Recommendation Card (Section 11) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
                Current Calibration Recommendation Assessment
              </h3>
              {currentRec && (
                <span className="text-[11px] text-muted font-mono">
                  Recommendation ID: #{currentRec.id}
                </span>
              )}
            </div>

            {currentRec ? (
              <CalibrationCard
                recommendation={currentRec}
                sensorName={activeSensor.name}
                onEvaluate={handleRunEvaluation}
                isEvaluating={isEvaluating}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-surface-secondary/20 p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-muted mx-auto">
                  <Sliders size={20} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">No Recommendation Generated</h3>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  The calibration engine evaluates current wind, rain, and temperature conditions to calculate the optimal threshold.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunEvaluation}
                  isLoading={isEvaluating}
                  leftIcon={<Sparkles size={14} />}
                >
                  Generate First Evaluation
                </Button>
              </div>
            )}
          </div>

          {/* Historical Recommendations Table (Section 12) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
                  Sensor Calibration Evaluation Audit Log ({history.length})
                </h3>
                <p className="text-[11px] text-muted">
                  Immutable historical trail of environmental snapshots and engine adjustments.
                </p>
              </div>
            </div>

            <CalibrationHistoryTable
              history={history}
              sensorNameMap={sensorNameMap}
              onSelect={(rec) => setCurrentRec(rec)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

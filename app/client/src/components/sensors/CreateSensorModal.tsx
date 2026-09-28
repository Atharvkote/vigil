import { useState, useEffect } from 'react';
import type { SensorProfile, Site, CreateSensorRequest, ParameterValueRequest, SensorStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Badge } from '../common/Badge';
import { sensorsApi } from '../../api/sensors.api';
import { useToast } from '../../context/ToastContext';
import { Cpu, CheckCircle2, ChevronRight, ChevronLeft, Sliders } from 'lucide-react';

export interface CreateSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  profiles: SensorProfile[];
  defaultSiteId?: number;
  onCreated: () => void;
}

export function CreateSensorModal({
  isOpen,
  onClose,
  sites,
  profiles,
  defaultSiteId,
  onCreated,
}: CreateSensorModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [siteId, setSiteId] = useState<number>(defaultSiteId || (sites[0]?.id ?? 1));
  const [selectedProfileId, setSelectedProfileId] = useState<number>(profiles[0]?.id ?? 1);
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [installationZone, setInstallationZone] = useState('');
  const [status, setStatus] = useState<SensorStatus>('ACTIVE');
  const [configValues, setConfigValues] = useState<Record<string, number>>({});

  // Reset or initialize when modal opens or profile changes
  useEffect(() => {
    if (defaultSiteId) {
      setSiteId(defaultSiteId);
    }
  }, [defaultSiteId]);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // Whenever selected profile changes, initialize config values with defaultValues
  useEffect(() => {
    if (selectedProfile?.parameters) {
      const initialConfigs: Record<string, number> = {};
      selectedProfile.parameters.forEach((param) => {
        initialConfigs[param.parameterKey] = Number(param.defaultValue ?? 0);
      });
      setConfigValues(initialConfigs);
    }
  }, [selectedProfileId, selectedProfile]);

  const handleConfigChange = (key: string, val: number) => {
    setConfigValues((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleNext = () => {
    if (step === 1 && !siteId) {
      showToast('warning', 'Site Required', 'Please select a deployment site.');
      return;
    }
    if (step === 2 && !selectedProfileId) {
      showToast('warning', 'Profile Required', 'Please select a sensor profile.');
      return;
    }
    if (step === 3) {
      if (!name.trim()) {
        showToast('warning', 'Name Required', 'Sensor identifier / name is mandatory.');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const configuration: ParameterValueRequest[] = Object.entries(configValues).map(
        ([parameterKey, value]) => ({
          parameterKey,
          value,
        })
      );

      const payload: CreateSensorRequest = {
        name,
        sensorProfileId: selectedProfileId,
        manufacturer: manufacturer || selectedProfile?.manufacturerScope || 'Generic',
        model: model || selectedProfile?.modelScope || 'DEMO',
        installationZone: installationZone || 'General Perimeter Zone',
        status,
        configuration,
      };

      await sensorsApi.create(siteId, payload);
      showToast('success', 'Sensor Deployed', `Sensor "${name}" registered with ${selectedProfile?.name}.`);
      onCreated();
      onClose();
      // Reset
      setStep(1);
      setName('');
      setManufacturer('');
      setModel('');
      setInstallationZone('');
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Unable to register sensor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Perimeter Sensor"
      description="Deploy a hardware sensor backed by a verified profile and initial calibration parameters."
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              leftIcon={<ChevronLeft size={14} />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={<ChevronRight size={14} />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 size={14} />}
            >
              Create Sensor
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          {[
            { num: 1, label: 'Site' },
            { num: 2, label: 'Profile' },
            { num: 3, label: 'Hardware' },
            { num: 4, label: 'Parameters' },
            { num: 5, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-colors ${
                  step === s.num
                    ? 'bg-primary text-primary-foreground'
                    : step > s.num
                    ? 'bg-success text-white'
                    : 'bg-surface-secondary text-muted border border-border'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === s.num ? 'text-foreground font-semibold' : 'text-muted'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Site */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase text-muted tracking-wider">
              Step 1: Select Target Perimeter Installation
            </h4>
            <Select
              label="Perimeter Site Location"
              value={siteId}
              onChange={(e) => setSiteId(Number(e.target.value))}
              required
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.locationLabel}
                </option>
              ))}
            </Select>
            <div className="p-3 rounded border border-border bg-surface-secondary/30 text-xs text-muted">
              Sensors are bound to a geographic site where real-time Open-Meteo environmental telemetry is correlated.
            </div>
          </div>
        )}

        {/* Step 2: Select Sensor Profile */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase text-muted tracking-wider">
                Step 2: Choose Hardware Sensor Profile
              </h4>
              <span className="text-[11px] text-muted">Defines supported parameters</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {profiles.map((p) => {
                const isSelected = selectedProfileId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-subtle/10 shadow-xs ring-1 ring-primary/30'
                        : 'border-border bg-surface hover:bg-surface-secondary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className={isSelected ? 'text-primary' : 'text-muted'} />
                        <span className="text-sm font-semibold text-foreground">{p.name}</span>
                      </div>
                      <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">
                        {p.code} v{p.profileVersion}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted mb-2.5 leading-relaxed">{p.description}</p>
                    
                    {/* Supported parameter chips */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-mono text-muted uppercase">Parameters:</span>
                      {p.parameters.map((param) => (
                        <span
                          key={param.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-secondary border border-border text-foreground"
                        >
                          {param.displayName} ({param.unit})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Hardware & Installation Info */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase text-muted tracking-wider">
              Step 3: Hardware & Sector Identity
            </h4>

            <Input
              label="Sensor Identifier / Name"
              placeholder="e.g. North Gate Fiber Strain Array 01"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Manufacturer"
                placeholder={selectedProfile?.manufacturerScope || 'Manufacturer'}
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              />
              <Input
                label="Model Number / Scope"
                placeholder={selectedProfile?.modelScope || 'Model'}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Installation Zone / Sector"
                placeholder="e.g. Sector 4 East Fence"
                value={installationZone}
                onChange={(e) => setInstallationZone(e.target.value)}
              />
              <Select
                label="Initial Operational Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as SensorStatus)}
              >
                <option value="ACTIVE">ACTIVE (Operational)</option>
                <option value="MAINTENANCE">MAINTENANCE (Attention)</option>
                <option value="INACTIVE">INACTIVE (Disabled)</option>
              </Select>
            </div>
          </div>
        )}

        {/* Step 4: Configuration Parameters (ONLY those supported by profile!) */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase text-muted tracking-wider">
                Step 4: Profile Configuration Parameters
              </h4>
              <Badge variant="primary" size="sm">
                {selectedProfile?.code}
              </Badge>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Below are the exact parameters supported by <strong>{selectedProfile?.name}</strong>. Irrelevant parameters for other sensor types are suppressed.
            </p>

            <div className="space-y-4 pt-2">
              {selectedProfile?.parameters.map((param) => {
                const currentVal = configValues[param.parameterKey] ?? Number(param.defaultValue ?? 0);
                const min = param.minValue !== null ? Number(param.minValue) : 0;
                const max = param.maxValue !== null ? Number(param.maxValue) : 100;
                const stepVal = param.dataType === 'INTEGER' ? 1 : 0.5;

                return (
                  <div key={param.id} className="p-4 rounded-lg border border-border bg-surface-secondary/20 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Sliders size={13} className="text-primary" />
                        {param.displayName}
                      </span>
                      <span className="font-mono px-2 py-0.5 rounded bg-surface border border-border text-foreground font-bold">
                        {currentVal} <span className="text-muted font-normal text-[11px]">{param.unit}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={stepVal}
                        value={currentVal}
                        onChange={(e) => handleConfigChange(param.parameterKey, Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <input
                        type="number"
                        min={min}
                        max={max}
                        step={stepVal}
                        value={currentVal}
                        onChange={(e) => handleConfigChange(param.parameterKey, Number(e.target.value))}
                        className="w-20 h-8 rounded bg-surface border border-border text-center text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-muted font-mono">
                      <span>Min: {min} {param.unit}</span>
                      <span>Default: {Number(param.defaultValue ?? 0)} {param.unit}</span>
                      <span>Max: {max} {param.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Review & Confirm */}
        {step === 5 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase text-muted tracking-wider">
              Step 5: Review Deployment Specification
            </h4>

            <div className="p-4 rounded-lg border border-border bg-surface space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Target Site:</span>
                <span className="font-semibold text-foreground">
                  {sites.find((s) => s.id === siteId)?.name || `Site #${siteId}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Sensor Name:</span>
                <span className="font-semibold text-foreground">{name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Profile:</span>
                <span className="font-mono text-primary font-semibold">{selectedProfile?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Manufacturer / Model:</span>
                <span className="font-foreground">{manufacturer || 'Generic'} / {model || 'Demo'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Zone:</span>
                <span className="text-foreground">{installationZone || 'General'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted">Status:</span>
                <Badge variant={status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                  {status}
                </Badge>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-mono text-muted uppercase block mb-1.5">
                  Initial Profile Parameter Values:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(configValues).map(([key, val]) => (
                    <div key={key} className="p-2 rounded bg-surface-secondary border border-border font-mono text-[11px] flex justify-between">
                      <span className="text-muted">{key}:</span>
                      <span className="font-bold text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

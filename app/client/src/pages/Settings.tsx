import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Database, 
  Activity, 
  ShieldCheck, 
  RotateCw
} from 'lucide-react';
import type { SensorProfile } from '../types';
import { profilesApi } from '../api/profiles.api';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export function Settings() {
  const [profiles, setProfiles] = useState<SensorProfile[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('UNKNOWN');
  const [isLoading, setIsLoading] = useState(true);

  const checkHealthAndProfiles = async () => {
    try {
      setIsLoading(true);
      const [profilesData, healthRes] = await Promise.all([
        profilesApi.list(),
        api.get<{ status: string }>('/api/v1/health').catch(() => ({ status: 'DOWN' })),
      ]);
      setProfiles(profilesData);
      setHealthStatus(healthRes.status);
    } catch (err: any) {
      setHealthStatus('OFFLINE');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealthAndProfiles();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <SettingsIcon size={18} className="text-primary" />
            System Engine & Profile Diagnostics
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Architecture health, active sensor profile contracts, and rule engine specifications.
          </p>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={checkHealthAndProfiles}
          isLoading={isLoading}
          leftIcon={<RotateCw size={12} />}
        >
          Run Diagnostic Check
        </Button>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>SPRING BOOT CORE</span>
            <Activity size={15} className="text-success" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-foreground">{healthStatus}</span>
            <Badge variant={healthStatus === 'UP' ? 'success' : 'danger'} size="sm" dot>
              {healthStatus === 'UP' ? 'LIVENESS OK' : 'CHECK FAILED'}
            </Badge>
          </div>
          <div className="text-[11px] text-muted mt-1 font-mono">Port 8081 • Spring Boot 3.5.16</div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>DATABASE LAYER</span>
            <Database size={15} className="text-primary" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-foreground">H2 IN-MEMORY</span>
            <Badge variant="primary" size="sm">FLYWAY V9</Badge>
          </div>
          <div className="text-[11px] text-muted mt-1 font-mono">11 migrations validated</div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>INTELLIGENCE RULES</span>
            <ShieldCheck size={15} className="text-primary" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-foreground">DETERMINISTIC</span>
            <Badge variant="info" size="sm">+ AI REASONING</Badge>
          </div>
          <div className="text-[11px] text-muted mt-1 font-mono">Rule Engine v1.0 Active</div>
        </div>
      </div>

      {/* Sensor Profiles Architecture Overview */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
            Active Hardware Profile Specifications ({profiles.length})
          </h3>
          <p className="text-[11px] text-muted">
            The engine strictly enforces that sensors only configure parameters defined by their assigned profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="p-5 rounded-lg border border-border bg-surface shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-foreground">{profile.name}</span>
                  </div>
                  <Badge variant="primary" size="sm">
                    v{profile.profileVersion}
                  </Badge>
                </div>

                <div className="text-xs text-muted font-mono mb-3">
                  Code: <strong className="text-foreground">{profile.code}</strong>
                </div>

                <p className="text-xs text-muted leading-relaxed mb-4">
                  {profile.description}
                </p>

                {/* Parameters Supported */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider block">
                    Supported Parameters:
                  </span>
                  <div className="space-y-1.5">
                    {profile.parameters.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded bg-surface-secondary/40 border border-border flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-foreground">{p.displayName}</span>
                        <span className="font-mono text-muted text-[11px]">
                          {p.unit} ({Number(p.minValue)} - {Number(p.maxValue)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weather Factors */}
              <div className="pt-3 border-t border-border">
                <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider block mb-1.5">
                  Correlated Weather Factors:
                </span>
                <div className="flex flex-wrap gap-1">
                  {profile.relevantWeatherFactors.map((f) => (
                    <span
                      key={f}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-secondary border border-border text-muted"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

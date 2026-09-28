import { Wind, CloudRain, Droplets, CloudLightning, Cpu, CheckCircle2, Clock } from 'lucide-react';
import type { CalibrationRecommendation, RiskLevel } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export interface CalibrationCardProps {
  recommendation: CalibrationRecommendation;
  sensorName?: string;
  onEvaluate?: () => void;
  isEvaluating?: boolean;
}

export function CalibrationCard({
  recommendation,
  sensorName,
  onEvaluate,
  isEvaluating,
}: CalibrationCardProps) {
  const riskVariants: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'danger',
  };

  const actionColors: Record<string, string> = {
    INCREASE: 'text-primary bg-primary-subtle border-primary/30',
    DECREASE: 'text-warning bg-warning-subtle border-warning/30',
    MAINTAIN: 'text-success bg-success-subtle border-success/30',
    SET: 'text-info bg-info-subtle border-info/30',
  };

  const formatParamName = (key: string) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-xs">
      {/* Top Banner */}
      <div className="px-5 py-3.5 border-b border-border bg-surface-secondary/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-muted font-mono">
            Calibration Intelligence Console
          </span>
          {sensorName && (
            <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded bg-surface border border-border">
              {sensorName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={riskVariants[recommendation.riskLevel] || 'neutral'} size="sm" dot>
            {recommendation.riskLevel} RISK
          </Badge>
          <span className="text-[11px] text-muted font-mono flex items-center gap-1">
            <Clock size={12} />
            {new Date(recommendation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-5">
        {/* Comparison Row: Current vs Recommended vs Applied */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Current */}
          <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono mb-1">
              1. Current Configuration
            </div>
            <div className="text-sm font-semibold text-foreground">
              {formatParamName(recommendation.affectedParameter)}
            </div>
            <div className="text-2xl font-mono font-bold text-foreground mt-1">
              {recommendation.currentValue !== null && recommendation.currentValue !== undefined 
                ? Number(recommendation.currentValue).toFixed(1) 
                : '--'}
            </div>
            <div className="text-[11px] text-muted mt-1">Active sensor parameter value</div>
          </div>

          {/* Recommended */}
          <div className="p-3.5 rounded border border-primary/30 bg-primary-subtle/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono mb-1 flex items-center justify-between">
              <span>2. Recommended Target</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${actionColors[recommendation.action] || 'text-primary'}`}>
                {recommendation.action}
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              Target: <span className="text-primary font-mono">{Number(recommendation.recommendedValue).toFixed(1)}</span>
            </div>
            <div className="text-2xl font-mono font-bold text-primary mt-1">
              {Number(recommendation.recommendedMin).toFixed(0)} – {Number(recommendation.recommendedMax).toFixed(0)}
            </div>
            <div className="text-[11px] text-muted mt-1">Calculated operational range</div>
          </div>

          {/* Operator Action / Applied status */}
          <div className="p-3.5 rounded border border-border bg-surface-secondary/20 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono mb-1">
                3. Lifecycle State
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={recommendation.status === 'APPLIED' ? 'success' : 'neutral'} size="sm">
                  {recommendation.status}
                </Badge>
              </div>
              <p className="text-[11px] text-muted mt-2 leading-tight">
                {recommendation.status === 'APPLIED' 
                  ? 'Operator confirmed parameter application in control console.'
                  : 'Hardware changes require manual operator review.'}
              </p>
            </div>
            {onEvaluate && (
              <Button
                variant="outline"
                size="xs"
                onClick={onEvaluate}
                isLoading={isEvaluating}
                className="mt-3 w-full"
              >
                Re-evaluate Rules
              </Button>
            )}
          </div>
        </div>

        {/* Environmental Factors at observation */}
        {recommendation.weather && (
          <div className="p-3.5 rounded border border-border bg-surface-secondary/30">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono mb-2.5">
              Live Environmental Context (Trigger Snapshot)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Wind size={15} className="text-primary shrink-0" />
                <div>
                  <span className="text-muted block text-[10px]">Wind Velocity</span>
                  <span className="font-mono font-medium text-foreground">
                    {recommendation.weather.windSpeedMs !== undefined 
                      ? `${(Number(recommendation.weather.windSpeedMs) * 3.6).toFixed(1)} km/h`
                      : '--'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CloudRain size={15} className="text-primary shrink-0" />
                <div>
                  <span className="text-muted block text-[10px]">Rainfall</span>
                  <span className="font-mono font-medium text-foreground">
                    {recommendation.weather.rainfallMm !== undefined 
                      ? `${Number(recommendation.weather.rainfallMm).toFixed(1)} mm/h`
                      : '--'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplets size={15} className="text-primary shrink-0" />
                <div>
                  <span className="text-muted block text-[10px]">Rel. Humidity</span>
                  <span className="font-mono font-medium text-foreground">
                    {recommendation.weather.humidityPercent !== undefined 
                      ? `${Number(recommendation.weather.humidityPercent).toFixed(0)}%`
                      : '--'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CloudLightning size={15} className="text-warning shrink-0" />
                <div>
                  <span className="text-muted block text-[10px]">Atmospheric Status</span>
                  <span className="font-mono font-medium text-foreground">
                    {recommendation.weather.stormCondition ? 'STORM ALERT' : 'Normal / Stable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reasons & AI Explanation */}
        <div className="space-y-3">
          {recommendation.reasons && recommendation.reasons.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono mb-1.5">
                Deterministic Rule Rationale
              </div>
              <ul className="space-y-1">
                {recommendation.reasons.map((reason, index) => (
                  <li key={index} className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-primary font-mono text-xs">›</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.aiAnalysis && recommendation.aiAnalysis.reason && (
            <div className="p-3.5 rounded border border-border bg-surface-secondary/40 text-xs">
              <div className="flex items-center gap-1.5 text-primary text-[11px] font-semibold mb-1">
                <Cpu size={14} />
                <span>AI Observability Explanation</span>
              </div>
              <p className="text-muted leading-relaxed">
                {recommendation.aiAnalysis.reason}
              </p>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted font-mono">
          <span>Engine: Rule v{recommendation.ruleVersion || '1.0'} | Profile v{recommendation.profileVersion || '1.0'}</span>
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 size={12} />
            Deterministic Match Verified
          </span>
        </div>
      </div>
    </div>
  );
}

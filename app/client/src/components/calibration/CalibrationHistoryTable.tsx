import type { CalibrationRecommendation, RiskLevel } from '../../types';
import { Badge } from '../common/Badge';
import { Clock } from 'lucide-react';

export interface CalibrationHistoryTableProps {
  history: CalibrationRecommendation[];
  sensorNameMap?: Record<number, string>;
  onSelect?: (rec: CalibrationRecommendation) => void;
}

export function CalibrationHistoryTable({
  history,
  sensorNameMap = {},
  onSelect,
}: CalibrationHistoryTableProps) {
  const riskVariants: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'danger',
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted">
        No prior calibration recommendation evaluations recorded.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-surface">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border bg-surface-secondary/60 text-muted font-mono uppercase text-[10px] tracking-wider">
            <th className="py-2.5 px-4 font-semibold">Evaluation Timestamp</th>
            <th className="py-2.5 px-4 font-semibold">Sensor</th>
            <th className="py-2.5 px-4 font-semibold">Risk Level</th>
            <th className="py-2.5 px-4 font-semibold">Action</th>
            <th className="py-2.5 px-4 font-semibold">Parameter</th>
            <th className="py-2.5 px-4 font-semibold">Current → Recommended</th>
            <th className="py-2.5 px-4 font-semibold">Environment</th>
            <th className="py-2.5 px-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {history.map((rec) => {
            const date = new Date(rec.createdAt);
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const sensorLabel = sensorNameMap[rec.sensorId] || `Sensor #${rec.sensorId}`;

            return (
              <tr
                key={rec.id}
                onClick={() => onSelect?.(rec)}
                className={`hover:bg-surface-secondary/40 transition-colors ${onSelect ? 'cursor-pointer' : ''}`}
              >
                <td className="py-3 px-4 font-mono text-muted whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-muted" />
                    <span>{formattedDate} {formattedTime}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                  {sensorLabel}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge variant={riskVariants[rec.riskLevel] || 'neutral'} size="sm" dot>
                    {rec.riskLevel}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                  {rec.action}
                </td>
                <td className="py-3 px-4 font-mono text-muted whitespace-nowrap">
                  {rec.affectedParameter}
                </td>
                <td className="py-3 px-4 font-mono whitespace-nowrap">
                  <span className="text-muted">{Number(rec.currentValue).toFixed(1)}</span>
                  <span className="mx-1.5 text-primary">→</span>
                  <span className="font-semibold text-foreground">
                    {Number(rec.recommendedValue).toFixed(1)} ({Number(rec.recommendedMin).toFixed(0)}-{Number(rec.recommendedMax).toFixed(0)})
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-muted text-[11px] whitespace-nowrap">
                  {rec.weather ? (
                    <span>
                      {(Number(rec.weather.windSpeedMs) * 3.6).toFixed(0)} km/h w | {Number(rec.weather.rainfallMm).toFixed(1)} mm r
                    </span>
                  ) : (
                    '--'
                  )}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Badge variant={rec.status === 'APPLIED' ? 'success' : 'neutral'} size="sm">
                    {rec.status}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

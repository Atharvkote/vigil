import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Wind, 
  Thermometer, 
  Sliders, 
  RotateCw, 
  FileText,
  Clock
} from 'lucide-react';
import type { Site, SiteAnalytics, SiteReport } from '../types';
import { analyticsApi } from '../api/analytics.api';
import { sitesApi } from '../api/sites.api';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { ErrorState } from '../components/common/ErrorState';
import { useTheme } from '../context/ThemeContext';

export interface AnalyticsProps {
  selectedSiteId: number | null;
  onSelectSite: (id: number) => void;
}

export function Analytics({ selectedSiteId, onSelectSite }: AnalyticsProps) {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const [sites, setSites] = useState<Site[]>([]);
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null);
  const [report, setReport] = useState<SiteReport | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sitesData = await sitesApi.list();
      setSites(sitesData);

      const targetSiteId = selectedSiteId || (sitesData[0]?.id ?? null);
      if (targetSiteId) {
        if (!selectedSiteId) onSelectSite(targetSiteId);
        const [analyticsData, reportData] = await Promise.all([
          analyticsApi.getAnalytics(targetSiteId).catch(() => null),
          analyticsApi.getReport(targetSiteId).catch(() => null),
        ]);
        setAnalytics(analyticsData);
        setReport(reportData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate facility analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedSiteId]);

  if (isLoading && !analytics) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <ErrorState message={error} onRetry={loadAnalytics} />
      </div>
    );
  }

  // Prepare Risk Level Distribution Chart Data
  const riskChartData = [
    { name: 'LOW', value: analytics?.calibration?.recommendationsByRiskLevel?.LOW || 0, color: '#10b981' },
    { name: 'MEDIUM', value: analytics?.calibration?.recommendationsByRiskLevel?.MEDIUM || 0, color: '#f59e0b' },
    { name: 'HIGH', value: analytics?.calibration?.recommendationsByRiskLevel?.HIGH || 0, color: '#ef4444' },
  ];

  // Prepare Actions Count Data
  const actionChartData = Object.entries(analytics?.calibration?.actionsCount || {}).map(
    ([action, count]) => ({
      action,
      count,
      color: action === 'INCREASE' ? '#0284c7' : action === 'DECREASE' ? '#f59e0b' : '#10b981',
    })
  );



  const activeSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground tracking-tight">
              Observability & Risk Analytics
            </h1>
            <Badge variant="primary" size="sm">
              {activeSite?.name || 'Perimeter Site'}
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Statistical distribution of environmental triggers and calibration interventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={loadAnalytics}
            leftIcon={<RotateCw size={12} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Atmospheric Operational Metrics KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>OBSERVATIONS</span>
            <Clock size={14} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {analytics?.weather?.totalObservations ?? 0}
          </div>
          <div className="text-[11px] text-muted mt-1">Total recorded weather points</div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>MAX WIND VELOCITY</span>
            <Wind size={14} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {analytics?.weather?.maxWindSpeedMs !== undefined 
              ? `${(Number(analytics.weather.maxWindSpeedMs) * 3.6).toFixed(1)} km/h`
              : '--'}
          </div>
          <div className="text-[11px] text-muted mt-1">Peak atmospheric gust threshold</div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>AVG TEMPERATURE</span>
            <Thermometer size={14} className="text-warning" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {analytics?.weather?.avgTemperatureC !== undefined
              ? `${Number(analytics.weather.avgTemperatureC).toFixed(1)}°C`
              : '--'}
          </div>
          <div className="text-[11px] text-muted mt-1">
            Humidity avg: {analytics?.weather?.avgHumidityPercent !== undefined ? `${Number(analytics.weather.avgHumidityPercent).toFixed(0)}%` : '--'}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
          <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
            <span>CALIBRATION EVENTS</span>
            <Sliders size={14} className="text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {analytics?.calibration?.totalRecommendations ?? 0}
          </div>
          <div className="text-[11px] text-muted mt-1">Engine recommendation triggers</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Level Distribution (Operational Assessment) */}
        <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
              Risk Level Distribution
            </h3>
            <p className="text-[11px] text-muted">Proportion of environmental risk evaluations</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskChartData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#101620' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '6px',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-mono font-bold text-foreground">
                {analytics?.calibration?.totalRecommendations ?? 0}
              </span>
              <span className="text-[10px] text-muted uppercase font-mono tracking-wider">
                Evaluations
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-6 pt-2 border-t border-border text-xs">
            {riskChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 font-mono">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-muted">{item.name}:</span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Type Count */}
        <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
              Recommended Action Breakdown
            </h3>
            <p className="text-[11px] text-muted">Increases, Decreases, or Maintained thresholds</p>
          </div>

          <div className="h-60 w-full -ml-3">
            {actionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? '#1e293b' : '#e2e8f0'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="action"
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={isDark ? '#64748b' : '#94a3b8'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#101620' : '#ffffff',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                      borderRadius: '6px',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {actionChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted">
                No action triggers recorded yet
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border text-xs text-muted font-mono">
            <span>Primary Objective: Mitigate False Alarms</span>
            <span className="text-success font-semibold">Engine Verified</span>
          </div>
        </div>
      </div>

      {/* Automated Site Executive Report Section */}
      {report && (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
                Executive Facility Environmental Report
              </h3>
            </div>
            <span className="text-[11px] text-muted font-mono">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Recent Recommendations Log */}
            <div>
              <div className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider mb-2">
                Recent Calibration Advisories
              </div>
              {report.recentRecommendations && report.recentRecommendations.length > 0 ? (
                <div className="space-y-2">
                  {report.recentRecommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded bg-surface-secondary/40 border border-border">
                      <div className="flex justify-between text-foreground font-semibold mb-1">
                        <span>{rec.sensorName}</span>
                        <Badge variant="primary" size="sm">{rec.action}</Badge>
                      </div>
                      <p className="text-muted text-[11px] leading-relaxed">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-[11px]">No recent recommendations logged.</p>
              )}
            </div>

            {/* Recent Weather Activity */}
            <div>
              <div className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider mb-2">
                Recent Atmospheric Snapshots
              </div>
              {report.recentWeather && report.recentWeather.length > 0 ? (
                <div className="space-y-2">
                  {report.recentWeather.map((w, i) => (
                    <div key={i} className="p-3 rounded bg-surface-secondary/40 border border-border flex items-center justify-between">
                      <span className="text-foreground">{w.summary}</span>
                      <span className="text-muted font-mono text-[11px]">
                        {new Date(w.observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-[11px]">No weather snapshots logged.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Database, 
  Activity, 
  ShieldCheck, 
  RotateCw,
  Terminal,
  ExternalLink,
  BookOpen,
  Filter,
  Search,
  Sparkles,
  CloudSun,
  Layers,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Shield,
  Bot
} from 'lucide-react';
import type { SensorProfile, SystemAcknowledgement, SystemLog } from '../types';
import { profilesApi } from '../api/profiles.api';
import { systemApi } from '../api/system.api';
import { api } from '../api/client';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export function Settings() {
  const { showToast } = useToast();

  // Tab & View Controls
  const [activeTab, setActiveTab] = useState<'overview' | 'acknowledgements' | 'logs'>('overview');

  // Diagnostics & Profiles
  const [profiles, setProfiles] = useState<SensorProfile[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('UNKNOWN');
  const [isLoading, setIsLoading] = useState(true);

  // Acknowledgements & Logs
  const [acknowledgements, setAcknowledgements] = useState<SystemAcknowledgement[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Log Filters
  const [logSearch, setLogSearch] = useState('');
  const [subsystemFilter, setSubsystemFilter] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const checkHealthAndProfiles = async () => {
    try {
      setIsLoading(true);
      const [profilesData, healthRes, acksData, logsData] = await Promise.all([
        profilesApi.list().catch(() => []),
        api.get<{ status: string }>('/api/v1/health').catch(() => ({ status: 'DOWN' })),
        systemApi.getAcknowledgements().catch(() => []),
        systemApi.getLogs().catch(() => []),
      ]);
      setProfiles(profilesData);
      setHealthStatus(healthRes.status);
      setAcknowledgements(acksData);
      setLogs(logsData);
    } catch (err: any) {
      setHealthStatus('OFFLINE');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const data = await systemApi.getLogs();
      setLogs(data);
      showToast('info', 'Engine logs refreshed', 'Retrieved latest rule, AI, and telemetry logs');
    } catch (e) {
      showToast('error', 'Failed to refresh engine logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleSimulateEvaluation = () => {
    const timestamp = new Date().toISOString();
    const newRuleLog: SystemLog = {
      id: `RULE-SIM-${Date.now()}`,
      timestamp,
      subsystem: 'RULE_ENGINE',
      level: 'RULE_EXEC',
      source: 'CalibrationEngine',
      siteName: 'Mumbai Refinery Facility',
      sensorName: 'North Fence Geophone Array',
      message: "RULE EVALUATED: Action DECREASE on 'sensitivity' -> target 50.0 (current: 75.0, clamped: 10.0-100.0)",
      details: 'Wind gust 22.4 m/s triggers high aerodynamic fence strain. Clamping applied: proposed 50.0 within hardware bounds [10.0, 100.0].',
      metadata: {
        action: 'DECREASE',
        parameter: 'sensitivity',
        hardwareBounds: '[10.0, 100.0]',
        recommendedValue: 50.0,
        riskLevel: 'HIGH',
      },
    };

    const newAiLog: SystemLog = {
      id: `AI-SIM-${Date.now()}`,
      timestamp: new Date(Date.now() + 45).toISOString(),
      subsystem: 'AI_ENGINE',
      level: 'AI_ANALYSIS',
      source: 'AiRecommendationService / LlmAiClient',
      siteName: 'Mumbai Refinery Facility',
      sensorName: 'North Fence Geophone Array',
      message: 'AI EXPLANATION: Reduced sensitivity proposed to suppress persistent mechanical fence resonance.',
      details: 'Micro-burst gusts detected at 22.4 m/s. The deterministic engine calculates a target sensitivity of 50.0 to eliminate nuisance alarms while preserving perimeter breach detection thresholds.',
      metadata: {
        sensor: 'North Fence Geophone Array',
        confidence: 'HIGH',
        status: 'VERIFIED',
      },
    };

    setLogs((prev) => [newAiLog, newRuleLog, ...prev]);
    showToast('success', 'Rule & AI Evaluation Executed', 'New live engine logs injected into terminal');
  };

  useEffect(() => {
    checkHealthAndProfiles();
  }, []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSubsystem =
        subsystemFilter === 'ALL' || log.subsystem === subsystemFilter;
      const matchesSearch =
        logSearch.trim() === '' ||
        log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.source.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.sensorName.toLowerCase().includes(logSearch.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase()));
      return matchesSubsystem && matchesSearch;
    });
  }, [logs, subsystemFilter, logSearch]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('info', 'Copied to clipboard', 'Log entry copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <SettingsIcon size={18} className="text-primary" />
            System Engine & Intelligence Diagnostics
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Architecture health, third-party acknowledgements, active sensor contracts, and live rule / AI engine logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-border gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <Layers size={14} />
          <span>Engine Overview & Profiles ({profiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('acknowledgements')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'acknowledgements'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <BookOpen size={14} />
          <span>Third-Party, API & AI Acknowledgements ({acknowledgements.length || 8})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'logs'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          <Terminal size={14} />
          <span>Rule Engine & AI Logs Console</span>
          <Badge variant="primary" size="sm">
            {logs.length}
          </Badge>
        </button>
      </div>

      {/* SECTION 1: OVERVIEW & PROFILES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Engine Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="text-[11px] text-muted mt-1 font-mono">Port 8081 • Java 21 LTS</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
              <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
                <span>DATABASE LAYER</span>
                <Database size={15} className="text-primary" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-foreground">POSTGRESQL</span>
                <Badge variant="primary" size="sm">FLYWAY V9</Badge>
              </div>
              <div className="text-[11px] text-muted mt-1 font-mono">11 migrations applied</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
              <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
                <span>RULE ENGINE</span>
                <ShieldCheck size={15} className="text-primary" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-foreground">DETERMINISTIC</span>
                <Badge variant="info" size="sm">ACTIVE</Badge>
              </div>
              <div className="text-[11px] text-muted mt-1 font-mono">Hardware Bounds Clamped</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface shadow-xs">
              <div className="flex justify-between items-center text-muted text-xs font-mono mb-1">
                <span>AI REASONER</span>
                <Sparkles size={15} className="text-purple-400" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-foreground">EXPLAINABLE</span>
                <Badge variant="neutral" size="sm">XAI v1.0</Badge>
              </div>
              <div className="text-[11px] text-muted mt-1 font-mono">Contextual Justifications</div>
            </div>
          </div>

          {/* Quick Nav Banner to Acknowledgements and Logs */}
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <BookOpen size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground">Third-Party & AI Acknowledgements Ready</h4>
                <p className="text-[11px] text-muted">
                  Open-Meteo, Leaflet, OpenStreetMap, Spring Boot, and AI LLM Engine citations compliant with the A-1 Launchpad case study.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="xs" onClick={() => setActiveTab('acknowledgements')}>
                View Acknowledgements
              </Button>
              <Button variant="primary" size="xs" onClick={() => setActiveTab('logs')}>
                Open Engine Logs Console
              </Button>
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
      )}

      {/* SECTION 2: THIRD-PARTY / API / AI ACKNOWLEDGEMENTS */}
      {activeTab === 'acknowledgements' && (
        <div className="space-y-6">
          {/* Banner */}
          <div className="p-4 rounded-lg border border-border bg-surface shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                Mandatory Project Acknowledgements & Citations
              </h2>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              In accordance with the <strong>A-1 Launchpad Case Study Baseline</strong>, all third-party libraries, APIs, datasets, GIS providers, and artificial intelligence tools used within the VigilSense platform are formally acknowledged below.
            </p>
          </div>

          {/* Acknowledgements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acknowledgements.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-lg border border-border bg-surface shadow-xs space-y-3.5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-surface-secondary border border-border flex items-center justify-center text-primary shrink-0">
                      {item.category === 'EXTERNAL_API' && <CloudSun size={16} />}
                      {item.category === 'GIS_MAPPING' && <ExternalLink size={16} />}
                      {item.category === 'AI_ENGINE' && <Bot size={16} className="text-purple-400" />}
                      {item.category === 'RULE_ENGINE' && <ShieldCheck size={16} className="text-cyan-400" />}
                      {item.category === 'CORE_FRAMEWORK' && <Cpu size={16} />}
                      {item.category === 'DATABASE' && <Database size={16} />}
                      {item.category === 'FRONTEND' && <FileCode size={16} />}
                      {item.category === 'SPECIFICATION' && <Shield size={16} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span>{item.name}</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-primary transition-colors"
                          title="Open official documentation"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </h4>
                      <span className="text-[11px] text-muted font-mono block">
                        Provider: {item.provider} • {item.version}
                      </span>
                    </div>
                  </div>

                  <Badge variant="primary" size="sm">
                    {item.license}
                  </Badge>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  {item.description}
                </p>

                <div className="p-2.5 rounded bg-surface-secondary/50 border border-border text-xs space-y-1">
                  <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted">
                    Role in VigilSense:
                  </div>
                  <div className="text-foreground text-[11px] leading-relaxed">
                    {item.roleInVigilSense}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: RULE ENGINE & AI ENGINE LOGS CONSOLE */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-surface shadow-xs">
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-primary" />
              <div>
                <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
                  Live Rule Engine & AI Engine Execution Logs
                </h3>
                <p className="text-[11px] text-muted">
                  Inspecting real-time rule evaluations, parameter boundary clamping, and explainable AI syntheses.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Filter logs by sensor, message..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-surface-secondary border border-border rounded text-foreground placeholder:text-muted focus:outline-none focus:border-primary w-48 sm:w-60 font-mono"
                />
              </div>

              {/* Subsystem Filter Dropdown */}
              <div className="flex items-center gap-1 bg-surface-secondary border border-border rounded px-2 py-1">
                <Filter size={12} className="text-muted" />
                <select
                  value={subsystemFilter}
                  onChange={(e) => setSubsystemFilter(e.target.value)}
                  className="bg-transparent text-xs text-foreground font-mono focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Subsystems</option>
                  <option value="RULE_ENGINE">Rule Engine</option>
                  <option value="AI_ENGINE">AI Engine (XAI)</option>
                  <option value="WEATHER_API">Weather Telemetry</option>
                  <option value="AUDIT_TRAIL">Audit Aspect</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={refreshLogs}
                isLoading={isLoadingLogs}
                leftIcon={<RotateCw size={12} />}
              >
                Refresh Logs
              </Button>

              <Button
                variant="primary"
                size="xs"
                onClick={handleSimulateEvaluation}
                leftIcon={<Sparkles size={12} />}
              >
                Simulate Live Evaluation
              </Button>
            </div>
          </div>

          {/* Tactical Terminal Window */}
          <div className="rounded-lg border border-border bg-[#0b0f17] text-gray-200 shadow-md font-mono text-xs overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-[#121824] px-4 py-2 border-b border-[#1f2937] flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                </div>
                <span className="ml-2 font-mono text-gray-300">vigilsense-engine-console ~ live-stream</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400">
                  Showing {filteredLogs.length} of {logs.length} entries
                </span>
              </div>
            </div>

            {/* Terminal Log Entries */}
            <div className="p-3 divide-y divide-[#182234] max-h-[600px] overflow-y-auto space-y-1">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isRule = log.subsystem === 'RULE_ENGINE';
                  const isAi = log.subsystem === 'AI_ENGINE';
                  const isWeather = log.subsystem === 'WEATHER_API';

                  return (
                    <div
                      key={log.id}
                      className="py-2 px-2 hover:bg-[#131b2a] rounded transition-colors group cursor-pointer"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Subsystem Icon */}
                          <div className="mt-0.5 shrink-0">
                            {isExpanded ? (
                              <ChevronDown size={14} className="text-gray-400" />
                            ) : (
                              <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300" />
                            )}
                          </div>

                          {/* Timestamp */}
                          <span className="text-gray-500 text-[10px] shrink-0 pt-0.5">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              fractionalSecondDigits: 3,
                            })}
                          </span>

                          {/* Subsystem Tag */}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${
                              isRule
                                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                : isAi
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : isWeather
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                          >
                            {log.subsystem}
                          </span>

                          {/* Level */}
                          <span
                            className={`text-[10px] font-bold shrink-0 ${
                              log.level === 'WARN'
                                ? 'text-amber-400'
                                : log.level === 'AI_ANALYSIS'
                                ? 'text-purple-400'
                                : log.level === 'RULE_EXEC'
                                ? 'text-cyan-300'
                                : 'text-gray-400'
                            }`}
                          >
                            [{log.level}]
                          </span>

                          {/* Source & Sensor */}
                          <span className="text-gray-400 text-[11px] truncate shrink-0">
                            {log.source} ({log.sensorName}):
                          </span>

                          {/* Message */}
                          <span className="text-gray-100 text-[11px] break-words flex-1">
                            {log.message}
                          </span>
                        </div>

                        {/* Quick Copy Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(
                              `[${log.timestamp}] [${log.subsystem}] [${log.level}] ${log.message}\nDetails: ${log.details}`,
                              log.id
                            );
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 rounded transition-opacity shrink-0"
                          title="Copy raw log line"
                        >
                          {copiedId === log.id ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                        </button>
                      </div>

                      {/* Expandable Details Tray */}
                      {isExpanded && (
                        <div className="mt-2.5 ml-6 pl-3 border-l-2 border-[#223049] text-[11px] space-y-2 py-1">
                          <div className="text-gray-300 leading-relaxed">
                            <span className="text-gray-500 font-semibold block text-[10px] uppercase">
                              Full Diagnostic Details / Evaluation Rationale:
                            </span>
                            <span className="text-gray-200">{log.details}</span>
                          </div>

                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="bg-[#0e1522] p-2.5 rounded border border-[#1b2536] text-[10px] space-y-1">
                              <span className="text-gray-400 font-bold block uppercase tracking-wider">
                                Subsystem Payload Metadata:
                              </span>
                              <pre className="text-emerald-400 overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="text-[10px] text-gray-500 flex items-center gap-4">
                            <span>Site: <strong className="text-gray-300">{log.siteName}</strong></span>
                            <span>Target: <strong className="text-gray-300">{log.sensorName}</strong></span>
                            <span>Log ID: <strong className="text-gray-400">{log.id}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-500 space-y-2 font-sans">
                  <Terminal size={24} className="mx-auto text-gray-600" />
                  <div className="text-xs font-semibold text-gray-400">No logs matching filter criteria</div>
                  <div className="text-[11px]">Clear search or select another subsystem above.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

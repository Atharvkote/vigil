import { useState } from 'react';
import { 
  Wind, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  CloudLightning, 
  Zap, 
  RotateCw
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export function Simulator() {
  const [profileType, setProfileType] = useState<'FIBER_OPTIC_FENCE' | 'MICROWAVE' | 'INFRARED_BEAM'>('FIBER_OPTIC_FENCE');
  const [wind, setWind] = useState(24);
  const [rain, setRain] = useState(4.5);
  const [temp, setTemp] = useState(28);
  const [humidity, setHumidity] = useState(72);
  const [storm, setStorm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Derived deterministic scenario evaluation
  const calculateResult = () => {
    let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let riskScore = 15;
    let action = 'MAINTAIN';
    let targetRange = '65 – 75';
    let affectedParam = 'sensitivity';
    let reason = 'Atmospheric conditions within standard baseline tolerances.';

    if (profileType === 'FIBER_OPTIC_FENCE') {
      affectedParam = 'Sensitivity';
      if (storm || wind > 40 || rain > 20) {
        risk = 'HIGH';
        riskScore = 84;
        action = 'DECREASE';
        targetRange = '45 – 55';
        reason = 'Severe wind turbulence and heavy rainfall cause intense physical fence oscillation, risking continuous false alarms.';
      } else if (wind > 20 || rain > 5) {
        risk = 'MEDIUM';
        riskScore = 52;
        action = 'DECREASE';
        targetRange = '55 – 65';
        reason = 'Elevated wind velocity increases surface noise on fence structure; sensitivity reduction recommended.';
      } else {
        risk = 'LOW';
        riskScore = 18;
        action = 'MAINTAIN';
        targetRange = '70 – 80';
        reason = 'Normal calm weather supports standard high-detection perimeter baseline.';
      }
    } else if (profileType === 'MICROWAVE') {
      affectedParam = 'Alarm Delay';
      if (storm || rain > 15) {
        risk = 'HIGH';
        riskScore = 78;
        action = 'INCREASE';
        targetRange = '4.0 – 6.0 s';
        reason = 'Heavy rain curtains scatter microwave beam energy; increasing alarm delay prevents rain flurry trips.';
      } else if (rain > 3) {
        risk = 'MEDIUM';
        riskScore = 44;
        action = 'INCREASE';
        targetRange = '3.0 – 4.0 s';
        reason = 'Moderate surface puddling and rain create intermittent reflections.';
      } else {
        risk = 'LOW';
        riskScore = 12;
        action = 'MAINTAIN';
        targetRange = '2.0 – 3.0 s';
        reason = 'Direct line-of-sight microwave path is clear and stable.';
      }
    } else {
      affectedParam = 'Beam Interruption Threshold';
      if (storm || humidity > 90 || rain > 12) {
        risk = 'HIGH';
        riskScore = 80;
        action = 'DECREASE';
        targetRange = '35 – 45 %';
        reason = 'High humidity / precipitation causes optical attenuation, requiring adjusted interruption threshold.';
      } else if (humidity > 80 || rain > 2) {
        risk = 'MEDIUM';
        riskScore = 48;
        action = 'DECREASE';
        targetRange = '45 – 55 %';
        reason = 'Atmospheric moisture begins to refract infrared beam pulse intensity.';
      } else {
        risk = 'LOW';
        riskScore = 15;
        action = 'MAINTAIN';
        targetRange = '50 – 60 %';
        reason = 'Optical clarity verified; baseline IR barrier operational.';
      }
    }

    return { risk, riskScore, action, targetRange, affectedParam, reason };
  };

  const result = calculateResult();

  const handleSimulate = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 450);
  };

  const riskBadgeVariants = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'danger',
  } as const;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Zap size={18} className="text-primary" />
              Environmental Simulation Sandbox
            </h1>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Model synthetic weather conditions to test deterministic calibration engine reactions per sensor profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setWind(10);
              setRain(0);
              setTemp(25);
              setHumidity(50);
              setStorm(false);
            }}
          >
            Reset to Calm
          </Button>
          <Button
            variant="primary"
            size="xs"
            onClick={() => {
              setWind(55);
              setRain(32);
              setTemp(18);
              setHumidity(92);
              setStorm(true);
            }}
          >
            Simulate Severe Gale
          </Button>
        </div>
      </div>

      {/* Profile Selector */}
      <div className="p-4 rounded-lg border border-border bg-surface shadow-xs space-y-2">
        <label className="text-xs font-semibold text-foreground block">
          Target Sensor Profile Under Test:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'FIBER_OPTIC_FENCE', name: 'Fiber-Optic Fence Sensor', param: 'Sensitivity & Alarm Threshold' },
            { id: 'MICROWAVE', name: 'Microwave Barrier Sensor', param: 'Detection Range & Alarm Delay' },
            { id: 'INFRARED_BEAM', name: 'Active Infrared Beam Pair', param: 'Beam Interruption Threshold' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setProfileType(item.id as any);
                handleSimulate();
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                profileType === item.id
                  ? 'border-primary bg-primary-subtle/10 ring-1 ring-primary/40'
                  : 'border-border bg-surface-secondary/20 hover:bg-surface-secondary/50'
              }`}
            >
              <span className="text-xs font-semibold text-foreground block">{item.name}</span>
              <span className="text-[10px] text-muted font-mono block mt-0.5">{item.param}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Parameters Slider Panel */}
        <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
              Synthetic Environmental Sliders
            </h3>
            <span className="text-[11px] text-muted font-mono">Real-time Evaluation</span>
          </div>

          <div className="space-y-6">
            {/* Wind Velocity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Wind size={15} className="text-primary" /> Wind Velocity
                </span>
                <span className="font-mono font-bold text-foreground bg-surface-secondary px-2 py-0.5 rounded border border-border">
                  {wind} <span className="text-muted font-normal text-[11px]">km/h</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wind}
                onChange={(e) => setWind(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>0 km/h (Calm)</span>
                <span>50 km/h (Gale)</span>
                <span>100 km/h (Storm)</span>
              </div>
            </div>

            {/* Rainfall Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <CloudRain size={15} className="text-primary" /> Precipitation Rate
                </span>
                <span className="font-mono font-bold text-foreground bg-surface-secondary px-2 py-0.5 rounded border border-border">
                  {rain} <span className="text-muted font-normal text-[11px]">mm/h</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={rain}
                onChange={(e) => setRain(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>0 mm/h (Dry)</span>
                <span>20 mm/h (Rain)</span>
                <span>60 mm/h (Downpour)</span>
              </div>
            </div>

            {/* Ambient Temperature */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Thermometer size={15} className="text-warning" /> Ambient Temperature
                </span>
                <span className="font-mono font-bold text-foreground bg-surface-secondary px-2 py-0.5 rounded border border-border">
                  {temp} <span className="text-muted font-normal text-[11px]">°C</span>
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="55"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>-20 °C</span>
                <span>25 °C</span>
                <span>55 °C</span>
              </div>
            </div>

            {/* Relative Humidity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <Droplets size={15} className="text-primary" /> Relative Humidity
                </span>
                <span className="font-mono font-bold text-foreground bg-surface-secondary px-2 py-0.5 rounded border border-border">
                  {humidity} <span className="text-muted font-normal text-[11px]">%</span>
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>10% (Arid)</span>
                <span>60% (Nominal)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            {/* Severe Storm Condition Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded border border-border bg-surface-secondary/30">
              <div className="flex items-center gap-2">
                <CloudLightning size={16} className={storm ? 'text-danger' : 'text-muted'} />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Severe Storm Condition Override
                  </span>
                  <span className="text-[11px] text-muted">
                    Triggers maximum environmental mitigation rule
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStorm(!storm)}
                className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${
                  storm ? 'bg-danger' : 'bg-surface-secondary border border-border'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    storm ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleSimulate}
            isLoading={analyzing}
            className="w-full"
            leftIcon={<RotateCw size={14} />}
          >
            Run Synthetic Calibration Engine
          </Button>
        </div>

        {/* Right Side: Predicted Recommendation Results */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-xs font-semibold text-foreground tracking-tight uppercase font-mono">
                Deterministic Engine Response
              </h3>
              <Badge variant={riskBadgeVariants[result.risk]} size="sm" dot>
                {result.risk} RISK
              </Badge>
            </div>

            {/* Score and Target Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded border border-border bg-surface-secondary/20">
                <span className="text-[10px] font-mono text-muted uppercase block">
                  Affected Parameter
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {result.affectedParam}
                </span>
                <span className="text-2xl font-mono font-bold text-primary mt-1 block">
                  {result.action}
                </span>
              </div>

              <div className="p-3.5 rounded border border-primary/30 bg-primary-subtle/10">
                <span className="text-[10px] font-mono text-primary uppercase block">
                  Recommended Target Range
                </span>
                <span className="text-2xl font-mono font-bold text-foreground mt-1.5 block">
                  {result.targetRange}
                </span>
                <span className="text-[11px] text-muted mt-1 block">
                  Risk score: {result.riskScore} / 100
                </span>
              </div>
            </div>

            {/* Rule Rationale */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider block">
                Rule Diagnostic Explanation:
              </span>
              <p className="text-xs text-foreground leading-relaxed p-3.5 rounded border border-border bg-surface-secondary/30">
                {result.reason}
              </p>
            </div>

            {/* Key Atmospheric Risk Factors */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-[10px] font-mono text-muted uppercase font-bold tracking-wider block">
                Factor Contribution Breakdown:
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Wind Dynamics:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {wind > 35 ? 'CRITICAL OSCILLATION' : wind > 18 ? 'MODERATE VIBRATION' : 'NOMINAL'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Precipitation Impact:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {rain > 15 ? 'HIGH ATTENUATION' : rain > 2 ? 'SURFACE MOVEMENT' : 'DRY SENSOR'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Storm Override:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {storm ? 'ACTIVE INTERVENTION' : 'STANDBY'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

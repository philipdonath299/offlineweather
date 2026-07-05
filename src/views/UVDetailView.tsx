import { useState, useMemo, useEffect, useRef } from 'react';
import { useWeatherContext } from '../context/WeatherContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SunDim, RotateCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// En egen animerad siffra-komponent som använder requestAnimationFrame för 60fps uppdateringar
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const requestRef = useRef<number>();
  const startValueRef = useRef(value);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();
    
    const duration = 300; // ms animation

    const animate = (time: number) => {
      if (!startTimeRef.current) return;
      const progress = Math.min((time - startTimeRef.current) / duration, 1);
      
      // Easing: easeOutExpo (mjuk inbromsning)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const nextValue = startValueRef.current + (value - startValueRef.current) * easeProgress;
      setDisplayValue(nextValue);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [value]); // Bara animera om värdet ändras

  return <>{displayValue.toFixed(1)}</>;
}

export default function UVDetailView() {
  const { data } = useWeatherContext();
  const navigate = useNavigate();

  const [activeItem, setActiveItem] = useState<{ time: string, uv: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  if (!data) return null;

  const currentUv = data.current.uvIndex;
  
  const today = new Date().toISOString().substring(0, 10);
  const todaysData = data.hourly.time.map((t, i) => ({
    time: t,
    uv: data.hourly.uvIndex[i]
  })).filter(item => item.time.startsWith(today));
  
  const peakUvItem = [...todaysData].sort((a, b) => b.uv - a.uv)[0];
  const maxUv = peakUvItem?.uv || 0;
  
  const times = useMemo(() => {
    const t = {
      start: '',
      level1: '',
      moderate: '',
      high: '',
      peak: new Date(peakUvItem?.time || '').getHours() + ':00',
      decrease: '',
      low: '',
      end: ''
    };
    
    let peaked = false;
    todaysData.forEach((item) => {
      const hour = new Date(item.time).getHours() + ':00';
      if (item.uv > 0 && !t.start) t.start = hour;
      if (item.uv >= 1 && !t.level1) t.level1 = hour;
      if (item.uv >= 3 && !t.moderate) t.moderate = hour;
      if (item.uv >= 6 && !t.high) t.high = hour;
      if (item.time === peakUvItem?.time) peaked = true;
      if (peaked) {
        if (item.uv < maxUv && !t.decrease) t.decrease = hour;
        if (item.uv < 3 && item.uv > 0 && !t.low && t.decrease) t.low = hour;
        if (item.uv === 0 && !t.end && t.decrease) t.end = hour;
      }
    });
    return t;
  }, [todaysData, maxUv, peakUvItem]);

  const chartData = todaysData.map(item => ({
    time: new Date(item.time).getHours().toString().padStart(2, '0') + ':00',
    uv: item.uv,
    rawTime: item.time
  }));

  const nowHourStr = new Date().getHours().toString().padStart(2, '0') + ':00';

  // Bestäm vilket värde hjulet ska visa
  // 1. Om man skrubbar -> visa det skrubbade värdet.
  // 2. Om man har expanderat vyn (klickat på hjulet) -> visa dagens max-värde.
  // 3. Annars -> visa nuvarande värde.
  const displayUv = isScrubbing && activeItem ? activeItem.uv : (expanded ? maxUv : currentUv);
  const displayTime = isScrubbing && activeItem ? activeItem.time : (expanded ? 'Dagens Max' : 'Nu');

  // Nattlogik (om det är mitt i natten och currentUV = 0)
  const isNight = currentUv === 0 && !isScrubbing && !expanded;

  let riskLevel = 'LÅG';
  if (displayUv >= 3) riskLevel = 'MÅTTLIG';
  if (displayUv >= 6) riskLevel = 'HÖG';
  if (displayUv >= 8) riskLevel = 'MYCKET HÖG';
  if (displayUv >= 11) riskLevel = 'EXTREM';
  if (displayUv === 0) riskLevel = 'INGEN UV';

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const uvPercentage = Math.min((displayUv / 11) * 100, 100);
  const strokeDashoffset = circumference - (uvPercentage / 100) * circumference;
  const rotationAngle = (displayUv / 11) * 360 - 90;

  const handleChartInteraction = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      setIsScrubbing(true);
      setActiveItem({
        time: state.activePayload[0].payload.time,
        uv: state.activePayload[0].payload.uv
      });
      setExpanded(false); // Stäng expandern om vi börjar skrubba
    }
  };

  const handleReset = () => {
    setIsScrubbing(false);
    setActiveItem(null);
    setExpanded(false);
  };

  const handleWheelClick = () => {
    // Om vi redan är i scrubbing mode, återställ först
    setIsScrubbing(false);
    setExpanded(!expanded);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <div className="flex-between" style={{ marginTop: '16px' }}>
        <button onClick={() => navigate(-1)} className="flex-center" style={{ gap: '8px' }}>
          <ArrowLeft size={20} className="text-muted" />
          <span className="font-medium text-muted">Detaljer</span>
        </button>
        <span className="font-semibold" style={{ fontSize: '18px' }}>UV-index</span>
        <div style={{ width: '60px' }}>
           {isScrubbing && (
             <button onClick={handleReset} className="flex-center text-muted" style={{ padding: '8px' }}>
               <RotateCcw size={18} />
             </button>
           )}
        </div>
      </div>

      <div className="flex-col flex-center" style={{ textAlign: 'center', gap: '4px', height: '60px' }}>
        <h1 className="text-3xl font-bold transition-all" style={{ color: '#ffffff' }}>{riskLevel}</h1>
        <p className="text-muted text-md transition-all">
          {displayTime === 'Nu' ? 'Aktuellt index' : displayTime === 'Dagens Max' ? 'Dagens högsta värde' : `Prognos kl. ${displayTime}`}
        </p>
      </div>

      {/* Cirkulärt UV-hjul (Gauge) */}
      <div 
        className="flex-center" 
        style={{ 
          position: 'relative', 
          padding: '10px 0',
          cursor: 'pointer',
          transform: expanded ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
        }} 
        onClick={handleWheelClick}
      >
        <svg width="280" height="280" viewBox="0 0 280 280">
          <defs>
             <path id="textPathOut" d="M 140 20 a 120 120 0 1 1 -0.1 0" />
          </defs>
          
          <text fill="#8e8e93" fontSize="11" letterSpacing="5" fontWeight="600" opacity={0.6}>
            <textPath href="#textPathOut" startOffset="3%">
               LOW | MODERATE | HIGH | VERY HIGH | EXTREME
            </textPath>
          </text>

          {/* Bakgrundscirkel */}
          <circle 
            cx="140" cy="140" r={radius} 
            fill="none" 
            stroke="rgba(255,255,255,0.06)" 
            strokeWidth="18" 
          />
          
          {/* Värdecirkel */}
          <circle 
            cx="140" cy="140" r={radius} 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="18" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 140 140)"
            style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }}
          />
          
          {/* Inre triangel-pekare på rätt vinkel */}
          <g 
            transform={`rotate(${rotationAngle} 140 140)`} 
            style={{ transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }}
          >
             <polygon points="215,140 235,135 235,145" fill="#ffffff" />
          </g>
        </svg>

        <div className="flex-col flex-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', gap: '4px' }}>
          <span className="text-muted text-sm font-medium" style={{ opacity: isNight ? 0.5 : 1 }}>
            {isNight ? 'Natt' : (expanded ? 'Peak UV' : 'UV')}
          </span>
          <span className="font-bold" style={{ fontSize: '56px', color: '#ffffff', letterSpacing: '-2px' }}>
            <AnimatedNumber value={displayUv} />
          </span>
        </div>
      </div>

      {/* Expandable info */}
      <div style={{ 
        maxHeight: expanded ? '500px' : '0px', 
        opacity: expanded ? 1 : 0, 
        overflow: 'hidden', 
        transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)' 
      }}>
        <div className="surface-card flex-col" style={{ marginBottom: '16px' }}>
          <div className="section-header">UV Tidslinje Idag</div>
          <div className="list-item flex-between">
            <span className="text-muted">Solen stiger (UV &gt; 0)</span>
            <span className="font-semibold">{times.start || '-'}</span>
          </div>
          {times.moderate && (
            <div className="list-item flex-between">
              <span className="text-muted">Måttlig UV (Skydd rekommenderas)</span>
              <span className="font-semibold">{times.moderate}</span>
            </div>
          )}
          <div className="list-item flex-between" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <span className="font-semibold" style={{ color: '#ffffff' }}>Dagens Max ({maxUv})</span>
            <span className="font-semibold" style={{ color: '#ffffff' }}>{times.peak}</span>
          </div>
          {times.low && (
            <div className="list-item flex-between">
              <span className="text-muted">Återgår till Låg</span>
              <span className="font-semibold">{times.low}</span>
            </div>
          )}
          <div className="list-item flex-between" style={{ borderBottom: 'none' }}>
            <span className="text-muted">Solen går ner</span>
            <span className="font-semibold">{times.end || '-'}</span>
          </div>
        </div>
      </div>

      {/* Graf över dagens UV */}
      <div className="surface-card" style={{ height: '220px', padding: '24px 0 0 0', position: 'relative', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            onMouseMove={handleChartInteraction}
            onTouchMove={handleChartInteraction}
          >
            <defs>
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8e8e93" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8e8e93" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            
            {/* Markör för Nuvarande Tid */}
            <ReferenceLine x={nowHourStr} stroke="#4a4a4a" strokeDasharray="3 3" />
            
            {/* Markör för Skrubbing */}
            {isScrubbing && activeItem && (
              <ReferenceLine x={activeItem.time} stroke="#ffffff" strokeWidth={2} />
            )}

            <Tooltip 
              contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelStyle={{ color: '#8e8e93', marginBottom: '4px' }}
              cursor={false} // Vi ritar en egen reference line
            />
            <Area 
              type="monotone" 
              dataKey="uv" 
              stroke="#8e8e93" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#uvGradient)" 
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="flex-between text-muted text-xs" style={{ position: 'absolute', bottom: '16px', left: '24px', right: '24px', pointerEvents: 'none' }}>
          <span>{new Date(data.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span>Max {maxUv.toFixed(1)}</span>
          <span>{new Date(data.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      {/* Rekommendationer */}
      <div className="surface-card" style={{ transition: 'all 0.3s ease' }}>
        <div className="section-header flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '16px' }}>
          <SunDim size={18} />
          REKOMMENDATIONER VID {displayUv.toFixed(1)}
        </div>
        <p className="text-muted" style={{ lineHeight: '1.6' }}>
          {displayUv < 3 && 'Ingen särskild solskyddsåtgärd behövs. Det är säkert att vistas utomhus.'}
          {displayUv >= 3 && displayUv < 6 && 'Använd solskyddsfaktor (SPF 30+) om du vistas utomhus. Solglasögon och hatt rekommenderas.'}
          {displayUv >= 6 && displayUv < 8 && 'Solskydd krävs. Använd hatt, solglasögon och SPF 30+. Undvik solen mitt på dagen.'}
          {displayUv >= 8 && 'Extrem försiktighet krävs! Oskyddad hud bränns mycket snabbt. Stanna i skuggan.'}
        </p>
      </div>
    </div>
  );
}

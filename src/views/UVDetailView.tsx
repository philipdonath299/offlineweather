import { useState, useEffect, useRef, useMemo } from 'react';
import { useWeatherContext } from '../context/WeatherContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, SunDim } from 'lucide-react';
import { getWeatherDescription } from '../utils/weatherCodes';
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
    
    const duration = 400; // ms animation

    const animate = (time: number) => {
      if (!startTimeRef.current) return;
      const progress = Math.min((time - startTimeRef.current) / duration, 1);
      
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
  }, [value]);

  return <>{displayValue.toFixed(1)}</>;
}

export default function UVDetailView() {
  const { data } = useWeatherContext();
  const navigate = useNavigate();
  const [isPeeking, setIsPeeking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState<{ time: string, uv: number } | null>(null);

  if (!data) return null;

  const currentUv = data.current.uvIndex;
  
  // Dagens max-UV och data för kurvan
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
  
  // Värde att visa (aktuellt vs peak vs skrubbning)
  const isScrubbing = activeItem !== null;
  const displayUv = isPeeking ? maxUv : (isScrubbing && activeItem ? activeItem.uv : currentUv);
  const displayTime = isPeeking ? 'Peak UV' : (isScrubbing && activeItem ? activeItem.time : 'Aktuellt UV');

  // Rubriken översatt tillbaka till svenska
  let headerTitle = 'LÅG';
  if (currentUv >= 3) headerTitle = 'MÅTTLIG';
  if (currentUv >= 6) headerTitle = 'HÖG';
  if (currentUv >= 8) headerTitle = 'MYCKET HÖG';
  if (currentUv >= 11) headerTitle = 'EXTREM';
  if (currentUv === 0) headerTitle = 'INGEN UV';

  const weatherDesc = getWeatherDescription(data.current.weatherCode);

  // Animation handlers (Dial Peek & Expand)
  const handlePointerDownDial = () => setIsPeeking(true);
  const handlePointerUpDial = () => setIsPeeking(false);
  const handleDialClick = () => setExpanded(!expanded);

  // Recharts handlers
  const handleChartInteraction = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      setActiveItem({
        time: state.activePayload[0].payload.time,
        uv: state.activePayload[0].payload.uv
      });
      setIsPeeking(false);
    }
  };

  const handleReset = () => {
    setActiveItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '40px', minHeight: '100vh', backgroundColor: '#000000', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Navigation */}
      <div className="flex-between" style={{ padding: '16px' }}>
        <button onClick={() => navigate(-1)} className="flex-center" style={{ gap: '8px' }}>
          <ArrowLeft size={20} className="text-muted" />
        </button>
      </div>

      {/* Rubrik, Beskrivning, Plats */}
      <div className="flex-col flex-center" style={{ textAlign: 'center', marginTop: '10px', gap: '6px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#ffffff', letterSpacing: '-1px', lineHeight: '1' }}>
          {headerTitle}
        </h1>
        <p style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff', marginTop: '4px' }}>
          {weatherDesc}
        </p>
        <div className="flex-center" style={{ gap: '4px', color: '#ffffff', fontSize: '15px', fontWeight: '500', opacity: 0.9 }}>
          <Navigation size={14} fill="#ffffff" strokeWidth={0} />
          {data.location.name}
        </div>
      </div>

      {/* Graf med Recharts precis som på övriga detaljsidor */}
      <div style={{ width: '100%', height: '180px', marginTop: '40px', padding: '0 16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            onMouseMove={handleChartInteraction}
            onMouseLeave={handleReset}
          >
            <defs>
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8e8e93" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8e8e93" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            
            {/* Markör för Nuvarande Tid */}
            <ReferenceLine x={nowHourStr} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            
            {/* Markör för Skrubbing */}
            {isScrubbing && activeItem && (
              <ReferenceLine x={activeItem.time} stroke="#ffffff" strokeWidth={2} />
            )}

            <Tooltip 
              contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelStyle={{ color: '#8e8e93', marginBottom: '4px' }}
              cursor={false}
            />
            <Area 
              type="monotone" 
              dataKey="uv" 
              stroke="#ffffff" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#uvGradient)" 
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="flex-between text-muted text-xs" style={{ marginTop: '8px', padding: '0 8px' }}>
          <span>{new Date(data.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span>{new Date(data.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      {/* UV-hjulet (Mekanisk Dial) */}
      <div 
        className="flex-center" 
        style={{ 
          position: 'relative', 
          flex: 1,
          marginTop: '20px',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'none' // Förhindra scroll när vi håller in
        }}
        onPointerDown={handlePointerDownDial}
        onPointerUp={handlePointerUpDial}
        onPointerLeave={handlePointerUpDial}
        onClick={handleDialClick}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg width="340" height="340" viewBox="0 0 340 340">
          <defs>
             {/* Ringen går från Top Center (170, 35) och medurs, radie 135 */}
             <path id="ringPath" d="M 170 35 A 135 135 0 1 1 169.9 35" fill="none" />
          </defs>
          
          {/* Roterande yttre ring */}
          <g 
            transform={`rotate(${-((displayUv / 14) * 360)} 170 170)`} 
            style={{ transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }}
          >
            {/* Tjock bakgrundsring */}
            <circle cx="170" cy="170" r="135" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="36" />
            
            {/* Ticks vid gränserna */}
            {[0, 3, 6, 8, 11].map(uv => (
              <g key={uv} transform={`rotate(${(uv / 14) * 360} 170 170)`}>
                <line x1="170" y1="17" x2="170" y2="53" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
              </g>
            ))}

            {/* Texter centrerade i sina sektioner */}
            <text fill="#ffffff" fontSize="13" fontWeight="600" letterSpacing="2">
              {[
                { text: 'LOW', uv: 1.5 },
                { text: 'MODERATE', uv: 4.5 },
                { text: 'HIGH', uv: 7 },
                { text: 'VERY HIGH', uv: 9.5 },
                { text: 'EXTREME', uv: 12.5 },
              ].map(item => (
                <textPath key={item.text} href="#ringPath" startOffset={`${(item.uv / 14) * 100}%`} textAnchor="middle">
                  {item.text}
                </textPath>
              ))}
            </text>
          </g>

          {/* Fasta inre delar */}
          {/* Svart mittcirkel */}
          <circle cx="170" cy="170" r="115" fill="#000000" />
          
          {/* Fast pil som pekar ut mot ringen på kl 12 */}
          <polygon points="160,55 180,55 170,42" fill="#ffffff" />
        </svg>

        {/* Mitteninformation (Fast) */}
        <div className="flex-col flex-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', gap: '0px', pointerEvents: 'none' }}>
          <span className="text-muted font-medium" style={{ fontSize: '18px', opacity: isPeeking || isScrubbing ? 1 : 0, transition: 'opacity 0.3s', height: isPeeking || isScrubbing ? 'auto' : '0', overflow: 'hidden' }}>
            {displayTime}
          </span>
          <span className="font-bold" style={{ fontSize: '84px', color: '#ffffff', letterSpacing: '-3px', lineHeight: '1.1' }}>
            <AnimatedNumber value={displayUv} />
          </span>
          <span className="text-muted font-medium" style={{ fontSize: '16px', marginTop: '4px', opacity: isPeeking || isScrubbing ? 0 : 1, transition: 'opacity 0.3s' }}>
            Aktuellt UV
          </span>
        </div>
      </div>

      {/* Expandable Tidslinje och Rekommendationer */}
      <div style={{ 
        maxHeight: expanded ? '600px' : '0px', 
        opacity: expanded ? 1 : 0, 
        overflow: 'hidden', 
        transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        padding: expanded ? '0 16px' : '0 16px'
      }}>
        <div className="surface-card flex-col" style={{ marginBottom: '16px', marginTop: '20px' }}>
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

        {/* Rekommendationer */}
        <div className="surface-card" style={{ transition: 'all 0.3s ease', marginBottom: '20px' }}>
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

    </div>
  );
}

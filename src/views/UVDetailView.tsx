import { useState, useMemo } from 'react';
import { useWeatherContext } from '../context/WeatherContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SunDim } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function UVDetailView() {
  const { data } = useWeatherContext();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  const currentUv = data.current.uvIndex;
  
  // Hitta dagens max-UV
  const today = new Date().toISOString().substring(0, 10);
  const todaysData = data.hourly.time.map((t, i) => ({
    time: t,
    uv: data.hourly.uvIndex[i]
  })).filter(item => item.time.startsWith(today));
  
  const peakUvItem = [...todaysData].sort((a, b) => b.uv - a.uv)[0];
  const maxUv = peakUvItem?.uv || 0;
  
  // Tider för trösklar
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

  // SVG Gauge Beräkningar
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  // Mappa UV 0-11 till en vinkel (0-360, men vi använder 0-100% av stroke)
  const uvPercentage = Math.min((currentUv / 11) * 100, 100);
  const strokeDashoffset = circumference - (uvPercentage / 100) * circumference;

  let riskLevel = 'LÅG';
  if (currentUv >= 3) riskLevel = 'MÅTTLIG';
  if (currentUv >= 6) riskLevel = 'HÖG';
  if (currentUv >= 8) riskLevel = 'MYCKET HÖG';
  if (currentUv >= 11) riskLevel = 'EXTREM';

  const chartData = todaysData.map(item => ({
    time: new Date(item.time).getHours().toString().padStart(2, '0') + ':00',
    uv: item.uv
  }));

  const nowHour = new Date().getHours().toString().padStart(2, '0') + ':00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      <div className="flex-between" style={{ marginTop: '16px' }}>
        <button onClick={() => navigate(-1)} className="flex-center" style={{ gap: '8px' }}>
          <ArrowLeft size={20} className="text-muted" />
          <span className="font-medium text-muted">Detaljer</span>
        </button>
        <span className="font-semibold" style={{ fontSize: '18px' }}>UV-index</span>
        <div style={{ width: '60px' }}></div>
      </div>

      <div className="flex-col flex-center" style={{ textAlign: 'center', gap: '8px' }}>
        <h1 className="text-3xl font-bold">{riskLevel}</h1>
        <p className="text-muted text-md">Aktuellt index: {currentUv.toFixed(1)}</p>
      </div>

      {/* Graf över dagens UV */}
      <div className="surface-card" style={{ height: '220px', padding: '24px 0 0 0', position: 'relative', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8e8e93" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8e8e93" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <ReferenceLine x={nowHour} stroke="#ffffff" strokeDasharray="3 3" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000000', border: '1px solid #333', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#8e8e93' }}
            />
            <Area type="monotone" dataKey="uv" stroke="#8e8e93" strokeWidth={3} fillOpacity={1} fill="url(#uvGradient)" />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="flex-between text-muted text-xs" style={{ position: 'absolute', bottom: '16px', left: '24px', right: '24px' }}>
          <span>{new Date(data.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span>Max {maxUv.toFixed(1)}</span>
          <span>{new Date(data.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      {/* Cirkulärt UV-hjul (Gauge) */}
      <div className="flex-center" style={{ position: 'relative', padding: '20px 0' }} onClick={() => setExpanded(!expanded)}>
        <svg width="280" height="280" viewBox="0 0 280 280">
          <defs>
             <path id="textPathOut" d="M 140 20 a 120 120 0 1 1 -0.1 0" />
          </defs>
          
          {/* Yttre textring */}
          <text fill="#8e8e93" fontSize="12" letterSpacing="6" fontWeight="600">
            <textPath href="#textPathOut" startOffset="5%">
               LOW | MODERATE | HIGH | VERY HIGH | EXTREME
            </textPath>
          </text>

          {/* Bakgrundscirkel */}
          <circle 
            cx="140" cy="140" r={radius} 
            fill="none" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="16" 
          />
          
          {/* Värdecirkel */}
          <circle 
            cx="140" cy="140" r={radius} 
            fill="none" 
            stroke="#8e8e93" 
            strokeWidth="16" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 140 140)"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />

          {/* Mittcirkel bakgrund */}
          <circle cx="140" cy="140" r="90" fill="#050505" />
          
          {/* Inre triangel-pekare på rätt vinkel */}
          <g transform={`rotate(${(currentUv / 11) * 360 - 90} 140 140)`}>
             <polygon points="215,140 235,135 235,145" fill="#ffffff" />
          </g>
        </svg>

        <div className="flex-col flex-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', gap: '4px' }}>
          <span className="text-muted text-sm font-medium">Peak UV</span>
          <span className="text-3xl font-bold" style={{ fontSize: '48px', color: '#ffffff' }}>{currentUv.toFixed(1)}</span>
        </div>
      </div>

      {/* Expandable info */}
      {expanded && (
        <div className="surface-card flex-col" style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="section-header">UV Tidslinje Idag</div>
          <div className="list-item flex-between">
            <span className="text-muted">UV börjar stiga</span>
            <span className="font-semibold">{times.start || '-'}</span>
          </div>
          {times.moderate && (
            <div className="list-item flex-between">
              <span className="text-muted">Måttlig UV (Skydd rekommenderas)</span>
              <span className="font-semibold">{times.moderate}</span>
            </div>
          )}
          <div className="list-item flex-between">
            <span className="text-muted" style={{ color: '#ffffff' }}>Dagens Max ({maxUv})</span>
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
      )}

      {/* Rekommendationer */}
      <div className="surface-card">
        <div className="section-header flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '16px' }}>
          <SunDim size={18} />
          REKOMMENDATIONER
        </div>
        <p className="text-muted" style={{ lineHeight: '1.6' }}>
          {currentUv < 3 && 'Ingen särskild solskyddsåtgärd behövs. Det är säkert att vistas utomhus.'}
          {currentUv >= 3 && currentUv < 6 && 'Använd solskyddsfaktor (SPF 30+) om du vistas utomhus i mer än 30 minuter. Sök skugga mitt på dagen.'}
          {currentUv >= 6 && currentUv < 8 && 'Solskydd krävs. Använd hatt, solglasögon och SPF 30+. Undvik solen mellan klockan 11 och 15.'}
          {currentUv >= 8 && 'Extrem försiktighet krävs! Oskyddad hud bränns mycket snabbt. Stanna i skuggan och använd heltäckande kläder.'}
        </p>
      </div>
    </div>
  );
}

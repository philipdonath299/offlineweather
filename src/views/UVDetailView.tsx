import { useState, useEffect, useRef } from 'react';
import { useWeatherContext } from '../context/WeatherContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Cloud } from 'lucide-react';
import { getWeatherDescription } from '../utils/weatherCodes';

// En egen animerad siffra-komponent som använder requestAnimationFrame för 60fps uppdateringar
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const requestRef = useRef<number>();
  const startValueRef = useRef(value);
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();
    
    const duration = 400; // ms animation för peek

    const animate = (time: number) => {
      if (!startTimeRef.current) return;
      const progress = Math.min((time - startTimeRef.current) / duration, 1);
      
      // Easing: spring-liknande mjuk inbromsning (easeOutExpo)
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
  const peakTime = new Date(peakUvItem?.time || '').getHours().toString().padStart(2, '0') + ':00';

  // Aktuell tid (endast timme för enklare matchning på kurvan)
  const currentHour = new Date().getHours();
  
  // Värde att visa (aktuellt vs peak)
  const displayUv = isPeeking ? maxUv : currentUv;


  // Rubriken översatt tillbaka till svenska för enhetlighet (eller engelska om det var så i bilden)
  // Vi kör engelska i rubriken för att matcha bilden "NO UV" / "MODERATE" om så önskas, 
  // men appen är på svenska. Vi använder svensk översättning av referensens rubriker.
  let headerTitle = 'LÅG';
  if (currentUv >= 3) headerTitle = 'MÅTTLIG';
  if (currentUv >= 6) headerTitle = 'HÖG';
  if (currentUv >= 8) headerTitle = 'MYCKET HÖG';
  if (currentUv >= 11) headerTitle = 'EXTREM';
  if (currentUv === 0) headerTitle = 'INGEN UV';

  const weatherDesc = getWeatherDescription(data.current.weatherCode);

  // SVG Gauge Beräkningar
  const radius = 135; // Något större för att matcha referensen
  const circumference = 2 * Math.PI * radius;
  const uvPercentage = Math.min((displayUv / 11) * 100, 100);

  // För kurvan: bygger en egen SVG-kurva för att ha full kontroll över utseendet.
  // Vi mappar 24 timmar till en bredd på 100% (använder viewBox 0 0 400 120).
  const graphWidth = 400;
  const graphHeight = 120;
  const maxUvInGraph = Math.max(11, maxUv + 1); // Skala så att kurvan får plats
  
  // Skapa en path för arean och linjen
  const points = todaysData.map((item, i) => {
    const x = (i / 23) * graphWidth;
    const y = graphHeight - (item.uv / maxUvInGraph) * graphHeight;
    return `${x},${y}`;
  });
  
  // Enkel spline/smooth line (för detta räcker en polyline om vi har många punkter, men för mjukhet gör vi Bezier curves)
  const linePath = points.length > 0 
    ? `M ${points[0]} ` + points.slice(1).map((p) => {
        // Enkel smoothing: dra linjer. (Vi har 24 punkter, det blir rätt mjukt)
        return `L ${p}`;
      }).join(' ')
    : '';
    
  const areaPath = linePath ? `${linePath} L ${graphWidth},${graphHeight} L 0,${graphHeight} Z` : '';

  // Soluppgång / nedgång markeringar
  const sunriseHour = new Date(data.daily.sunrise[0]).getHours();
  const sunsetHour = new Date(data.daily.sunset[0]).getHours();
  
  const sunriseX = (sunriseHour / 23) * graphWidth;
  const sunsetX = (sunsetHour / 23) * graphWidth;
  const currentY = graphHeight - (currentUv / maxUvInGraph) * graphHeight;

  // Animation handlers
  const handlePointerDown = () => setIsPeeking(true);
  const handlePointerUp = () => setIsPeeking(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '40px', minHeight: '100vh', backgroundColor: '#000000', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Navigation */}
      <div className="flex-between" style={{ padding: '16px' }}>
        <button onClick={() => navigate(-1)} className="flex-center" style={{ gap: '8px' }}>
          <ArrowLeft size={20} className="text-muted" />
        </button>
      </div>

      {/* 1-3. Rubrik, Beskrivning, Plats */}
      <div className="flex-col flex-center" style={{ textAlign: 'center', marginTop: '10px', gap: '6px', position: 'relative', zIndex: 10 }}>
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

      {/* 4. UV-Kurvan (Custom SVG) */}
      <div style={{ width: '100%', height: '140px', position: 'relative', marginTop: '40px' }}>
        
        {/* Peek Bubbla över grafen */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: `translateX(-50%) scale(${isPeeking ? 1 : 0.8})`,
          opacity: isPeeking ? 1 : 0,
          backgroundColor: 'rgba(50, 50, 50, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 20,
          pointerEvents: 'none'
        }}>
          <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '16px' }}>UV {maxUv.toFixed(1)}</span>
          <span style={{ color: '#ffffff', opacity: 0.8, fontSize: '14px' }}>{peakTime}</span>
        </div>

        <svg width="100%" height="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Curve Line */}
          <path d={linePath} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Baseline */}
          <line x1="0" y1={graphHeight} x2={graphWidth} y2={graphHeight} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          
          {/* Ticks & Labels */}
          {/* Sunrise */}
          <line x1={sunriseX} y1={graphHeight - 4} x2={sunriseX} y2={graphHeight + 4} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          <text x={sunriseX} y={graphHeight + 15} fill="rgba(255,255,255,0.8)" fontSize="10" textAnchor="middle">
             {new Date(data.daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </text>

          {/* Peak / Middle (approx) */}
          <line x1={graphWidth/2} y1={graphHeight - 4} x2={graphWidth/2} y2={graphHeight + 4} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          <text x={graphWidth/2} y={graphHeight + 15} fill="rgba(255,255,255,0.8)" fontSize="10" textAnchor="middle">
             12:00
          </text>

          {/* Sunset */}
          <line x1={sunsetX} y1={graphHeight - 4} x2={sunsetX} y2={graphHeight + 4} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
          <text x={sunsetX} y={graphHeight + 15} fill="rgba(255,255,255,0.8)" fontSize="10" textAnchor="middle">
             {new Date(data.daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </text>
        </svg>

        {/* Current Time Icon overlay (Cloud/Sun) */}
        <div style={{
          position: 'absolute',
          left: `${(currentHour / 23) * 100}%`,
          top: `calc(${currentY}px - 14px)`,
          transform: 'translateX(-50%)',
          backgroundColor: '#000000',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          padding: '2px'
        }}>
          <Cloud size={24} color="#ffffff" fill="#ffffff" />
        </div>
      </div>

      {/* 5. UV-hjulet (Mekanisk Dial) */}
      <div 
        className="flex-center" 
        style={{ 
          position: 'relative', 
          flex: 1,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'none' // Förhindra scroll när vi håller in
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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

        {/* 6. Mitteninformation (Fast) */}
        <div className="flex-col flex-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', gap: '0px', pointerEvents: 'none' }}>
          <span className="text-muted font-medium" style={{ fontSize: '18px', opacity: isPeeking ? 1 : 0, transition: 'opacity 0.3s', height: isPeeking ? 'auto' : '0', overflow: 'hidden' }}>
            Peak UV
          </span>
          <span className="font-bold" style={{ fontSize: '84px', color: '#ffffff', letterSpacing: '-3px', lineHeight: '1.1' }}>
            <AnimatedNumber value={displayUv} />
          </span>
          <span className="text-muted font-medium" style={{ fontSize: '16px', marginTop: '4px', opacity: isPeeking ? 0 : 1, transition: 'opacity 0.3s' }}>
            Aktuellt UV
          </span>
        </div>
      </div>

    </div>
  );
}

import { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { searchLocation, reverseGeocode } from '../services/api';
import { LocationSearchResult } from '../types/weather';
import { db } from '../services/db';
import { useWeatherContext } from '../context/WeatherContext';

interface LocationSearchProps {
  onSelectLocation: (loc: LocationSearchResult) => void;
}

export default function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [savedLocations, setSavedLocations] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(true); // Default true since it's an overlay now
  const { setShowSearch } = useWeatherContext();

  useEffect(() => {
    db.getSavedLocations().then(setSavedLocations);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setIsSearching(true);
        const data = await searchLocation(query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = async (loc: LocationSearchResult) => {
    const isSaved = savedLocations.some(s => s.id === loc.id);
    if (!isSaved) {
      const newSaved = [loc, ...savedLocations].slice(0, 5);
      await db.saveLocations(newSaved);
      setSavedLocations(newSaved);
    }
    
    setQuery('');
    setShowDropdown(false);
    onSelectLocation(loc);
  };

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const cityName = await reverseGeocode(latitude, longitude);
          const loc: LocationSearchResult = {
            id: 0,
            name: cityName,
            latitude,
            longitude,
            country: '',
          };
          onSelectLocation(loc);
          setShowDropdown(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Kunde inte hämta din nuvarande plats.");
        }
      );
    }
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 90,
          backdropFilter: 'blur(2px)'
        }}
        onClick={() => setShowSearch(false)}
      />
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '16px',
        right: '16px',
        zIndex: 100,
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div className="flex-center" style={{ gap: '12px' }}>
          <div className="input-container" style={{ flex: 1, backgroundColor: 'var(--surface-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Search size={18} className="text-muted" style={{ marginRight: '12px' }} />
            <input
              autoFocus
              type="text"
              placeholder="Sök plats..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); }}>
                <X size={18} className="text-muted" />
              </button>
            )}
          </div>
          <button 
            onClick={handleCurrentLocation} 
            className="btn-icon" 
            style={{ backgroundColor: 'var(--surface-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <MapPin size={18} className="text-muted" />
          </button>
        </div>

        {showDropdown && (query.length > 2 || savedLocations.length > 0) && (
          <div className="surface-card" style={{ marginTop: '8px', maxHeight: '300px', overflowY: 'auto', padding: '0 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            {query.length > 2 ? (
              <>
                {isSearching ? (
                  <div className="list-item text-muted">Söker...</div>
                ) : results.length > 0 ? (
                  results.map(res => (
                    <button 
                      key={res.id}
                      onClick={() => handleSelect(res)}
                      className="list-item"
                      style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      <span className="font-medium text-md">{res.name}</span>
                      <span className="text-xs text-muted">{res.admin1 ? `${res.admin1}, ` : ''}{res.country}</span>
                    </button>
                  ))
                ) : (
                  <div className="list-item text-muted">Inga resultat hittades</div>
                )}
              </>
            ) : (
              <>
                <div className="section-header" style={{ marginTop: '16px' }}>Senaste platser</div>
                {savedLocations.map(res => (
                  <button 
                    key={res.id}
                    onClick={() => handleSelect(res)}
                    className="list-item"
                    style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <MapPin size={16} className="text-muted" />
                    <span className="font-medium">{res.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

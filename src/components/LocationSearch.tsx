import { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { searchLocation } from '../services/api';
import { LocationSearchResult } from '../types/weather';
import { db } from '../services/db';

interface LocationSearchProps {
  onSelectLocation: (loc: LocationSearchResult) => void;
}

export default function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [savedLocations, setSavedLocations] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
    // Spara till favoriter om den inte redan finns
    const isSaved = savedLocations.some(s => s.id === loc.id);
    if (!isSaved) {
      const newSaved = [loc, ...savedLocations].slice(0, 5); // Spara max 5 senaste
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
          const loc: LocationSearchResult = {
            id: 0,
            name: 'Nuvarande plats',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
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
    <div style={{ position: 'relative', zIndex: 50 }}>
      <div className="flex-center" style={{ gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} className="text-muted" style={{ position: 'absolute', left: '16px', top: '12px' }} />
          <input
            type="text"
            placeholder="Sök stad eller plats..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            style={{ paddingLeft: '48px' }}
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setResults([]); }}
              style={{ position: 'absolute', right: '16px', top: '12px' }}
            >
              <X size={20} className="text-muted" />
            </button>
          )}
        </div>
        <button onClick={handleCurrentLocation} className="glass-panel" style={{ padding: '12px' }}>
          <MapPin size={20} />
        </button>
      </div>

      {showDropdown && (query.length > 2 || savedLocations.length > 0) && (
        <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', padding: '8px 0', maxHeight: '300px', overflowY: 'auto' }}>
          {query.length > 2 ? (
            <>
              {isSearching ? (
                <div style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Söker...</div>
              ) : results.length > 0 ? (
                results.map(res => (
                  <button 
                    key={res.id}
                    onClick={() => handleSelect(res)}
                    style={{ width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', flexDirection: 'column' }}
                  >
                    <span className="font-medium">{res.name}</span>
                    <span className="text-sm text-muted">{res.admin1 ? `${res.admin1}, ` : ''}{res.country}</span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Inga resultat hittades</div>
              )}
            </>
          ) : (
            <>
              <div style={{ padding: '8px 16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px' }}>Senaste platser</div>
              {savedLocations.map(res => (
                <button 
                  key={res.id}
                  onClick={() => handleSelect(res)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}
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
  );
}

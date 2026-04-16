import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface CitySearchProps {
  onSelect: (lat: number, lon: number) => void;
}

export function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);

  const search = useDebouncedCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=br`,
      { headers: { 'Accept-Language': 'pt-BR' } },
    );
    const data = (await res.json()) as NominatimResult[];
    setResults(data);
    setOpen(data.length > 0);
  }, 300);

  function handleSelect(r: NominatimResult) {
    onSelect(parseFloat(r.lat), parseFloat(r.lon));
    setResults([]);
    setOpen(false);
    setQuery(r.display_name.split(',')[0]);
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar cidade..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          void search(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
          if (e.key === 'Escape') { setOpen(false); setResults([]); }
        }}
        className="px-3 py-1.5 text-xs outline-none w-48"
        style={{
          color: '#f3f4f6',
          backgroundColor: '#1a1a1a',
          border: '2px solid #374151',
          borderRadius: '4px',
        }}
        aria-label="Buscar cidade"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && results.length > 0 && (
        <ul
          className="absolute top-full left-0 z-[1001] w-64"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #374151', borderRadius: '4px' }}
          role="listbox"
        >
          {results.map((r, i) => (
            <li key={i} role="option" aria-selected={false}>
              <button
                className="w-full text-left px-3 py-1.5 text-xs"
                style={{ color: '#f3f4f6', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => handleSelect(r)}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

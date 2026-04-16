const FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Bandas', value: 'band' },
  { label: 'Venues', value: 'venue' },
  { label: 'Produtores', value: 'producer' },
] as const;

interface MapFiltersProps {
  active: string;
  onChange: (value: string) => void;
}

export function MapFilters({ active, onChange }: MapFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtrar por tipo">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          aria-pressed={active === f.value}
          className="px-3 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2"
          style={{
            color: active === f.value ? '#0D0D0D' : '#F2CF1D',
            backgroundColor: active === f.value ? '#F2CF1D' : '#1a1a1a',
            border: '2px solid #F2CF1D',
            outlineColor: '#F2CF1D',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

# Story 4.3: Filtros e Navegação do Mapa

Status: review

## Story

Como usuário,
Quero filtrar pins por tipo de entidade e navegar livremente no mapa,
Para que eu foque minha descoberta em tipos específicos de entidades ou localizações.

---

## Acceptance Criteria

**AC1 — Filtro por tipo**
- Given o mapa está carregado com pins de bandas, venues e produtores
- When seleciono o filtro "Bandas"
- Then apenas pins de `profile_type: 'band'` são visíveis; demais são ocultados sem recarregar a página

**AC2 — Filtro "Todos"**
- Given um filtro de tipo está ativo
- When seleciono "Todos"
- Then todos os pins visíveis são exibidos novamente

**AC3 — Busca por cidade**
- Given digito o nome de uma cidade no campo de busca
- When pressiono Enter ou seleciono a sugestão da lista
- Then o mapa faz pan e zoom para as coordenadas daquela cidade (usando Nominatim/OpenStreetMap geocoding)

**AC4 — Sugestões de cidade**
- Given digito pelo menos 3 caracteres no campo de busca
- When o Nominatim retorna resultados
- Then uma lista dropdown de até 5 sugestões de cidades é exibida

**AC5 — Clusters se desfazem com zoom**
- Given há clusters de pins agrupados
- When faço zoom in suficiente para separar os pins
- Then os clusters se quebram em pins individuais (comportamento nativo do MarkerClusterGroup)

**AC6 — Filtros acessíveis por teclado**
- Given navego pelo teclado (Tab entre botões de filtro)
- When pressiono Enter em um botão de filtro
- Then o filtro é aplicado com estado de foco visível (outline `#F2CF1D`)

**AC7 — Estado de loading ao trocar filtro**
- Given troco o filtro de tipo
- When `useMapPins` refetch está em andamento
- Then um indicador de loading sutil (spinner pequeno ou pulsação nos pins) é exibido

---

## Technical Context

### Stack

- `useMapPins` (Story 4.1) aceita `filters: { profile_type?, city? }` — reutilizar diretamente
- Leaflet `useMap()` hook — para fazer `map.flyTo(coords, zoom)` programaticamente
- Nominatim geocoding API — gratuito, sem API key, baseado no OpenStreetMap

### Estratégia de filtro: client-side vs server-side

O filtro por `profile_type` pode ser feito **client-side** (filtrar o array em memória) ou **server-side** (novo query com param).

**Recomendação: client-side para profile_type, server-side para city.**

```typescript
// Client-side filter (sem nova chamada):
const { data: allPins } = useMapPins(); // busca todos
const filteredPins = useMemo(() =>
  activeFilter === 'all' ? allPins : allPins?.filter(p => p.profile_type === activeFilter),
  [allPins, activeFilter]
);
```

Isso evita refetch ao trocar filtro de tipo e mantém o cache quente.

### Componente MapFilters

Criar `src/features/app/map/components/MapFilters.tsx`:

```typescript
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
    <div className="flex gap-2" role="group" aria-label="Filtrar por tipo">
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          aria-pressed={active === f.value}
          className="px-3 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2"
          style={{
            color: active === f.value ? '#0D0D0D' : '#F2CF1D',
            backgroundColor: active === f.value ? '#F2CF1D' : 'transparent',
            border: '2px solid #F2CF1D',
            outlineColor: '#F2CF1D',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
```

### Componente CitySearch (Nominatim)

Criar `src/features/app/map/components/CitySearch.tsx`:

```typescript
// Usa https://nominatim.openstreetmap.org/search?q=<query>&format=json&limit=5&countrycodes=br
// Debounce de 300ms para evitar rate limiting do Nominatim (policy: 1 req/s)
// Exibir max 5 sugestões com nome + país

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export function CitySearch({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);

  const search = useDebouncedCallback(async (q: string) => {
    if (q.length < 3) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=br`
    );
    const data = await res.json() as NominatimResult[];
    setResults(data);
  }, 300);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar cidade..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); void search(e.target.value); }}
        className="px-3 py-1.5 text-xs bg-transparent outline-none w-48"
        style={{ color: '#f3f4f6', border: '2px solid #374151' }}
      />
      {results.length > 0 && (
        <ul className="absolute top-full left-0 z-[1001] w-full" style={{ backgroundColor: '#1a1a1a', border: '1px solid #374151' }}>
          {results.map((r, i) => (
            <li key={i}>
              <button
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-800"
                style={{ color: '#f3f4f6' }}
                onClick={() => {
                  onSelect(parseFloat(r.lat), parseFloat(r.lon));
                  setResults([]);
                  setQuery(r.display_name.split(',')[0]);
                }}
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
```

**Nominatim rate limiting**: máximo 1 req/s — o debounce de 300ms com `countrycodes=br` é suficiente para uso normal. Não usar em produção para volume alto (considerar cache futuro).

### MapFlyTo — helper interno

Criar `src/features/app/map/components/MapFlyTo.tsx` (componente filho dentro do MapContainer para acessar `useMap`):

```typescript
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

interface MapFlyToProps {
  lat: number | null;
  lon: number | null;
}

export function MapFlyTo({ lat, lon }: MapFlyToProps) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lon !== null) {
      map.flyTo([lat, lon], 13, { animate: true, duration: 1 });
    }
  }, [map, lat, lon]);
  return null;
}
```

### Barra de controles sobreposta ao mapa

Posicionar os controles (filtros + busca) em overlay **acima** do mapa, alinhados no topo esquerdo, com `position: absolute`, `z-index: 1000`.

```typescript
// Em MapPage.tsx — dentro do container relative:
<div
  className="absolute top-3 left-3 z-[1000] flex gap-2 flex-wrap"
  style={{ pointerEvents: 'auto' }}
>
  <MapFilters active={activeFilter} onChange={setActiveFilter} />
  <CitySearch onSelect={(lat, lon) => setFlyTo({ lat, lon })} />
</div>

// Dentro do MapContainer:
<MapFlyTo lat={flyTo?.lat ?? null} lon={flyTo?.lon ?? null} />
```

### Instalar useDebouncedCallback

```bash
npm install use-debounce
```

Ou usar `useCallback` com `setTimeout` manual se preferir sem dependência extra. `use-debounce` é leve (< 1KB).

### Estrutura de arquivos a criar

```
src/features/app/map/
  components/
    MapFilters.tsx       ← novo
    CitySearch.tsx       ← novo
    MapFlyTo.tsx         ← novo
  MapPage.tsx            ← modificar (adicionar activeFilter state, controles overlay, flyTo)
```

---

## Dependencies

- **Bloqueante:** Story 4.1 (Mapa Base com Pins) — precisa do `useMapPins`, `MapPin[]` e `MapContainer` já montado
- **Reutiliza:** `useMapPins` com filtros (Story 4.1), clustering (Story 4.1)
- **Alimenta:** Story 4.4 (o mapa reutiliza os controles de filtro)

---

## Dev Notes

- Nominatim tem política de uso: max 1 req/s, identificar com User-Agent descritivo, não fazer scraping massivo — o debounce + `countrycodes=br` atendem o uso esperado no MVP
- `useMap()` só funciona dentro de um filho de `<MapContainer>` — por isso `MapFlyTo` é um componente separado montado dentro do container
- Filtro client-side evita loading ao trocar tipo — mas toda a lista de pins já está em cache via TanStack Query, então é rápido e sem flicker
- Se a lista de pins for muito grande (> 2000), considerar filtro server-side no futuro — para o MVP com 500 usuários, client-side é suficiente
- Acessibilidade: botões de filtro usam `aria-pressed` para indicar estado ativo ao screen reader

---

## Dev Agent Record

### Completion Notes (2026-04-16)

- `use-debounce` instalado (10.1.1) — `useDebouncedCallback` 300ms no CitySearch
- Filtro por tipo: client-side via `useMemo` sobre `allPins` — sem refetch ao trocar filtro (AC1/AC2/AC7)
- `CitySearch`: Nominatim `countrycodes=br`, debounce 300ms, Enter aplica primeira sugestão, Escape fecha lista, `aria-autocomplete` + `aria-expanded` (AC3/AC4/AC6)
- `MapFlyTo`: componente filho dentro do `MapContainer` usando `useMap()` — `flyTo([lat,lon], 13)` (AC3)
- AC5 (clusters com zoom): comportamento nativo do `MarkerClusterGroup` — já funciona da Story 4.1
- Barra de controles posicionada `absolute top-3 left-3 z-[1000]` sobre o mapa

## File List

- `src/features/app/map/components/MapFilters.tsx` — novo
- `src/features/app/map/components/CitySearch.tsx` — novo
- `src/features/app/map/components/MapFlyTo.tsx` — novo
- `src/features/app/map/MapPage.tsx` — modificado (activeFilter, flyTo state, controles overlay)
- `package.json` — `use-debounce` adicionado

## Change Log

- 2026-04-16: Story 4.3 implementada — filtros client-side, busca Nominatim com debounce, flyTo via MapFlyTo

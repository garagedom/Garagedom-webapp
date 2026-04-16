# Story 4.1: Mapa Base com Pins

Status: review

## Story

Como usuário autenticado,
Quero visualizar um mapa interativo com pins de todas as entidades visíveis,
Para que eu descubra bandas, venues e produtores próximos ou em cidades-alvo.

---

## Acceptance Criteria

**AC1 — Mapa Leaflet renderiza**
- Given navego para `/app/map`
- When o componente carrega via `React.lazy`
- Then o mapa Leaflet renderiza com tiles OpenStreetMap e view inicial centrada em São Paulo (-23.55, -46.63, zoom 12)

**AC2 — Pins carregam da API**
- Given o mapa está montado
- When `GET /api/v1/map/pins` retorna com sucesso
- Then pins aparecem no mapa em menos de 1s após o mapa estar pronto

**AC3 — Pin com logo**
- Given um pin tem `logo_url` não-nula
- When o pin é renderizado como `DivIcon`
- Then a imagem da logo é exibida dentro do marcador (32×32px, borda `#F2CF1D`)

**AC4 — Pin sem logo (fallback)**
- Given um pin tem `logo_url: null`
- When o pin é renderizado
- Then o `ProfileAvatar` com iniciais e cor determinística é exibido no lugar (mesmo componente usado nos perfis)

**AC5 — Clustering acima de 200 pins**
- Given mais de 200 pins estão na área visível
- When o mapa renderiza
- Then pins são agrupados via `leaflet.markercluster` com badge de contagem; pins individuais visíveis ao dar zoom

**AC6 — Estado de loading**
- Given `GET /api/v1/map/pins` está em andamento
- When o mapa ainda não tem dados
- Then spinner centralizado é exibido sobre o mapa

**AC7 — Estado de erro**
- Given `GET /api/v1/map/pins` retorna erro
- When a resposta chega
- Then mensagem "Erro ao carregar pins. Tente novamente." é exibida com botão de retry

**AC8 — Lazy loading do bundle Leaflet**
- Given o app carrega na rota `/`
- When o Network tab é inspecionado
- Then `leaflet` e `react-leaflet` NÃO estão no bundle inicial (verificável via code splitting)

---

## Technical Context

### Stack e dependências já instaladas

- `react-leaflet` v5 + `leaflet` 1.9.4 — já no `package.json`
- `@rails/actioncable` — já instalado (usado na Story 4.4)
- `ProfileAvatar` — já em `src/components/ProfileAvatar.tsx`
- `Navigation` — já em `src/components/Navigation/Navigation.tsx`
- `useAuthStore` — já em `src/stores/authStore.ts` (campos: `user.id`, `user.profileId`, `user.profileType`)

### Instalar dependência de clustering

`leaflet.markercluster` **não está instalado**. Instalar antes de implementar:

```bash
npm install leaflet.markercluster @types/leaflet.markercluster
```

### API Contract

```
GET /api/v1/map/pins
Authorization: Bearer <token>
Query params opcionais: profile_type, city

Response 200:
[
  {
    "id": 1,
    "name": "Banda X",
    "profile_type": "band",
    "latitude": -23.18,
    "longitude": -46.89,
    "city": "Jundiaí",
    "music_genre": "Rock",
    "logo_url": "https://cdn.example.com/logos/1.png"  // ou null
  }
]

Response 401: { "error": "...", "code": "..." }
```

**Nota**: `logo_url`, `music_genre` e `city` são adicionados pelo backend na Story 2-6. O frontend deve estar preparado para receber `null` em qualquer um desses campos.

### Zod schema para MapPin

Criar `src/lib/schemas/mapSchema.ts`:

```typescript
import { z } from 'zod';

export const mapPinSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_type: z.enum(['band', 'venue', 'producer']),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().nullable(),
  music_genre: z.string().nullable(),
  logo_url: z.string().nullable(),
});

export type MapPin = z.infer<typeof mapPinSchema>;
export const mapPinsSchema = z.array(mapPinSchema);
```

### Hook useMapPins

Criar `src/features/app/map/hooks/useMapPins.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { mapPinsSchema, type MapPin } from '@/lib/schemas/mapSchema';

interface MapFilters {
  profile_type?: string;
  city?: string;
}

export function useMapPins(filters: MapFilters = {}) {
  return useQuery({
    queryKey: ['map-pins', filters],
    queryFn: async (): Promise<MapPin[]> => {
      const { data } = await apiClient.get('/api/v1/map/pins', { params: filters });
      return mapPinsSchema.parse(data);
    },
    staleTime: 30_000,
  });
}
```

### Componente PinMarker (DivIcon)

Criar `src/features/app/map/components/PinMarker.tsx`:

```typescript
import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker } from 'react-leaflet';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import type { MapPin } from '@/lib/schemas/mapSchema';

function createPinIcon(pin: MapPin) {
  const html = renderToStaticMarkup(
    <div style={{ width: 40, height: 40, border: '2px solid #F2CF1D', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
      <ProfileAvatar name={pin.name} logoUrl={pin.logo_url} size="sm" />
    </div>
  );
  return divIcon({ html, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
}

interface PinMarkerProps {
  pin: MapPin;
  onClick: (pin: MapPin) => void;
}

export function PinMarker({ pin, onClick }: PinMarkerProps) {
  return (
    <Marker
      position={[pin.latitude, pin.longitude]}
      icon={createPinIcon(pin)}
      eventHandlers={{ click: () => onClick(pin) }}
    />
  );
}
```

### MapPage — estrutura

```typescript
// src/features/app/map/MapPage.tsx
// Leaflet CSS: importar no topo ou em index.css: import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet';
import { Navigation } from '@/components/Navigation/Navigation';
import { useMapPins } from './hooks/useMapPins';
import { PinMarker } from './components/PinMarker';

export default function MapPage() {
  const { data: pins, isLoading, isError, refetch } = useMapPins();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      <Navigation />
      <main className="flex-1 relative">
        {isLoading && <LoadingOverlay />}
        {isError && <ErrorOverlay onRetry={() => void refetch()} />}
        <MapContainer
          center={[-23.55, -46.63]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pins?.map(pin => (
            <PinMarker key={pin.id} pin={pin} onClick={(p) => setSelectedPin(p)} />
          ))}
        </MapContainer>
      </main>
    </div>
  );
}
```

**CSS Leaflet**: Adicionar `import 'leaflet/dist/leaflet.css'` em `src/index.css` ou no topo de `MapPage.tsx`.

### Clustering com leaflet.markercluster

```typescript
import MarkerClusterGroup from 'react-leaflet-cluster'; // wrapper para react-leaflet v5
// OU usar MarkerClusterGroup direto com leaflet.markercluster — verificar compatibilidade com react-leaflet v5
```

**Atenção**: `react-leaflet-cluster` é o wrapper recomendado para react-leaflet v5. Avaliar se `npm install react-leaflet-cluster` é mais simples que integrar `leaflet.markercluster` direto. Usar o que funcionar com react-leaflet v5 sem conflito.

### Lazy loading (AC8)

`MapPage` já está registrado via `React.lazy` em `src/router/lazyRoutes.tsx`. Leaflet não estará no bundle inicial desde que importado apenas dentro de `MapPage`. Garantir que `import 'leaflet/dist/leaflet.css'` seja importado apenas dentro do módulo de mapa (não em `index.css` global).

### Estrutura de arquivos a criar

```
src/features/app/map/
  MapPage.tsx                          ← reescrever (atualmente placeholder)
  hooks/
    useMapPins.ts                      ← novo
  components/
    PinMarker.tsx                      ← novo
    MapLoadingOverlay.tsx              ← novo (spinner sobre o mapa)
    MapErrorOverlay.tsx                ← novo (erro + botão retry)
src/lib/schemas/
  mapSchema.ts                         ← novo
```

---

## Dependencies

- **Bloqueante backend:** Story 2-6 (enriquecer MapPinSerializer) — `logo_url`, `music_genre`, `city` precisam estar no payload do backend
- **Reutiliza:** `ProfileAvatar` (Story 3.2), `Navigation` (Story 2.6), `apiClient` (Story 1.2), `useAuthStore` (Story 1.2)
- **Alimenta:** Story 4.2 (card de perfil ao clicar no pin), Story 4.3 (filtros), Story 4.4 (pin próprio em tempo real)

---

## Dev Notes

- `MapPage.tsx` atualmente tem um placeholder ("Mapa em breve") com `DeleteAccountModal` — o botão de excluir conta deve ser **removido** e movido para uma futura página de configurações
- Leaflet precisa de CSS carregado para renderizar corretamente — ausência do CSS causa mapa em branco
- `renderToStaticMarkup` para `DivIcon` funciona no React 19 mas pode gerar warnings de hydration — é seguro ignorar neste contexto (não há SSR)
- O mapa usa 100% da altura disponível após a Navigation — garantir `height: calc(100vh - <nav-height>)` ou usar `flex-1` com `height: 100%` no container
- Não usar `useEffect` para buscar pins — usar `useQuery` que gerencia cache, loading e erro automaticamente

---

## Dev Agent Record

### Implementation Notes (2026-04-16)

**Dependências instaladas:**
- `leaflet.markercluster` + `@types/leaflet.markercluster` + `react-leaflet-cluster` (wrapper react-leaflet v5)
- `vitest` + `@testing-library/react` + `@testing-library/jest-dom` (framework de testes — aprovado pelo usuário)

**Decisões técnicas:**
- Usado `react-leaflet-cluster` v4.1.3 como wrapper para `react-leaflet` v5 (mais simples que integrar `leaflet.markercluster` direto)
- CSS do Leaflet importado no topo de `MapPage.tsx` (não em `index.css` global) → garante code-splitting (AC8 confirmado pelo build)
- `defineConfig` substituído por `vitest/config` no `vite.config.ts` para suporte ao campo `test`
- `_selectedPin` state mantido no `MapPage` preparado para Story 4.2 (card de perfil)
- Botão "Excluir minha conta" removido do MapPage conforme Dev Notes

**Build validation (AC8):**
- `MapPage-*.js` chunk separado: 378kb (leaflet isolado do bundle inicial ✅)
- `MapPage-*.css` chunk separado: 16.7kb (CSS leaflet isolado ✅)

### Completion Notes

Todos os ACs implementados:
- AC1: MapContainer centrado em SP (-23.55, -46.63, zoom 12) com TileLayer OpenStreetMap
- AC2: `useMapPins` com `useQuery` + `apiClient` — carrega pins de `GET /api/v1/map/pins`
- AC3: `PinMarker` com `DivIcon` usando `renderToStaticMarkup` + borda `#F2CF1D`
- AC4: `ProfileAvatar` como fallback quando `logo_url` é null
- AC5: `MarkerClusterGroup` (react-leaflet-cluster) envolve todos os pins
- AC6: `MapLoadingOverlay` com spinner animado sobre o mapa
- AC7: `MapErrorOverlay` com mensagem e botão de retry
- AC8: Leaflet em chunk separado confirmado via `npm run build`

---

## File List

- `src/features/app/map/MapPage.tsx` — reescrito
- `src/features/app/map/hooks/useMapPins.ts` — novo
- `src/features/app/map/components/PinMarker.tsx` — novo
- `src/features/app/map/components/MapLoadingOverlay.tsx` — novo
- `src/features/app/map/components/MapErrorOverlay.tsx` — novo
- `src/lib/schemas/mapSchema.ts` — novo
- `src/lib/schemas/__tests__/mapSchema.test.ts` — novo
- `src/features/app/map/__tests__/useMapPins.test.ts` — novo
- `src/test/setup.ts` — novo
- `vite.config.ts` — configuração Vitest adicionada
- `tsconfig.app.json` — tipos `vitest/globals` adicionados
- `package.json` — scripts `test`, `test:watch`, `test:coverage` + dependências

---

## Change Log

- 2026-04-16: Story 4.1 implementada — mapa Leaflet com pins, clustering, loading/error states, lazy loading confirmado

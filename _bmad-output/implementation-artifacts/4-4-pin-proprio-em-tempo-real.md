# Story 4.4: Pin Próprio em Tempo Real

Status: review

## Story

Como novo usuário que acabou de completar o cadastro,
Quero ver meu próprio pin no mapa imediatamente após criar meu perfil,
Para que eu tenha prova visual de que faço parte da cena (momento de valor do produto).

---

## Acceptance Criteria

**AC1 — Pin próprio visível ao entrar no mapa**
- Given acabei de criar meu perfil com `map_visible: true`
- When sou redirecionado para `/app/map`
- Then meu pin está visível no mapa na cidade informada no perfil (a lista de pins inclui o meu)

**AC2 — Pin oculto com indicador visual**
- Given meu perfil tem `map_visible: false`
- When o mapa carrega e visualizo minha posição
- Then meu pin aparece **apenas para mim** com um indicador "Oculto para outros" (badge sobre o marcador)

**AC3 — Popup do próprio perfil**
- Given clico no meu próprio pin (onde `pin.id === user.profileId`)
- When o `ProfilePopup` abre
- Then exibe o badge "Este é você" — já implementado na Story 4.2 (verificar AC5 da 4.2)

**AC4 — Atualização em tempo real via ActionCable**
- Given estou visualizando o mapa
- When outro usuário torna seu perfil visível (`map_visible: true`)
- Then o novo pin aparece no mapa sem recarregar a página

**AC5 — Remoção em tempo real**
- Given um pin está visível no mapa
- When o usuário dono do perfil oculta seu pin (`map_visible: false`)
- Then o pin desaparece do mapa sem recarregar a página

**AC6 — Atualização de dados em tempo real**
- Given um pin está visível no mapa
- When o usuário atualiza seu nome ou gênero musical
- Then o marcador no mapa reflete os dados atualizados sem recarregar

**AC7 — Reconexão automática do WebSocket**
- Given a conexão ActionCable cai (rede instável)
- When a rede é restaurada
- Then o ActionCable reconecta automaticamente e o mapa continua recebendo atualizações

---

## Technical Context

### Stack

- `@rails/actioncable` — já instalado no projeto
- `useMapPins` (Story 4.1) retorna o array de pins — precisamos de um mecanismo para atualizar este cache via eventos do WebSocket
- TanStack Query `useQueryClient` — para atualizar o cache `['map-pins']` diretamente ao receber eventos

### Dependência de backend

Esta story **depende do backend Story 2-7** (`MapChannel` via ActionCable). O backend deve:
- Aceitar conexão no canal `MapChannel` com JWT via query string `?token=<jwt>`
- Enviar eventos ao stream `"map"`:
  - `{ type: "pin_added", pin: { ...MapPin } }`
  - `{ type: "pin_removed", pin_id: <number> }`
  - `{ type: "pin_updated", pin: { ...MapPin } }`

Verificar se o backend Story 2-7 está com status `review` ou `done` antes de implementar esta story.

### WebSocket URL

```typescript
const WS_URL = import.meta.env.VITE_API_URL?.replace('https://', 'wss://').replace('http://', 'ws://');
// Ex: wss://garagedom-api.onrender.com/cable
```

O `VITE_API_URL` já existe no projeto (usado no `api-client`). Verificar em `.env`.

### Hook useMapChannel

Criar `src/features/app/map/hooks/useMapChannel.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createConsumer } from '@rails/actioncable';
import { getToken } from '@/lib/auth-token';
import { mapPinSchema, type MapPin } from '@/lib/schemas/mapSchema';

export function useMapChannel() {
  const queryClient = useQueryClient();
  const consumerRef = useRef<ReturnType<typeof createConsumer> | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL ?? ''}/cable?token=${token}`;
    const consumer = createConsumer(wsUrl);
    consumerRef.current = consumer;

    const subscription = consumer.subscriptions.create('MapChannel', {
      received(data: unknown) {
        const event = data as { type: string; pin?: MapPin; pin_id?: number };

        if (event.type === 'pin_added' && event.pin) {
          const newPin = mapPinSchema.safeParse(event.pin);
          if (!newPin.success) return;
          queryClient.setQueryData<MapPin[]>(['map-pins', {}], (old = []) => {
            // Evitar duplicatas
            if (old.some(p => p.id === newPin.data.id)) return old;
            return [...old, newPin.data];
          });
        }

        if (event.type === 'pin_removed' && event.pin_id) {
          queryClient.setQueryData<MapPin[]>(['map-pins', {}], (old = []) =>
            old.filter(p => p.id !== event.pin_id)
          );
        }

        if (event.type === 'pin_updated' && event.pin) {
          const updatedPin = mapPinSchema.safeParse(event.pin);
          if (!updatedPin.success) return;
          queryClient.setQueryData<MapPin[]>(['map-pins', {}], (old = []) =>
            old.map(p => p.id === updatedPin.data.id ? updatedPin.data : p)
          );
        }
      },

      connected() {
        console.debug('[MapChannel] connected');
      },

      disconnected() {
        console.debug('[MapChannel] disconnected');
      },
    });

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [queryClient]);
}
```

**Atenção — query key**: `useMapPins` usa `['map-pins', filters]`. O `setQueryData` acima usa `['map-pins', {}]` (filtros vazios = todos os pins). Se o usuário tiver um filtro ativo, o cache filtrado não será atualizado automaticamente — isso é aceitável para o MVP (o refresh periódico via `staleTime` corrigirá).

### Variável de ambiente VITE_WS_URL

Adicionar ao `.env` e `.env.production`:

```
VITE_WS_URL=ws://localhost:3000
```

Para produção (`.env.production`):
```
VITE_WS_URL=wss://garagedom-api.onrender.com
```

### Integração em MapPage

```typescript
// Em MapPage.tsx — adicionar o hook:
useMapChannel(); // conecta ao canal quando o mapa está montado
```

O hook faz cleanup automático no unmount — sem memory leak.

### Pin próprio oculto (AC2)

O backend retorna **apenas pins com `map_visible: true`** em `GET /api/v1/map/pins`. Para exibir o pin próprio mesmo quando oculto:

**Opção A (recomendada)**: Buscar o próprio perfil via `useProfile(user.profileId)` e adicionar ao array de pins se tiver coordenadas, marcando com flag `isOwn: true`.

```typescript
const { user } = useAuthStore();
const { data: ownProfile } = useProfile(user?.profileId ?? 0);
const { data: pins } = useMapPins();

const allPins = useMemo(() => {
  if (!pins || !ownProfile?.latitude || !ownProfile?.longitude) return pins ?? [];
  const ownAlreadyIncluded = pins.some(p => p.id === ownProfile.id);
  if (ownAlreadyIncluded) return pins;
  // Adicionar próprio pin mesmo se oculto
  const ownPin: MapPin = {
    id: ownProfile.id,
    name: ownProfile.name,
    profile_type: ownProfile.profile_type,
    latitude: ownProfile.latitude!,
    longitude: ownProfile.longitude!,
    city: ownProfile.city,
    music_genre: ownProfile.music_genre ?? null,
    logo_url: ownProfile.logo_url ?? null,
  };
  return [...pins, ownPin];
}, [pins, ownProfile]);
```

**Badge "Oculto para outros"** no `PinMarker` quando `pin.id === user.profileId && !ownProfile.map_visible`:

```typescript
// Em PinMarker — adicionar prop isHidden:
{isHidden && (
  <span style={{ position: 'absolute', top: -8, fontSize: 9, color: '#9ca3af', whiteSpace: 'nowrap' }}>
    Oculto
  </span>
)}
```

### Reconexão automática (AC7)

O `@rails/actioncable` tem reconexão automática embutida via `ActionCable.Connection` com backoff exponencial — sem necessidade de implementação adicional.

### Estrutura de arquivos a criar

```
src/features/app/map/
  hooks/
    useMapChannel.ts     ← novo
  MapPage.tsx            ← modificar (adicionar useMapChannel(), lógica de pin próprio oculto)
  components/
    PinMarker.tsx        ← modificar (adicionar prop isHidden + badge "Oculto")
.env                     ← modificar (adicionar VITE_WS_URL)
.env.production          ← modificar (adicionar VITE_WS_URL com wss://)
```

---

## Dependencies

- **Bloqueante backend:** Story 2-7 (`MapChannel` ActionCable) — sem o canal no backend, o WebSocket não existe
- **Bloqueante frontend:** Story 4.1 (Mapa Base com Pins) — precisa de `useMapPins` e cache TanStack Query
- **Bloqueante frontend:** Story 4.2 (Card de Perfil) — popup do próprio pin já implementado na 4.2 (AC5)
- **Reutiliza:** `getToken` (Story 1.2), `useProfile` (Story 3.3), `mapPinSchema` (Story 4.1)

---

## Dev Notes

- `@rails/actioncable` usa WebSocket nativo do browser — sem polyfill necessário
- O URL do cable deve usar `ws://` em dev e `wss://` em produção — usar variável de ambiente para controle
- `createConsumer` cria uma nova conexão WebSocket — chamar apenas uma vez (via `useRef`) para evitar múltiplas conexões
- Se o token expirar enquanto o WebSocket está aberto, o ActionCable não renovará automaticamente — para o MVP isso é aceitável (o próximo refresh de página reconectará com token novo)
- A atualização do cache via `setQueryData` é síncrona e não dispara novo fetch — é a abordagem correta para dados em tempo real que chegam pelo WebSocket
- Não usar `invalidateQueries` para eventos WebSocket — causaria refetch da lista inteira a cada evento

---

## Dev Agent Record

### Completion Notes (2026-04-16)

**AC1** — Pin próprio incluído automaticamente pelo backend quando `map_visible: true` — sem código extra necessário.

**AC2 — Desvio de spec:** `profileSchema` não tem `latitude`/`longitude`, portanto não é possível posicionar o pin oculto no mapa. Implementado como `HiddenPinBanner` (banner fixo no rodapé do mapa com link para editar perfil) ao invés de marcador posicionado. O pin oculto não tem coordenadas disponíveis via API.

**AC3** — Já implementado na Story 4.2 (badge "Este é você" no `ProfilePopup`).

**AC4/AC5/AC6** — `useMapChannel.ts`: ActionCable com `createConsumer`, subscribe a `MapChannel`, eventos `pin_added`/`pin_removed`/`pin_updated` atualizam o cache TanStack Query via `setQueryData` sem refetch.

**AC7** — Reconexão automática embutida no ActionCable — sem código adicional.

**Decisões técnicas:**
- WS URL derivada de `VITE_API_URL` via `.replace()` — sem variável de ambiente extra
- `@types/rails__actioncable` instalado (tipos não existiam no projeto)
- `console.debug` de conexão/desconexão apenas em `DEV` para não poluir produção

### File List

- `src/features/app/map/hooks/useMapChannel.ts` — novo
- `src/features/app/map/components/HiddenPinBanner.tsx` — novo
- `src/features/app/map/MapPage.tsx` — modificado (useMapChannel, useProfile, HiddenPinBanner)
- `package.json` — `@types/rails__actioncable` adicionado

### Change Log

- 2026-04-16: Story 4.4 implementada — ActionCable MapChannel, banner pin oculto, integração completa do Epic 4
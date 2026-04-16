# Story 4.2: Card de Perfil no Pin

Status: review

## Story

Como usuário,
Quero clicar em um pin do mapa e ver um resumo do perfil sem sair do mapa,
Para que eu avalie um contato antes de decidir conectar ou propor.

---

## Acceptance Criteria

**AC1 — Card abre ao clicar no pin**
- Given o mapa está carregado com pins visíveis
- When clico em qualquer pin
- Then um `ProfilePopup` aparece com: logo (ou avatar fallback), nome, tipo de perfil, cidade, gênero musical e botões de ação

**AC2 — Botão "Ver Perfil Completo"**
- Given o `ProfilePopup` está aberto
- When visualizo qualquer perfil
- Then o link "Ver Perfil Completo" está visível e navega para `/app/profile/:id`

**AC3 — Botão "Enviar Conexão" para bandas**
- Given estou autenticado como `profile_type: 'band'` e visualizo um pin de outra banda
- When o popup renderiza
- Then o botão "Enviar Conexão" está visível (sem funcionalidade real nesta story — `// TODO: Story 5.1`)

**AC4 — Sem botão de conexão para venue/produtor**
- Given visualizo um pin de venue ou produtor
- When o popup renderiza
- Then o botão "Enviar Conexão" NÃO é exibido (conexões são apenas entre bandas — FR17)

**AC5 — Popup do próprio perfil**
- Given clico no meu próprio pin (onde `pin.id === user.profileId`)
- When o `ProfilePopup` abre
- Then exibe o badge "Este é você" no lugar dos botões de conexão/proposta

**AC6 — Fechar com Escape**
- Given o `ProfilePopup` está aberto
- When pressiono a tecla Escape
- Then o popup fecha e o foco retorna ao pin que estava ativo

**AC7 — Fechar clicando fora**
- Given o `ProfilePopup` está aberto
- When clico fora do popup (no mapa ou em outro pin)
- Then o popup fecha

**AC8 — Skeleton durante loading**
- Given clico em um pin
- When os dados ainda não chegaram (se houver busca adicional)
- Then `AsyncState` com skeleton é exibido dentro do popup

---

## Technical Context

### Stack

- Os dados do pin já estão disponíveis no objeto `MapPin` (vindo de `useMapPins` da Story 4.1) — **não é necessário fazer nova chamada de API** para o popup básico
- `ProfileAvatar` — já em `src/components/ProfileAvatar.tsx`
- `useAuthStore` — para determinar `user.profileId` e `user.profileType`
- React Router `Link` — para navegar a `/app/profile/:id`

### Dados disponíveis no MapPin (sem chamada extra)

O objeto `MapPin` da Story 4.1 já contém:
- `id`, `name`, `profile_type`, `city`, `music_genre`, `logo_url`

O popup pode renderizar **imediatamente** com esses dados, sem loading state (AC8 se aplica apenas se uma chamada extra for feita no futuro para dados adicionais como bio).

### Componente ProfilePopup

Criar `src/features/app/map/components/ProfilePopup.tsx`:

```typescript
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useAuthStore } from '@/stores/authStore';
import type { MapPin } from '@/lib/schemas/mapSchema';

interface ProfilePopupProps {
  pin: MapPin;
  onClose: () => void;
}

export function ProfilePopup({ pin, onClose }: ProfilePopupProps) {
  const user = useAuthStore((s) => s.user);
  const isOwnProfile = user?.profileId === pin.id;
  const canConnect = !isOwnProfile && user?.profileType === 'band' && pin.profile_type === 'band';

  // Fechar com Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={`Perfil de ${pin.name}`}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-80 p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#1a1a1a', border: '2px solid #F2CF1D' }}
    >
      {/* Header com logo e nome */}
      <div className="flex items-center gap-3">
        <ProfileAvatar name={pin.name} logoUrl={pin.logo_url} size="md" />
        <div>
          <p className="font-bold text-sm" style={{ color: '#F2CF1D' }}>{pin.name}</p>
          <p className="text-xs capitalize" style={{ color: '#9ca3af' }}>
            {PROFILE_TYPE_LABEL[pin.profile_type]} · {pin.city ?? '—'}
          </p>
          {pin.music_genre && (
            <p className="text-xs" style={{ color: '#6b7280' }}>{pin.music_genre}</p>
          )}
        </div>
      </div>

      {/* Badge próprio perfil */}
      {isOwnProfile && (
        <p className="text-xs font-medium text-center py-1" style={{ color: '#F2CF1D', border: '1px solid #F2CF1D' }}>
          Este é você
        </p>
      )}

      {/* Botões */}
      <div className="flex gap-2">
        <Link
          to={`/app/profile/${pin.id}`}
          className="flex-1 px-3 py-1.5 text-xs text-center font-medium"
          style={{ color: '#F2CF1D', border: '2px solid #F2CF1D', backgroundColor: 'transparent' }}
        >
          Ver Perfil Completo
        </Link>
        {canConnect && (
          <button
            disabled
            className="flex-1 px-3 py-1.5 text-xs font-medium opacity-60 cursor-not-allowed"
            style={{ color: '#0D0D0D', backgroundColor: '#F2CF1D', border: '2px solid #F2CF1D' }}
            title="Disponível em breve"
          >
            Enviar Conexão
          </button>
          // TODO: Story 5.1 — implementar envio de convite de conexão
        )}
      </div>

      {/* Botão fechar */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-xs"
        style={{ color: '#6b7280' }}
        aria-label="Fechar popup"
      >
        ✕
      </button>
    </div>
  );
}

const PROFILE_TYPE_LABEL: Record<string, string> = {
  band: 'Banda',
  venue: 'Venue',
  producer: 'Produtor',
};
```

### Integração com MapPage

Em `MapPage.tsx` (criado na Story 4.1), adicionar estado para pin selecionado:

```typescript
const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

// No JSX, após o MapContainer:
{selectedPin && (
  <ProfilePopup
    pin={selectedPin}
    onClose={() => setSelectedPin(null)}
  />
)}
```

Passar `onClick={(pin) => setSelectedPin(pin)}` para cada `PinMarker`.

**Nota**: `ProfilePopup` é posicionado **absolutamente sobre o mapa** (não dentro do `MapContainer`) para evitar problemas de z-index com o Leaflet. Usar `position: absolute` com `z-index: 1000`.

### Estrutura de arquivos a criar

```
src/features/app/map/
  components/
    ProfilePopup.tsx       ← novo
src/features/app/map/
  MapPage.tsx              ← modificar (adicionar selectedPin state + ProfilePopup)
```

---

## Dependencies

- **Bloqueante:** Story 4.1 (Mapa Base com Pins) — precisa do `useMapPins` e `MapPin` type
- **Reutiliza:** `ProfileAvatar` (Story 3.2), `useAuthStore` (Story 1.2), `AsyncState` (Story 1.1)
- **Alimenta:** Story 5.1 (Enviar Conexão) — o botão "Enviar Conexão" nesta story é o entry point

---

## Dev Notes

- O popup é sobreposto ao mapa usando `position: absolute` dentro de um container `relative` — não usar o `Popup` nativo do Leaflet (perde o controle de z-index e estilo neo-brutalista)
- O `z-index: 1000` é necessário pois o Leaflet usa z-index internamente em sua pane system
- Clique fora (AC7): adicionar listener de click no overlay ou no mapa — `MapContainer` tem `eventHandlers={{ click: () => setSelectedPin(null) }}`
- O botão "Enviar Conexão" deve estar `disabled` com tooltip "Disponível em breve" até Story 5.1 — não remover nem deixar funcional com navegação
- Não buscar dados adicionais da API nesta story — todos os dados do popup estão no objeto `MapPin`

---

## Dev Agent Record

### Completion Notes (2026-04-16)

- `ProfilePopup.tsx` criado com todos os campos do `MapPin` (logo/avatar, nome, tipo, cidade, gênero)
- Escape (AC6): listener `keydown` no `window` com cleanup no `useEffect`
- Fechar fora (AC7): `MapClickHandler` interno usando `useMapEvents` do react-leaflet — fecha o popup ao clicar no mapa
- `isOwnProfile`: compara `user.profileId === pin.id` via `useAuthStore`
- `canConnect`: apenas quando `user.profileType === 'band'` e `pin.profile_type === 'band'` e não é o próprio perfil (AC3/AC4)
- Botão "Enviar Conexão" desabilitado com `disabled` + `cursor-not-allowed` + `title="Disponível em breve"` (TODO Story 5.1)
- AC8 (skeleton): não necessário — dados do popup já estão no objeto `MapPin` sem chamada extra

## File List

- `src/features/app/map/components/ProfilePopup.tsx` — novo
- `src/features/app/map/MapPage.tsx` — modificado (selectedPin funcional + ProfilePopup + MapClickHandler)

## Change Log

- 2026-04-16: Story 4.2 implementada — ProfilePopup com todos os ACs, sem chamadas extras de API

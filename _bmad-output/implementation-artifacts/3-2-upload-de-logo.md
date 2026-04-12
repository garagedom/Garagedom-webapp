# Story 3.2: Upload de Logo

Status: review

## Story

Como usuário com perfil criado,
Quero fazer upload da minha logo e vê-la imediatamente no meu perfil e no mapa,
Para que minha identidade visual esteja representada na plataforma.

---

## Acceptance Criteria

**AC1 — Trigger de upload**
- Given estou na página do meu perfil (`/app/profile/edit` ou área dedicada de upload)
- When clico na área de upload e seleciono uma imagem (PNG/JPG ≤ 5MB)
- Then `POST /api/v1/profiles/:id/logo` é chamado com o arquivo como `multipart/form-data`

**AC2 — Upload assíncrono não bloqueia UI**
- Given o upload está em andamento
- When o indicador de progresso é exibido
- Then o perfil permanece totalmente utilizável — outros campos são editáveis e navegação é possível

**AC3 — Atualização imediata após upload**
- Given o upload é concluído com sucesso
- When a API retorna a URL da logo
- Then a logo é exibida imediatamente na área de upload e o TanStack Query invalida `['profile', id]`

**AC4 — Fallback visual**
- Given nenhuma logo foi enviada
- When o avatar do perfil ou pin do mapa é exibido
- Then um avatar com as iniciais do nome e cor determinística baseada no hash do nome é mostrado como fallback

**AC5 — Validação de arquivo**
- Given seleciono um arquivo > 5MB ou formato inválido (não PNG/JPG)
- When o arquivo é selecionado no input
- Then "Arquivo inválido. Use PNG ou JPG com no máximo 5MB." é exibido e nenhum upload é disparado

**AC6 — Indicador de progresso**
- Given o upload está em andamento
- When o indicador de progresso é exibido
- Then há feedback visual claro do estado (spinner ou barra de progresso)

**AC7 — Erro de upload**
- Given o upload falha (erro de rede ou API)
- When o erro ocorre
- Then "Erro ao enviar a imagem. Tente novamente." é exibido e a logo anterior (ou fallback) é mantida

**AC8 — Troca de logo**
- Given já tenho uma logo enviada
- When seleciono uma nova imagem válida
- Then a nova logo substitui a anterior após upload bem-sucedido

---

## Technical Context

### Stack
- React 19 + TypeScript
- TanStack Query (useMutation) para POST multipart
- Zustand para estado de upload (opcional — pode ser local state)
- Tailwind v4 + Shadcn/ui

### API Contract

```
POST /api/v1/profiles/:id/logo
Content-Type: multipart/form-data
Body: { logo: File }
Success: 200 + { logo_url: "https://..." }
Error: 422 + { errors: [...] }
```

### Função de fallback visual (avatar com iniciais)

Criar `src/lib/avatar.ts`:

```typescript
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function getAvatarColor(name: string): string {
  // Cor determinística baseada no hash do nome
  const colors = [
    '#F2CF1D', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
```

### Componente AvatarFallback

Criar `src/components/ProfileAvatar.tsx` — reutilizado no mapa, perfil público e popup:

```typescript
interface ProfileAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}
```

### Validação client-side do arquivo

```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

function validateLogoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Arquivo inválido. Use PNG ou JPG com no máximo 5MB.';
  }
  if (file.size > MAX_SIZE) {
    return 'Arquivo inválido. Use PNG ou JPG com no máximo 5MB.';
  }
  return null;
}
```

### Estrutura de arquivos a criar/atualizar

```
src/features/profile/
  hooks/
    useUploadLogo.ts       ← novo
  components/
    LogoUpload.tsx         ← novo (área de upload com drag-or-click)
    ProfileAvatar.tsx      ← novo (avatar com fallback de iniciais)
src/lib/
  avatar.ts                ← novo
```

### Nota sobre upload assíncrono (UX-DR05)

O perfil é criado primeiro (Story 3.1), o logo é processado em background. Nunca bloquear a criação/edição do perfil aguardando o upload de logo.

---

## Dependencies

- **Bloqueante:** Story 3.1 (Criação de Perfil) — precisa de `profileId` no auth store
- **Reutilizado por:** Story 4.1 (Mapa Base com Pins) e Story 3.5 (Visualização de Perfil Público) — `ProfileAvatar` é componente compartilhado
- **Backend API endpoint:** `POST /api/v1/profiles/:id/logo` deve suportar multipart/form-data

---

## Dev Notes

- Manter `ProfileAvatar` em `src/components/` (não em `features/`) pois será reutilizado no mapa e outros contextos
- A cor do avatar fallback deve ser determinística — mesma cor para o mesmo nome em qualquer sessão
- Acessibilidade: input de arquivo com label visível, `aria-label` descritivo na área de upload
- Não usar `URL.createObjectURL` como URL permanente — usar apenas para preview temporário

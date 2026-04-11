# Story 3.1: Criação de Perfil

Status: review

## Story

Como novo usuário,
Quero criar meu perfil com um tipo fixo (banda, venue ou produtor),
Para que eu estabeleça minha identidade na plataforma e seja descoberto no mapa.

---

## Acceptance Criteria

**AC1 — Formulário de criação de perfil**
- Given acabei de me cadastrar (ou navego para `/app/profile/create`)
- When o formulário carrega
- Then exibe os campos: nome do perfil, tipo (banda/venue/produtor — seleção única), cidade, gênero musical

**AC2 — Criação bem-sucedida**
- Given seleciono "banda" e submeto dados válidos
- When `POST /api/v1/profiles` retorna 201
- Then meu perfil é criado, `useAuthStore` é atualizado com `profileId` e `profileType`, e sou redirecionado para `/app/map`

**AC3 — Validação de tipo obrigatório**
- Given submeto sem selecionar um tipo de perfil
- When clico em "Criar perfil"
- Then "Selecione o tipo de perfil para continuar" é exibido e o formulário não é submetido

**AC4 — Validação de nome obrigatório**
- Given submeto com o campo nome vazio
- When clico em "Criar perfil"
- Then "O nome é obrigatório" é exibido

**AC5 — Parsing via Zod**
- Given o formulário é submetido com sucesso
- When a resposta da API chega
- Then ela é parseada via `profileSchema` (Zod) antes de atualizar o store

**AC6 — Estado de loading**
- Given o formulário é submetido
- When aguardando resposta da API
- Then o botão "Criar perfil" exibe estado de loading e fica desabilitado

**AC7 — Erro de API**
- Given a API retorna erro 422 ou 500
- When a resposta chega
- Then uma mensagem de erro legível é exibida e o formulário permanece preenchido

**AC8 — Redirecionamento se perfil já existe**
- Given o usuário já possui um perfil criado
- When acessa `/app/profile/create`
- Then é redirecionado para `/app/map`

---

## Technical Context

### Stack
- React 19 + TypeScript + Vite
- React Hook Form + Zod para validação
- TanStack Query (useMutation) para POST
- Zustand (`useAuthStore`) para estado global
- Tailwind v4 + Shadcn/ui para componentes
- Axios (`api-client.ts`) para requisições HTTP

### Arquitetura de Auth Store

O `useAuthStore` atual (`src/stores/authStore.ts`) armazena apenas `id` e `email`. Nesta story, é necessário estender com `profileId` e `profileType`:

```typescript
interface AuthUser {
  id: number;
  email: string;
  profileId?: number;
  profileType?: 'band' | 'venue' | 'producer';
}
```

### Zod Schema

Criar `src/lib/schemas/profileSchema.ts`:

```typescript
import { z } from 'zod';

export const profileTypeSchema = z.enum(['band', 'venue', 'producer']);

export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_type: profileTypeSchema,
  city: z.string(),
  musical_genre: z.string().optional(),
  bio: z.string().optional(),
  logo_url: z.string().url().nullable(),
  is_visible: z.boolean(),
  created_at: z.string(),
});

export const createProfileSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  profile_type: profileTypeSchema.refine(Boolean, 'Selecione o tipo de perfil para continuar'),
  city: z.string().min(1, 'A cidade é obrigatória'),
  musical_genre: z.string().optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
```

### API Contract

```
POST /api/v1/profiles
Body: { profile: { name, profile_type, city, musical_genre } }
Success: 201 + { id, name, profile_type, city, ... }
Error: 422 + { errors: [...] }
```

### Estrutura de arquivos a criar

```
src/features/profile/
  index.ts
  types.ts
  hooks/
    useCreateProfile.ts
  components/
    CreateProfileForm.tsx
  CreateProfilePage.tsx
```

### Rota a adicionar em `src/router/index.tsx`

```typescript
{
  path: '/app/profile/create',
  element: (
    <Suspense fallback={null}>
      <ProtectedRoute>
        <CreateProfilePage />
      </ProtectedRoute>
    </Suspense>
  ),
}
```

### Nota sobre design tokens neo-brutalistas

Usar paleta: `#F2CF1D` (amarelo primário), `#0D0D0D` (preto), bordas sólidas, sombras offset. Consistente com a LandingPage existente.

---

## Dependencies

- **Bloqueante para esta story:** Story 1-1 (fundação, auth, roteamento) — `done`/`review` ✓
- **Próxima story dependente:** Story 3.2 (Upload de Logo) — usa `profileId` retornado aqui
- **Backend API endpoint:** `POST /api/v1/profiles` deve estar disponível no garagedom-api

---

## Tasks / Subtasks

- [x] Task 1: Estender authStore com profileId e profileType (AC2, AC5)
- [x] Task 2: Criar src/lib/schemas/profileSchema.ts (AC3, AC4, AC5)
- [x] Task 3: Criar ProtectedRoute (AC8)
- [x] Task 4: Criar useCreateProfile hook (AC2, AC5, AC6, AC7)
- [x] Task 5: Criar CreateProfileForm + CreateProfilePage (AC1–AC8)
- [x] Task 6: Registrar rota e atualizar redirect do RegisterPage

## Dev Agent Record

### Debug Log
| Issue | Resolution |
|-------|------------|

### Completion Notes
Todos os ACs implementados. authStore estendido com profileId/profileType e nova action setProfile. Schema Zod criado com validação pt-BR. ProtectedRoute protege /app/map e /app/profile/create. useCreateProfile faz POST e atualiza store via onSuccess. CreateProfileForm cobre AC1/AC3/AC4/AC6/AC7 com acessibilidade (aria-required, role=alert). CreateProfilePage cobre AC2/AC8 (redirect pós-criação e redirect se perfil já existe). Router refatorado com lazyRoutes.tsx separado (fix lint react-refresh). RegisterPage redireciona para /app/profile/create após registro. tsc --noEmit e eslint passam com EXIT 0.

## File List
- src/stores/authStore.ts (modified)
- src/lib/schemas/profileSchema.ts (new)
- src/router/ProtectedRoute.tsx (new)
- src/router/lazyRoutes.tsx (new)
- src/router/index.tsx (modified)
- src/features/profile/hooks/useCreateProfile.ts (new)
- src/features/profile/components/CreateProfileForm.tsx (new)
- src/features/profile/CreateProfilePage.tsx (new)
- src/features/auth/RegisterPage.tsx (modified)

## Change Log
| Date | Change |
|------|--------|
| 2026-04-11 | Story 3.1 implementada: criação de perfil com validação Zod, authStore estendido, ProtectedRoute, rota /app/profile/create |

---

## Dev Notes

- O redirect pós-criação é para `/app/map` — o mapa é o contexto primário do produto (UX-DR02)
- `profileType` no store é necessário para o menu de navegação contextual (Story 2.6 — backlog)
- Manter 3 campos obrigatórios no máximo no formulário inicial (UX-DR01) — nome, tipo, cidade são os essenciais; gênero musical é opcional
- Acessibilidade: foco visível em todos os campos, labels associados, `aria-required`

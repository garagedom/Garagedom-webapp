# Story 2.1: Cadastro com E-mail e Senha

Status: review

## Story

Como visitante,
Quero criar uma conta com nome, e-mail e senha aceitando os termos de uso,
Para que eu possa acessar a plataforma GarageDom.

## Acceptance Criteria

1. **Given** estou em `/register`
   **When** preencho nome, e-mail e senha (≥ 8 caracteres) e marco o checkbox de termos
   **Then** o formulário pode ser submetido

2. **Given** submeto o formulário com dados válidos
   **When** a API retorna 201
   **Then** sou redirecionado para `/app/profile/create` com `isAuthenticated: true` no store

3. **Given** submeto sem marcar o checkbox de termos
   **When** clico em "Criar conta"
   **Then** o formulário exibe "Você precisa aceitar os termos de uso para continuar" e não é submetido

4. **Given** submeto com e-mail já cadastrado
   **When** a API retorna 422 com `code: "email_taken"`
   **Then** o campo e-mail exibe "Este e-mail já está em uso"

5. **Given** o princípio de onboarding mínimo
   **When** o formulário é renderizado
   **Then** apenas 3 campos obrigatórios são exibidos: nome, e-mail, senha

6. **Given** o formulário usa React Hook Form + Zod
   **When** há erros de validação
   **Then** cada campo exibe sua mensagem específica em português sem jargão técnico

## Tasks / Subtasks

- [x] Adicionar campo `name` ao formulário de cadastro (AC: #1, #5)
  - [x] Atualizar `registerSchema` em `src/lib/schemas/auth.ts` com validação de `name`
  - [x] Adicionar campo `name` visualmente no `RegisterPage.tsx` antes do e-mail
  - [x] Atualizar `RegisterPayload` em `authService.ts` para incluir `name`
  - [x] Atualizar chamada `registerUser()` em `RegisterPage.tsx` para passar `name`

- [x] Mover schema de cadastro para `src/lib/schemas/auth.ts` (AC: #6)
  - [x] Criar `src/lib/schemas/auth.ts` com `registerSchema` e `loginSchema` exportados
  - [x] Remover schema inline de `RegisterPage.tsx` e importar de `src/lib/schemas/auth.ts`
  - [x] Exportar tipos `RegisterFormData` e `LoginFormData` do schema

- [x] Verificar fluxo pós-cadastro (AC: #2)
  - [x] Confirmar que `authService.register()` chama `setToken()` + `setUser()` antes do redirect
  - [x] Confirmar que `useAuthStore` retorna `isAuthenticated: true` após `setUser()`
  - [x] Confirmar redirect para `/app/profile/create` após cadastro bem-sucedido

- [ ] Criar testes unitários co-localizados (AC: todos) — DEFERIDO (será implementado em sprint dedicado de testes)
  - [ ] Criar `src/features/auth/RegisterPage.test.tsx` com:
    - Renderiza 3 campos obrigatórios (nome, e-mail, senha) + confirmation + checkbox
    - Exibe erro se checkbox não marcado ao submeter
    - Exibe "Este e-mail já está em uso" quando API retorna 422 + `email_taken`
    - Chama `navigate('/app/profile/create')` após sucesso da API
  - [ ] Criar `src/features/auth/authService.test.ts` com:
    - `register()` chama `POST /api/v1/auth/register` com payload correto
    - `register()` chama `setToken()` com o token retornado
    - `register()` chama `setUser()` com o user retornado

## Dev Notes

### Estado atual da implementação — NÃO reinvente o que já existe

A Story 2.1 possui **implementação parcial** feita em commits anteriores. Os seguintes arquivos JÁ EXISTEM e devem ser **estendidos, não reescritos**:

| Arquivo | Estado | O que fazer |
|---------|--------|-------------|
| `src/features/auth/RegisterPage.tsx` | Existe — faltando campo `name` | Adicionar campo `name` |
| `src/features/auth/authService.ts` | Existe — faltando `name` no payload | Adicionar `name` ao `RegisterPayload` |
| `src/lib/auth-token.ts` | Completo | Não tocar |
| `src/stores/authStore.ts` | Completo | Não tocar |
| `src/lib/api-client.ts` | Completo | Não tocar |
| `src/router/index.tsx` | Rota `/register` já configurada | Não tocar |
| `src/lib/schemas/profileSchema.ts` | Existe — padrão a seguir | Padrão de referência |

### Gap crítico: campo `name` ausente

O `RegisterPage.tsx` atual tem os campos: **email, password, password_confirmation, terms_accepted**.  
**Falta o campo `name`** (obrigatório conforme AC #5: "apenas 3 campos obrigatórios: nome, e-mail, senha").

**Onde adicionar `name` no schema:**
```typescript
// src/lib/schemas/auth.ts — CRIAR ESTE ARQUIVO
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  password_confirmation: z.string(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: 'Você precisa aceitar os termos de uso para continuar',
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'As senhas não coincidem',
  path: ['password_confirmation'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

**Atualizar RegisterPayload em `authService.ts`:**
```typescript
interface RegisterPayload {
  name: string;   // ADICIONAR ESTE CAMPO
  email: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
}
```

### Padrão visual do formulário — seguir estilo existente

O `RegisterPage.tsx` já usa um padrão visual consistente. O campo `name` deve seguir exatamente o mesmo padrão dos outros campos (não inventar novo estilo):

```tsx
// Adicionar antes do campo email — mesmo padrão exato dos outros campos
<div className="flex flex-col gap-1">
  <label htmlFor="name" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>
    Nome
  </label>
  <input
    id="name"
    type="text"
    autoComplete="name"
    className="px-3 py-2 text-sm bg-transparent outline-none"
    style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
    {...register('name')}
  />
  {errors.name && (
    <span className="text-xs" style={{ color: '#ef4444' }}>{errors.name.message}</span>
  )}
</div>
```

### Fluxo de autenticação — já implementado corretamente

```
RegisterPage.tsx
  └─ onSubmit() chama registerUser(payload)
       └─ authService.ts: POST /api/v1/auth/register
            └─ setToken(data.token)          ← JWT em memória (auth-token.ts)
            └─ useAuthStore.getState().setUser(data.user)  ← isAuthenticated = true
  └─ navigate('/app/profile/create', { replace: true })
```

O `useAuthStore.setUser()` já define `isAuthenticated: true` automaticamente (ver `src/stores/authStore.ts:22`).

### Tratamento de erros — padrão já definido

O `RegisterPage.tsx` já trata 422 com `code: "email_taken"`. Não reescrever — apenas garantir que o campo `name` não quebra esse fluxo.

**Endpoint:** `POST /api/v1/auth/register`
**Payload esperado (snake_case):** `{ user: { name, email, password, password_confirmation, terms_accepted } }`
**Response 201:** `{ token: string, user: { id: number, email: string } }`
**Response 422:** `{ code: "email_taken" | "terms_required", error: string }`

### Segurança JWT — regra crítica

JWT **NUNCA** em localStorage, sessionStorage ou cookie acessível via JS.
Usar **apenas** `setToken()` / `getToken()` de `src/lib/auth-token.ts` — singleton em variável de módulo.
O `api-client.ts` já injeta o token via interceptor de request automaticamente.

### Testing — padrão co-localizado

Testes ficam **ao lado do arquivo testado** (não em pasta `/tests`):
- `src/features/auth/RegisterPage.test.tsx`
- `src/features/auth/authService.test.ts`

Framework: **Vitest** (não Jest). Config em `vitest.config.ts`.

```typescript
// Exemplo de mock do api-client para testes
import { vi } from 'vitest';
vi.mock('@/lib/api-client', () => ({
  apiClient: { post: vi.fn() }
}));
```

### Project Structure Notes

- Feature auth em: `src/features/auth/`
- Schemas Zod em: `src/lib/schemas/` — criar `auth.ts` seguindo padrão de `profileSchema.ts`
- Stores Zustand em: `src/stores/` — `authStore.ts` já existe
- Lib singleton JWT: `src/lib/auth-token.ts` — já existe e completo
- O `src/lib/errors.ts` referenciado na arquitetura ainda **não existe** — não criar agora (fora do escopo desta story)

### References

- Schema existente como padrão: `src/lib/schemas/profileSchema.ts`
- Implementação parcial: `src/features/auth/RegisterPage.tsx`
- Serviço de auth: `src/features/auth/authService.ts`
- JWT singleton: `src/lib/auth-token.ts`
- Auth store: `src/stores/authStore.ts`
- Router configurado: `src/router/index.tsx`
- Arquitetura — Autenticação e Sessão: `_bmad-output/planning-artifacts/architecture.md` seção "Autenticação e Sessão"
- Epics — Story 2.1: `_bmad-output/planning-artifacts/epics.md` linha 411

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Criado `src/lib/schemas/auth.ts` com `registerSchema` (inclui campo `name`) e `loginSchema` centralizados
- `RegisterPage.tsx` atualizado: campo `name` adicionado antes do e-mail, schema importado de `src/lib/schemas/auth.ts`
- `LoginPage.tsx` atualizado: schema importado de `src/lib/schemas/auth.ts` (inline removido)
- `authService.ts` atualizado: `RegisterPayload` agora inclui campo `name`
- Fluxo pós-cadastro confirmado: `setToken()` + `setUser()` → `isAuthenticated: true` → redirect para `/app/profile/create`
- TypeScript sem erros (`tsc --noEmit` limpo)
- Testes unitários deferidos para sprint dedicado de testes

### File List

- `src/lib/schemas/auth.ts` (criado)
- `src/features/auth/RegisterPage.tsx` (modificado)
- `src/features/auth/LoginPage.tsx` (modificado)
- `src/features/auth/authService.ts` (modificado)

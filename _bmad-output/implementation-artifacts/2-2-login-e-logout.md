# Story 2.2: Login e Logout

Status: review

## Story

Como usuário cadastrado,
Quero fazer login com e-mail e senha e logout com segurança,
Para que eu acesse minha conta e a proteja quando terminar.

## Acceptance Criteria

1. **Given** estou em `/login`
   **When** insiro credenciais válidas e submeto
   **Then** o JWT é armazenado via `setToken()` (em memória), o auth store é atualizado, e sou redirecionado para `/app/map`

2. **Given** o login foi realizado com sucesso
   **When** o JWT é armazenado
   **Then** ele NÃO está presente em `localStorage`, `sessionStorage` ou qualquer cookie acessível via JS

3. **Given** clico em "Sair"
   **When** confirmado
   **Then** `clearToken()` é chamado, o auth store é limpo, o WebSocket desconecta (no-op enquanto ActionCable não implementado), e sou redirecionado para `/`

4. **Given** insiro credenciais incorretas
   **When** a API retorna 401
   **Then** "E-mail ou senha incorretos" é exibido sem revelar qual dos dois está errado

5. **Given** fui redirecionado para `/login` a partir de uma rota protegida
   **When** faço login com sucesso
   **Then** sou redirecionado para o path original que havia solicitado

## Tasks / Subtasks

- [x] Corrigir redirect pós-login para path original (AC: #5)
  - [x] Em `LoginPage.tsx`, ler `location.state?.from` via `useLocation()`
  - [x] Após login bem-sucedido, redirecionar para `state.from?.pathname ?? '/app/map'`

- [x] Implementar função `logout()` em `authService.ts` (AC: #3)
  - [x] Criar `logout()` que chama `clearToken()` + `useAuthStore.getState().clearAuth()`
  - [x] Adicionar comentário indicando que WebSocket disconnect será adicionado em story de ActionCable

- [x] Adicionar botão "Sair" em `MapPage.tsx` (AC: #3)
  - [x] Importar e chamar `logout()` de `authService.ts`
  - [x] Após `logout()`, redirecionar para `/`
  - [x] Adicionar nota no código: "TODO: mover para Navigation (Story 2.6)"

- [x] Verificar segurança JWT — garantia de não-persistência (AC: #2)
  - [x] Confirmar que `auth-token.ts` usa apenas variável de módulo (não localStorage/sessionStorage)
  - [x] Confirmar que `api-client.ts` não persiste o token em nenhum storage

## Dev Notes

### Estado atual — o que JÁ EXISTE e NÃO deve ser reescrito

| Arquivo | Estado | O que fazer |
|---------|--------|-------------|
| `src/features/auth/LoginPage.tsx` | Existe — falta redirect para `state.from` | Pequena correção no navigate |
| `src/features/auth/authService.ts` | Existe — falta `logout()` | Adicionar função `logout()` |
| `src/features/app/map/MapPage.tsx` | Existe — falta botão "Sair" | Adicionar botão temporário |
| `src/router/ProtectedRoute.tsx` | Completo — já salva `state.from` | Não tocar |
| `src/lib/auth-token.ts` | Completo — `clearToken()` existe | Não tocar |
| `src/stores/authStore.ts` | Completo — `clearAuth()` existe | Não tocar |
| `src/lib/schemas/auth.ts` | Completo — `loginSchema` exportado | Não tocar |

### Gap 1: LoginPage não redireciona para path original (AC #5)

`ProtectedRoute.tsx` já salva o path ao redirecionar:
```tsx
// src/router/ProtectedRoute.tsx — já implementado
return <Navigate to="/login" state={{ from: location }} replace />;
```

Mas `LoginPage.tsx` usa `navigate('/app/map')` hardcoded. A correção é mínima:

```tsx
// src/features/auth/LoginPage.tsx — ANTES
const navigate = useNavigate();
// ...
void navigate('/app/map', { replace: true });

// DEPOIS
const navigate = useNavigate();
const location = useLocation();
// ...
const from = (location.state as { from?: Location })?.from?.pathname ?? '/app/map';
void navigate(from, { replace: true });
```

**Importante:** importar `useLocation` e `Location` de `react-router-dom`.

### Gap 2: Função `logout()` ausente em `authService.ts`

```typescript
// Adicionar em src/features/auth/authService.ts
import { clearToken } from '@/lib/auth-token';

export function logout(): void {
  clearToken();
  useAuthStore.getState().clearAuth();
  // TODO: desconectar ActionCable quando implementado (Story 7.x)
}
```

### Gap 3: Botão "Sair" temporário em MapPage

O botão de logout definitivo virá na Story 2.6 (Navegação Global). Por ora, adicionar um botão temporário em `MapPage.tsx`:

```tsx
// Adicionar ao final do JSX de MapPage.tsx — será removido em Story 2.6
import { logout } from '@/features/auth/authService';
import { useNavigate } from 'react-router-dom';

// dentro do componente:
const navigate = useNavigate();
const handleLogout = () => {
  logout();
  void navigate('/', { replace: true });
};

// no JSX:
<button onClick={handleLogout}>Sair</button>
// TODO: mover para Navigation (Story 2.6)
```

**Estilo:** seguir o padrão visual existente no projeto (background `#0D0D0D`, texto `#F2CF1D`, border `2px solid #F2CF1D`).

### Segurança JWT — confirmação de design (AC #2)

O design de segurança já está correto e não requer alteração:
- `src/lib/auth-token.ts` — variável privada de módulo (`let _token`) — imune a XSS
- `api-client.ts` injeta o token via interceptor sem nunca escrevê-lo em storage
- O httpOnly cookie do refresh token é gerenciado pelo Rails (nunca acessível via JS)

**Verificação:** `clearToken()` em `auth-token.ts:6` seta `_token = null` — simples e correto.

### Fluxo de login completo (AC #1 e #5)

```
LoginPage.tsx
  └─ onSubmit() → login(payload)
       └─ authService.ts: POST /api/v1/auth/login
            └─ setToken(data.token)          ← JWT em memória
            └─ useAuthStore.getState().setUser(data.user)  ← isAuthenticated = true
  └─ navigate(state.from?.pathname ?? '/app/map', { replace: true })
```

### Fluxo de logout completo (AC #3)

```
MapPage.tsx (temporário) → botão "Sair"
  └─ logout()
       └─ clearToken()          ← apaga JWT da memória
       └─ clearAuth()           ← isAuthenticated = false, user = null
  └─ navigate('/', { replace: true })
```

**Nota:** `AppProviders.tsx` já trata o evento `auth:unauthorized` (401 do servidor) → `clearAuth()` + redirect para `/login`. Isso cobre expiração de token durante uso. O logout manual é separado.

### Endpoint

- `POST /api/v1/auth/login` — payload: `{ user: { email, password } }`
- Response 200: `{ token: string, user: { id: number, email: string } }`
- Response 401: status 401 (sem body específico)
- Logout é client-side only — não há endpoint no backend por ora

### Project Structure Notes

- `src/features/auth/` — Login/Register/authService
- `src/lib/schemas/auth.ts` — loginSchema já existe
- `src/stores/authStore.ts` — clearAuth() já existe
- O botão "Sair" em MapPage é TEMPORÁRIO — será substituído pela Navigation em Story 2.6
- Não criar componente `Navigation` agora (escopo da Story 2.6)

### Aprendizados da Story 2.1

- Schemas centralizados em `src/lib/schemas/auth.ts` — não criar inline
- Seguir padrão visual: bg `#0D0D0D`, amarelo `#F2CF1D`, border `2px solid`
- `useAuthStore.getState()` para acesso fora de componentes React
- TypeScript strict — verificar `tsc --noEmit` após mudanças

### References

- `src/features/auth/LoginPage.tsx` — implementação atual
- `src/router/ProtectedRoute.tsx` — state.from já implementado
- `src/features/auth/authService.ts` — login() existente
- `src/lib/auth-token.ts` — clearToken()
- `src/stores/authStore.ts` — clearAuth()
- `src/providers/AppProviders.tsx` — tratamento de auth:unauthorized
- Epics — Story 2.2: `_bmad-output/planning-artifacts/epics.md` linha 445

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `LoginPage.tsx`: adicionado `useLocation()`, variável `from` lê `state.from?.pathname` com fallback para `/app/map`
- `authService.ts`: importado `clearToken`, adicionada função `logout()` — `clearToken()` + `clearAuth()` + TODO ActionCable
- `MapPage.tsx`: adicionado botão "Sair" temporário com `logout()` + `navigate('/')`, marcado TODO para Story 2.6
- Segurança JWT confirmada: `auth-token.ts` usa variável de módulo privada, `api-client.ts` não persiste token
- TypeScript sem erros (`tsc --noEmit` limpo)
- Testes unitários deferidos para sprint dedicado de testes

### File List

- `src/features/auth/LoginPage.tsx` (modificado)
- `src/features/auth/authService.ts` (modificado)
- `src/features/app/map/MapPage.tsx` (modificado)

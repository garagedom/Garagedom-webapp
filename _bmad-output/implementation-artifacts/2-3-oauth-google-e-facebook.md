# Story 2.3: OAuth Google e Facebook

Status: review

## Story

Como visitante,
Quero criar conta ou fazer login via Google ou Facebook,
Para que eu acesse a plataforma sem criar uma senha separada.

## Acceptance Criteria

1. **Given** clico em "Entrar com Google" na página de login/cadastro
   **When** clicado
   **Then** sou redirecionado para o endpoint OAuth do Rails que gerencia o fluxo Google

2. **Given** o fluxo OAuth completa com sucesso
   **When** o Rails redireciona para `/app/auth/callback?token=<jwt>`
   **Then** `OAuthCallback.tsx` extrai o token, chama `setToken()`, atualiza o auth store e redireciona para `/app/map`

3. **Given** o fluxo OAuth falha ou é cancelado
   **When** o callback recebe um parâmetro de erro
   **Then** "Não foi possível autenticar. Tente novamente." é exibido em `/login`

4. **Given** é o primeiro acesso via OAuth
   **When** redirecionado após o callback com `?new_user=true`
   **Then** o usuário é enviado para `/app/profile/create` para completar o perfil

## Tasks / Subtasks

- [x] Criar `OAuthCallback.tsx` e rota `/app/auth/callback`
- [x] Adicionar botões OAuth em `LoginPage.tsx` e `RegisterPage.tsx`
- [x] Adicionar `fetchCurrentUser()` em `authService.ts`

## Dev Notes

### References
- `src/features/auth/authService.ts`, `src/router/index.tsx`

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Completion Notes List

### File List

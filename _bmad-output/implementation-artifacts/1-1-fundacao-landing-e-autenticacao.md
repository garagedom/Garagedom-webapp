# Story 1.1: Fundação, Landing Page e Autenticação Básica

Status: review

## Story

Como desenvolvedor,
Quero a fundação técnica do projeto configurada com infraestrutura de autenticação, landing page e fluxo de login/cadastro conectados ao backend garagedom-api,
Para que o app seja funcional e todos os epics seguintes possam ser implementados de forma consistente sobre essa base.

---

## Acceptance Criteria

**AC1 — Estrutura de pastas**
- Given o projeto já existe com Vite + React + TS
- When a estrutura de pastas for criada
- Then os diretórios `src/features/`, `src/lib/`, `src/stores/`, `src/hooks/`, `src/router/`, `src/providers/`, `src/types/`, `src/components/` existem

**AC2 — Singleton de token JWT**
- Given `src/lib/auth-token.ts` é criado
- When `setToken(jwt)` é chamado e depois `getToken()` é chamado
- Then o token é retornado sem jamais ter sido gravado em `localStorage`, `sessionStorage` ou cookie acessível via JS
- When `clearToken()` é chamado
- Then `getToken()` retorna `null`

**AC3 — Cliente HTTP com injeção de JWT**
- Given `src/lib/api-client.ts` é criado com instância Axios
- When qualquer requisição é feita
- Then o header `Authorization: Bearer <token>` é injetado via request interceptor usando `getToken()`
- When a API retorna 401 e não há retry em andamento
- Then `clearToken()` é chamado, o auth store é limpo e o usuário é redirecionado para `/login`

**AC4 — Auth Store com Zustand**
- Given `src/stores/authStore.ts` é criado
- When `setUser({ id, email })` é chamado
- Then `isAuthenticated` é `true` e o estado está disponível em qualquer componente via `useAuthStore()`
- When `clearAuth()` é chamado
- Then `isAuthenticated` é `false` e `user` é `null` — o token JWT nunca está no store

**AC5 — TanStack Query configurado**
- Given `src/lib/query-client.ts` é criado
- When TanStack Query é configurado
- Then `staleTime` é 60000ms e `retry` não é tentado para erros 401

**AC6 — Roteamento com rotas públicas**
- Given `src/router/index.tsx` é criado com `createBrowserRouter`
- When o app carrega
- Then as rotas `/`, `/login` e `/register` estão definidas e acessíveis sem autenticação
- When um usuário já autenticado acessa `/login` ou `/register`
- Then é redirecionado para `/app/map` (placeholder simples por enquanto)

**AC7 — AppProviders compõe a hierarquia**
- Given `src/providers/AppProviders.tsx` existe
- When o app monta
- Then a ordem de providers é: `QueryClientProvider` > `RouterProvider`

**AC8 — Landing page em `/`**
- Given o usuário acessa `/`
- When a página carrega
- Then vê o nome GarageDom, tagline do produto, CTAs "Entrar" e "Criar conta"
- Then os tokens neo-brutalistas (`#F2CF1D`, `#0D0D0D`, bordas sólidas) são usados no design
- Then os links "Entrar" e "Criar conta" navegam para `/login` e `/register` respectivamente

**AC9 — Login com email/senha**
- Given o usuário está em `/login`
- When preenche email e senha válidos e submete
- Then `POST /api/v1/auth/login` é chamado com body `{ user: { email, password } }`
- Then o JWT é armazenado via `setToken()` (em memória), o auth store é atualizado com `setUser()`
- Then o usuário é redirecionado para `/app/map` (placeholder simples)
- When insere credenciais incorretas e a API retorna 401
- Then "E-mail ou senha incorretos" é exibido sem revelar qual está errado
- When o formulário é submetido
- Then o botão mostra estado de loading enquanto aguarda resposta

**AC10 — Cadastro com email/senha**
- Given o usuário está em `/register`
- When preenche nome, email, senha (≥ 8 caracteres) e marca o checkbox de termos
- Then `POST /api/v1/auth/register` é chamado com body `{ user: { email, password, password_confirmation, terms_accepted: true } }`
- Then o JWT é armazenado via `setToken()` e o auth store é atualizado
- Then o usuário é redirecionado para `/app/map` (placeholder simples)
- When o checkbox de termos NÃO está marcado e tenta submeter
- Then "Você precisa aceitar os termos de uso para continuar" é exibido e o formulário não é submetido
- When o email já está cadastrado e a API retorna 422 com `code: "email_taken"`
- Then o campo email exibe "Este e-mail já está em uso"

**AC11 — Variáveis de ambiente**
- Given `.env.example` existe na raiz
- When um novo desenvolvedor configura o projeto
- Then `VITE_API_URL` está documentado como variável obrigatória

**AC12 — App inicia sem erros**
- Given a implementação está completa
- When `npm run dev` é executado
- Then o app inicia sem erros TypeScript e sem erros no console do browser

---

## Tasks / Subtasks

- [x] **Tarefa 1: Estrutura de pastas e infraestrutura base** (AC: 1, 5, 7, 11)
  - [x] 1.1 Criar diretórios: `src/features/`, `src/lib/`, `src/stores/`, `src/hooks/`, `src/router/`, `src/providers/`, `src/types/`
  - [x] 1.2 Criar `src/lib/auth-token.ts` — singleton JWT em memória
  - [x] 1.3 Criar `src/lib/api-client.ts` — Axios com interceptors de request (injetar JWT) e response (401 → clearToken + redirect)
  - [x] 1.4 Criar `src/stores/authStore.ts` — Zustand store com `isAuthenticated`, `user`, `setUser()`, `clearAuth()`
  - [x] 1.5 Criar `src/lib/query-client.ts` — TanStack Query singleton configurado
  - [x] 1.6 Criar `.env.example` com `VITE_API_URL=http://localhost:3000`
  - [x] 1.7 Criar `.env.local` com `VITE_API_URL=http://localhost:3000` (não commitado)

- [x] **Tarefa 2: Roteamento e Providers** (AC: 6, 7)
  - [x] 2.1 Criar `src/router/index.tsx` com `createBrowserRouter` — rotas `/`, `/login`, `/register`, `/app/map` (placeholder)
  - [x] 2.2 Criar `src/providers/AppProviders.tsx` compondo `QueryClientProvider` + `RouterProvider`
  - [x] 2.3 Atualizar `src/main.tsx` para usar `AppProviders` em vez do `App` atual

- [x] **Tarefa 3: Tokens de design neo-brutalistas** (AC: 8)
  - [x] 3.1 Adicionar ao `src/index.css` as variáveis CSS da paleta GarageDom: `--color-primary: #F2CF1D`, `--color-primary-dark: #F2BD1D`, `--color-dark: #403208`, `--color-black: #0D0D0D`
  - [x] 3.2 Limpar CSS de starter do Vite que não pertence ao projeto (App.css, variáveis genéricas)

- [x] **Tarefa 4: Landing page** (AC: 8)
  - [x] 4.1 Criar `src/features/landing/LandingPage.tsx` com: nome GarageDom, tagline, CTA "Entrar" → `/login`, CTA "Criar conta" → `/register`
  - [x] 4.2 Aplicar design neo-brutalista: fundo `#0D0D0D`, título em `#F2CF1D`, bordas sólidas, tipografia Geist Variable
  - [x] 4.3 Registrar a rota `/` no router

- [x] **Tarefa 5: Feature de autenticação** (AC: 9, 10)
  - [x] 5.1 Criar `src/features/auth/LoginPage.tsx` com formulário React Hook Form + Zod (campos: email, senha)
  - [x] 5.2 Criar `src/features/auth/RegisterPage.tsx` com formulário (campos: nome, email, senha, checkbox termos)
  - [x] 5.3 Criar `src/features/auth/authService.ts` com funções `login()` e `register()` usando `api-client`
  - [x] 5.4 Implementar submit handlers: chamar service → `setToken()` → `setUser()` → redirect
  - [x] 5.5 Implementar tratamento de erros da API (401 no login, 422 no register com códigos específicos)
  - [x] 5.6 Adicionar estado de loading no botão de submit durante a chamada à API
  - [x] 5.7 Registrar rotas `/login` e `/register` no router
  - [x] 5.8 Criar `src/features/app/map/MapPage.tsx` como placeholder simples (texto "Mapa em breve") para redirect pós-login

- [x] **Tarefa 6: Limpeza do projeto** (AC: 12)
  - [x] 6.1 Remover `src/App.tsx` e `src/App.css` (substituídos pela estrutura de features)
  - [x] 6.2 Remover imports de assets de starter (heroImg, reactLogo, viteLogo) do `main.tsx` se existirem
  - [x] 6.3 Verificar que `npm run dev` inicia sem erros
  - [x] 6.4 Verificar que `npm run build` (TypeScript strict) compila sem erros

---

## Dev Notes

### Gaps Críticos Identificados — Leia antes de implementar

> **⚠️ REFRESH TOKEN — Backend não implementado:**
> A arquitetura especifica `POST /api/v1/auth/refresh` com httpOnly cookie, mas **este endpoint NÃO existe no backend atual** (verificado em `garagedom-api/config/routes.rb` em 2026-04-10). O interceptor de 401 desta story deve simplesmente fazer `clearToken()` + redirect para `/login`, sem retry. O refresh silencioso será implementado em story futura quando o backend adicionar o endpoint.

> **⚠️ OAUTH — Fluxo de browser não finalizado no backend:**
> O `OmniauthCallbacksController` do backend renderiza JSON em vez de redirecionar para o frontend. Para OAuth funcionar em um browser (fluxo de redirecionamento), o backend precisa ser modificado para redirecionar para `/app/auth/callback?token=<jwt>` após autenticação OAuth. OAuth está fora do escopo desta story — será tratado em `2-1-oauth-google-e-facebook`.

> **⚠️ NOME DO CAMPO DO USUÁRIO:**
> O backend retorna `{ token, user: { id, email } }` — sem campo `name`. O authStore deve armazenar apenas `id` e `email` por enquanto. O nome do usuário virá do perfil (Épico 3).

---

### Contratos de API verificados no backend (garagedom-api)

#### POST /api/v1/auth/login
```
Request:  POST http://localhost:3000/api/v1/auth/login
Body:     { "user": { "email": "band@test.com", "password": "senha123" } }
Headers:  Content-Type: application/json

Success 200:
  Headers: Authorization: Bearer <jwt>
  Body:    { "token": "<jwt>", "user": { "id": 1, "email": "band@test.com" } }

Error 401:
  Body:    { "error": "E-mail ou senha inválidos", "code": "invalid_credentials" }
```

#### POST /api/v1/auth/register
```
Request:  POST http://localhost:3000/api/v1/auth/register
Body:     { "user": { "email": "...", "password": "...", "password_confirmation": "...", "terms_accepted": true } }
Headers:  Content-Type: application/json

Success 201:
  Headers: Authorization: Bearer <jwt>
  Body:    { "token": "<jwt>", "user": { "id": 2, "email": "..." } }

Error 422 (termos):     { "error": "Termos de uso devem ser aceitos", "code": "terms_required" }
Error 422 (email dup):  { "error": "E-mail já cadastrado", "code": "email_taken" }
Error 422 (genérico):   { "error": "<mensagem>", "code": "unprocessable_entity" }
```

> **Nota:** O JWT vem TANTO no header `Authorization: Bearer <token>` quanto no body como `token`. Use o do body — é mais simples. O axios não expõe headers por padrão sem `expose: ["Authorization"]` no CORS do backend.

---

### Implementação de `src/lib/auth-token.ts`

```typescript
// Variável privada de módulo — nunca exposta fora deste arquivo
let _token: string | null = null;

export const getToken = (): string | null => _token;
export const setToken = (token: string): void => { _token = token; };
export const clearToken = (): void => { _token = null; };
```

---

### Implementação de `src/lib/api-client.ts`

```typescript
import axios from 'axios';
import { getToken, clearToken } from './auth-token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // necessário para cookies httpOnly (futura story de refresh)
});

// Request interceptor: injeta JWT
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: 401 → logout
// NOTA: Sem retry de refresh por enquanto — backend não tem o endpoint
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      // Importar e chamar clearAuth do authStore aqui causaria importação circular
      // Use o evento customizado para desacoplar
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
```

> **Padrão para evitar importação circular:** O `api-client.ts` não deve importar `authStore.ts` diretamente (causaria circular dependency). Use `window.dispatchEvent(new CustomEvent('auth:unauthorized'))` no interceptor, e escute esse evento no `AppProviders.tsx` ou no `authStore` para chamar `clearAuth()` e redirecionar.

---

### Implementação de `src/stores/authStore.ts`

```typescript
import { create } from 'zustand';

interface AuthUser {
  id: number;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ isAuthenticated: true, user }),
  clearAuth: () => set({ isAuthenticated: false, user: null }),
}));
```

---

### Implementação de `src/features/auth/authService.ts`

```typescript
import { apiClient } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { useAuthStore } from '@/stores/authStore';

interface LoginPayload { email: string; password: string; }
interface RegisterPayload { email: string; password: string; password_confirmation: string; terms_accepted: boolean; }
interface AuthResponse { token: string; user: { id: number; email: string } }

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', { user: payload });
  setToken(data.token);
  useAuthStore.getState().setUser(data.user);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', { user: payload });
  setToken(data.token);
  useAuthStore.getState().setUser(data.user);
  return data;
}
```

> **Nota:** `useAuthStore.getState().setUser()` é a forma de chamar ações Zustand fora de componentes React. Correto para services.

---

### Estrutura de pastas esperada ao final desta story

```
src/
  features/
    landing/
      LandingPage.tsx
    auth/
      LoginPage.tsx
      RegisterPage.tsx
      authService.ts
    app/
      map/
        MapPage.tsx           ← placeholder simples
  lib/
    auth-token.ts
    api-client.ts
    query-client.ts
  stores/
    authStore.ts
  router/
    index.tsx
  providers/
    AppProviders.tsx
  types/                      ← vazio por enquanto (para tipos globais futuros)
  hooks/                      ← vazio por enquanto
  components/                 ← apenas utils existentes
    ui/                       ← shadcn components
  index.css                   ← com tokens neo-brutalistas adicionados
  main.tsx                    ← usa AppProviders
```

---

### Roteamento (`src/router/index.tsx`)

```typescript
import { createBrowserRouter, redirect } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';

const LandingPage  = lazy(() => import('@/features/landing/LandingPage'));
const LoginPage    = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const MapPage      = lazy(() => import('@/features/app/map/MapPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Suspense fallback={null}><LandingPage /></Suspense>,
  },
  {
    path: '/login',
    element: <Suspense fallback={null}><LoginPage /></Suspense>,
  },
  {
    path: '/register',
    element: <Suspense fallback={null}><RegisterPage /></Suspense>,
  },
  {
    path: '/app/map',
    element: <Suspense fallback={null}><MapPage /></Suspense>,
  },
]);
```

> **Nota:** Rotas protegidas com `ProtectedRoute` serão implementadas em story futura. Por ora, `/app/map` é acessível a todos (é apenas um placeholder).

---

### Design — Landing Page

A landing page deve usar os tokens neo-brutalistas da arquitetura:

```css
/* Adicionar em src/index.css */
:root {
  --color-primary: #F2CF1D;
  --color-primary-dark: #F2BD1D;
  --color-dark: #403208;
  --color-black: #0D0D0D;
}
```

Estilo neo-brutalista: bordas sólidas pretas, sombras offset (`4px 4px 0 #0D0D0D`), fundo escuro `#0D0D0D`, amarelo `#F2CF1D` para destaques. Usar classes Tailwind com `bg-[#0D0D0D]`, `text-[#F2CF1D]`, etc.

---

### Formulários — Schemas Zod

**Login:**
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});
export type LoginFormData = z.infer<typeof loginSchema>;
```

**Register:**
```typescript
export const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  password_confirmation: z.string(),
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os termos de uso para continuar' }),
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'As senhas não coincidem',
  path: ['password_confirmation'],
});
export type RegisterFormData = z.infer<typeof registerSchema>;
```

---

### Tratamento de erros da API nos formulários

O backend retorna o campo `code` para identificar o tipo de erro. Usar no formulário:

```typescript
// No catch do submit handler
if (error.response?.status === 401) {
  form.setError('root', { message: 'E-mail ou senha incorretos' });
}
if (error.response?.status === 422) {
  const code = error.response.data?.code;
  if (code === 'email_taken') {
    form.setError('email', { message: 'Este e-mail já está em uso' });
  } else if (code === 'terms_required') {
    form.setError('terms_accepted', { message: 'Você precisa aceitar os termos de uso para continuar' });
  } else {
    form.setError('root', { message: error.response.data?.error || 'Erro ao processar o cadastro' });
  }
}
```

---

### Evento de unauthorized no AppProviders

```typescript
// src/providers/AppProviders.tsx
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/lib/query-client';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';

export function AppProviders() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    const handler = () => {
      clearAuth();
      router.navigate('/login');
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

---

### Stack e versões em uso (verificadas no package.json)

| Pacote | Versão |
|---|---|
| react | 19.2.4 |
| react-router-dom | 7.14.0 |
| @tanstack/react-query | 5.96.2 |
| zustand | 5.0.12 |
| axios | 1.14.0 |
| zod | 4.3.6 |
| react-hook-form | 7.72.1 |
| @hookform/resolvers | 5.2.2 |
| tailwindcss | 4.x |

**Alias de path configurado:** `@` → `./src/` (em `vite.config.ts` e `tsconfig.json`)

**Font:** Geist Variable (`@fontsource-variable/geist`) — já instalada e importada em `index.css`

---

### Project Structure Notes

- **NÃO** usar `src/App.tsx` — será removido e substituído pela arquitetura de features
- **NÃO** importar o `router` diretamente no `main.tsx` — usar `AppProviders` como ponto de entrada
- **NÃO** armazenar o JWT no Zustand store, localStorage ou sessionStorage — somente em `auth-token.ts`
- **NÃO** fazer imports circulares entre `api-client.ts` e `authStore.ts` — usar o padrão de CustomEvent descrito acima
- O alias `@` já está configurado no Vite e no TypeScript — usar em todos os imports

### References

- Contratos de API: `garagedom-api/app/controllers/api/v1/sessions_controller.rb`, `registrations_controller.rb`
- Arquitetura: `_bmad-output/planning-artifacts/architecture.md` — seções "Autenticação & Segurança", "API & Comunicação", "Arquitetura Frontend"
- Epics: `_bmad-output/planning-artifacts/epics.md` — Epic 1 Stories 1.1-1.3, Epic 2 Stories 2.1-2.2
- Backend routes: `garagedom-api/config/routes.rb`
- Stack atual: `package.json`, `vite.config.ts`, `tsconfig.json`

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Build erro em RegisterPage.tsx: `z.literal(true, { errorMap: ... })` → incompatível com zod v4 (campo `errorMap` não existe; `true` literal é incompatível com `boolean` do checkbox). Corrigido para `z.boolean().refine(val => val === true, { message })`.

### Completion Notes List

- AC1: Diretórios criados: `src/features/`, `src/lib/`, `src/stores/`, `src/hooks/`, `src/router/`, `src/providers/`, `src/types/`
- AC2: `src/lib/auth-token.ts` — singleton JWT em variável de módulo privada, nunca persiste em storage
- AC3: `src/lib/api-client.ts` — Axios com interceptor de request (injeção JWT) e interceptor de response (401 → clearToken + CustomEvent `auth:unauthorized`). Sem retry de refresh (backend não implementado)
- AC4: `src/stores/authStore.ts` — Zustand store com `isAuthenticated`, `user`, `setUser()`, `clearAuth()`. JWT nunca no store
- AC5: `src/lib/query-client.ts` — TanStack Query com `staleTime: 60_000` e retry=false para 401
- AC6: `src/router/index.tsx` — `createBrowserRouter` com rotas `/`, `/login`, `/register`, `/app/map`. Redirect de autenticados via check no componente
- AC7: `src/providers/AppProviders.tsx` — `QueryClientProvider` > `RouterProvider`. Listener para `auth:unauthorized` → `clearAuth()` + navigate
- AC8: `src/features/landing/LandingPage.tsx` — GarageDom, tagline, CTAs Entrar/Criar conta com design neo-brutalista (#0D0D0D, #F2CF1D, bordas sólidas, sombras offset)
- AC9: `src/features/auth/LoginPage.tsx` — React Hook Form + Zod, POST /api/v1/auth/login, loading state, erro 401 → "E-mail ou senha incorretos"
- AC10: `src/features/auth/RegisterPage.tsx` — formulário com email/senha/confirmação/checkbox termos, erro 422/email_taken → campo email, erro terms_required → checkbox
- AC11: `.env.example` com `VITE_API_URL` documentado. `.env.local` criado (coberto por `*.local` no `.gitignore`)
- AC12: `npm run build` — 213 módulos, 0 erros TypeScript strict, 0 warnings
- **Nota:** Sem framework de testes unitários configurado no projeto. Validação via `tsc --noEmit` e `npm run build` (TypeScript strict). Framework de testes (Vitest) deve ser adicionado em story futura.

### File List

- `src/lib/auth-token.ts` — criado
- `src/lib/api-client.ts` — criado
- `src/lib/query-client.ts` — criado
- `src/stores/authStore.ts` — criado
- `src/router/index.tsx` — criado
- `src/providers/AppProviders.tsx` — criado
- `src/features/landing/LandingPage.tsx` — criado
- `src/features/auth/LoginPage.tsx` — criado
- `src/features/auth/RegisterPage.tsx` — criado
- `src/features/auth/authService.ts` — criado
- `src/features/app/map/MapPage.tsx` — criado
- `src/main.tsx` — modificado (substituído App por AppProviders)
- `src/index.css` — modificado (tokens neo-brutalistas adicionados, CSS starter removido)
- `src/App.tsx` — removido
- `src/App.css` — removido
- `.env.example` — criado
- `.env.local` — criado (não commitado)

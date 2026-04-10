---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-04-05'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
workflowType: 'architecture'
project_name: 'garagedom'
user_name: 'GarageDom'
date: '2026-04-05'
---

# Architecture Decision Document

_Este documento se constrói de forma colaborativa através de descoberta passo a passo. As seções são adicionadas conforme trabalhamos juntos em cada decisão arquitetural._

## Análise de Contexto do Projeto

### Visão Geral dos Requisitos

**Requisitos Funcionais:**

43 FRs organizados em 9 módulos com dependências sequenciais:

| Módulo | FRs | Complexidade Arquitetural |
|---|---|---|
| Autenticação | FR01–FR06 | Alta — JWT em memória, OAuth via callback, refresh silencioso |
| Perfis e Identidade | FR07–FR11 | Média — upload assíncrono, controle de visibilidade LGPD |
| Mapa e Descoberta | FR12–FR16 | Alta — Leaflet + clustering, lazy loading, pins com imagens reais |
| Conexões | FR17–FR20 | Média — state machine de conexão, notificações in-app |
| Workflow de Propostas | FR21–FR26 | Alta — multi-iniciador adaptado por profile_type, state machine |
| Comunicação em Tempo Real | FR27–FR32 | Alta — ActionCable, reconexão, isolamento de falha, denúncias |
| Mini Landing Pages | FR33–FR36 | Alta — builder de blocos, SSR/pré-renderização para SEO |
| Administração | FR37–FR40 | Baixa-Média — dashboard, moderação, resolução de denúncias |
| Navegação Global | FR41–FR43 | Média — menu contextual por perfil, estados de UI, refresh token |

**Requisitos Não-Funcionais que Dirigem Arquitetura:**

- **Performance:** FCP < 1.0s / LCP < 2.5s / INP < 100ms / bundle JS < 200KB gzipped → code splitting por rota obrigatório, Leaflet via lazy loading
- **Segurança:** JWT em memória (não localStorage/sessionStorage), WebSocket autenticado no handshake, sanitização de conteúdo gerado por usuário, CORS restrito
- **Escalabilidade:** 500 usuários MVP → expansão nacional sem refatoração; mapa suporta até 5.000 pins com clustering obrigatório acima de 200 pins
- **Acessibilidade:** WCAG 2.1 AA — navegação por teclado, ARIA, contraste mínimo, foco visível
- **Conformidade LGPD:** Aceite explícito no cadastro, controle de visibilidade do pin, exclusão em 2 etapas com feedback, sistema de denúncia

**Escala e Complexidade:**

- Domínio primário: Frontend SPA (React + Vite) com rendering híbrido (SPA + pré-renderização/SSR)
- Nível de complexidade: **Alta**
- Componentes arquiteturais estimados: 10 módulos principais
- Backend: Rails API já definido e aprovado — não negociável, consumido via HTTP REST + ActionCable

### Restrições e Dependências Técnicas

- **Backend Rails API** (`/api/v1/`): contratos já definidos — frontend consome REST JSON simples (sem envelope, sem JSON:API spec)
- **ActionCable**: WebSocket com autenticação via `token=` no handshake — não há controle sobre o protocolo do servidor
- **Leaflet**: mapa open source sem dependência de API key — clustering obrigatório, lazy loading por restrição de bundle
- **OAuth**: fluxo de redirecionamento via backend — frontend recebe JWT no retorno via callback, sem SDK de OAuth no frontend
- **Desktop-first**: viewport mínimo 1280px — mobile e tablet fora do escopo MVP
- **Dev solo full-stack**: arquitetura deve minimizar complexidade acidental — soluções simples e diretas preferidas sobre abstrações especulativas

### Cross-Cutting Concerns Identificados

1. **Autenticação e Sessão:** JWT em memória com refresh silencioso afeta todas as chamadas HTTP e a conexão WebSocket — necessita de interceptor centralizado e store de autenticação
2. **Gerenciamento de WebSocket:** Ciclo de vida da conexão ActionCable (conectar, desconectar, reconectar com backoff) compartilhado entre chat e notificações — deve ser isolado do restante da UI
3. **Autorização por `profile_type`:** Roteamento protegido, menus condicionais, formulários adaptativos — lógica de permissão deve ser centralizada e reutilizável
4. **Estados de UI (loading / erro / vazio):** FR42 exige que TODOS os fluxos críticos tenham os três estados — padrão de componente deve ser definido e aplicado globalmente
5. **Rendering Híbrido:** SPA para `/app/*` vs pré-renderização/SSR para `/l/:slug` e `/` — decisão de infraestrutura com impacto no setup do projeto Vite
6. **Sanitização de Conteúdo:** Todo conteúdo gerado por usuário (mensagens de chat, bio, landing page) deve ser sanitizado antes de renderização — solução única centralizada

## Avaliação de Starter Template

### Domínio Tecnológico Primário

Web Application — SPA frontend-only (React + Vite) consumindo Rails API existente.
Rendering híbrido: SPA para `/app/*`, pré-renderização estática para `/` e `/l/:slug`.

### Starters Avaliados

- **`npm create vite@latest` (react-ts)**: oficial, mínimo, zero overhead — recomendado
- **vite-react-boilerplate (RicardoValdovinos)**: inclui i18n e Docker, excessivo para dev solo
- **Create T3 App**: full-stack (Next.js + tRPC), inadequado para SPA frontend-only

### Starter Selecionado: `npm create vite@latest` — react-ts

**Justificativa:**
Stack já definida no PRD (React + Vite). Base oficial mínima com TypeScript configurado, Vite 8 (Rolldown integrado). Dev solo com API backend definida não se beneficia de boilerplates opinados — cada adição será intencional e justificada pelos requisitos.

**Comando de Inicialização:**

```bash
npm create vite@latest garagedom-web -- --template react-ts
cd garagedom-web
npm install
```

**Decisões Arquiteturais Fornecidas pelo Starter:**

**Linguagem & Runtime:**
- TypeScript 6.0 — strict mode habilitado por padrão, ES modules nativo
- React 19.2 — plenamente compatível com toda a stack selecionada

**Build Tooling:**
- Vite 8 com Rolldown bundler — Node.js 20.19+ requerido
- HMR (Hot Module Replacement) nativo
- Code splitting por rota: configurado manualmente via `React.lazy` + `Suspense`

**Estrutura de Projeto (a ser organizada):**
```
src/
  features/        # módulos por domínio (auth, map, proposals, chat...)
  components/      # componentes compartilhados (UI primitives)
  hooks/           # hooks globais (useAuth, useWebSocket, useProfile)
  lib/             # clientes HTTP, ActionCable, utilitários
  stores/          # Zustand stores
  router/          # React Router v7 — definição de rotas e guards
  types/           # tipos TypeScript globais
```

**Dependências Core a Adicionar (versões verificadas abril 2026):**

| Pacote | Versão | Finalidade |
|---|---|---|
| react-router-dom | 7.14.0 | Roteamento SPA + rotas protegidas por profile_type |
| @tanstack/react-query | 5.96.2 | Cache de dados do servidor, estados loading/erro/vazio |
| zustand | 5.0.12 | Estado global (auth, notificações, WebSocket status) |
| tailwindcss | 4.1 | Estilização — config via CSS (breaking change vs v3) |
| shadcn/ui | CLI v4 | Componentes acessíveis (WCAG 2.1 AA base) |
| leaflet + react-leaflet | 5.0.0 | Mapa interativo — importado via lazy() |
| @rails/actioncable | latest | WebSocket ActionCable — cliente oficial Rails |
| dompurify | 3.3.3 | Sanitização de conteúdo gerado por usuário |
| axios | latest | Cliente HTTP com interceptor de JWT |

**Experiência de Desenvolvimento:**
- TypeScript strict: erros de tipo em tempo de desenvolvimento
- Vite dev server com HMR < 100ms
- Testing: Vitest (unit) + Playwright (E2E) — adicionados manualmente

**Nota:** Inicialização do projeto com este comando deve ser a primeira história de implementação.

## Decisões Arquiteturais Core

### Análise de Prioridade de Decisões

**Decisões Críticas (bloqueiam implementação):**
- Estratégia JWT em memória + refresh token
- Arquitetura do cliente ActionCable
- Estratégia de rendering híbrido para SEO
- Organização do cliente HTTP e interceptores

**Decisões Importantes (moldam a arquitetura):**
- Separação de estado global (Zustand vs TanStack Query)
- Validação de contratos de API (Zod)
- Estratégia de proteção de rotas por profile_type
- Padrão de tratamento de erros e estados de UI

**Decisões Adiadas (pós-MVP):**
- PWA / service workers
- Internacionalização
- Monitoramento de erros (Sentry)

---

### Autenticação & Segurança

**JWT em Memória:**
- Decisão: Singleton de módulo `src/lib/auth-token.ts` — variável privada de módulo com `getToken()` / `setToken()` / `clearToken()`
- Refresh token: httpOnly cookie gerenciado pelo Rails (nunca acessível via JS)
- Zustand store `useAuthStore`: armazena apenas estado de UI (isAuthenticated, user.id, profile_type, nome) — nunca o token bruto
- Rationale: Separação limpa entre segurança (módulo singleton) e UI (Zustand). Axios interceptor importa `getToken()` diretamente sem causar re-renders. Refresh token em cookie httpOnly é imune a XSS.

**Proteção de Rotas:**
- `<ProtectedRoute>` verifica `isAuthenticated` no Zustand store
- `<ProfileRoute allowedTypes={['band', 'venue', 'producer']}>` verifica `profile_type`
- Ambos redirecionam para `/login` ou `/app/dashboard` conforme o caso
- Guards implementados como componentes wrapper no `createBrowserRouter`

**WebSocket Authentication:**
- Conexão ActionCable inclui `token=<jwt>` na query string do handshake
- Token obtido via `getToken()` no momento da conexão
- Se token expirar durante sessão: reconexão após refresh silencioso

---

### API & Comunicação

**Cliente HTTP:**
- `src/lib/api-client.ts` — instância Axios com `baseURL: import.meta.env.VITE_API_URL`
- Interceptor de request: injeta `Authorization: Bearer <token>` via `getToken()`
- Interceptor de response: captura 401 → chama `POST /api/v1/auth/refresh` → atualiza token → retry da request original (máx 1 retry)
- Erros de rede/timeout → lança `ApiError` tipado com `code` e `message`

**Validação de Contratos de API:**
- Decisão: Zod para parsing e validação de respostas da API em runtime
- Schemas em `src/lib/schemas/` por domínio (auth, profile, proposal, etc.)
- Falha de validação = erro capturado pelo TanStack Query → estado de erro na UI
- Rationale: Com TypeScript strict, erros de contrato Rails↔React detectados cedo no desenvolvimento; Zod infere tipos automaticamente

**ActionCable — Arquitetura:**
- Decisão: Context Provider singleton `ActionCableProvider` na raiz da app
- `src/lib/action-cable.ts` cria o consumer ActionCable uma única vez
- Hook `useChannel(channelName, params, callbacks)` para inscrição por componente
- Reconexão automática com backoff exponencial (500ms → 1s → 2s → 4s → max 30s)
- Indicador visual de status de conexão (`useConnectionStatus()`) para o chat
- Isolamento: falha do WebSocket não propaga para o restante da UI
- Rationale: Singleton evita múltiplas conexões WebSocket. Context permite que qualquer componente se inscreva sem prop drilling.

---

### Arquitetura Frontend

**Separação de Estado Global:**

| Tipo de estado | Solução | Exemplos |
|---|---|---|
| Estado de servidor | TanStack Query | perfis, propostas, conexões, mensagens, pins do mapa |
| Estado global de UI | Zustand | auth state, status WebSocket, notificações não-lidas |
| Estado local de UI | React state | modais, form state, dropdowns |

**Roteamento:**
- React Router v7 com `createBrowserRouter` (Data API Router)
- Rotas organizadas em `src/router/index.tsx` com lazy loading por feature
- Estrutura:
  ```
  /                      → landing page (estática no Hostinger)
  /login, /register      → rotas públicas
  /app/*                 → ProtectedRoute (requer auth)
  /app/map               → feature: mapa
  /app/proposals/*       → feature: propostas
  /app/chat/*            → feature: chat
  /app/profile/*         → feature: perfil
  /app/admin/*           → ProfileRoute (apenas admin)
  /l/:slug               → NÃO no React — servido pelo Rails (ver rendering híbrido)
  ```

**Padrão de Estados de UI (FR42):**
- Componente `<AsyncState>` wrapper reutilizável: recebe `isLoading`, `isError`, `isEmpty`, `error` e `children` — renderiza loading skeleton, mensagem de erro com ação de retry, ou estado vazio com CTA conforme o estado
- `ErrorBoundary` por feature (não global) — isola falhas sem quebrar a app inteira
- Zero telas em branco em produção

**Bundle Optimization:**
- Code splitting por rota via `React.lazy()` + `Suspense` em todas as rotas do `/app/*`
- Leaflet importado exclusivamente via `React.lazy()` — nunca no bundle inicial
- Target: bundle JS inicial < 200KB gzipped (medido no CI com `vite-bundle-analyzer`)

---

### Rendering Híbrido & SEO

**Estratégia:**

| Rota | Solução | Justificativa |
|---|---|---|
| `/app/*` | SPA React (client-side) | Sem requisito de SEO; performance máxima |
| `/` | HTML estático no Hostinger | Landing page de marketing — arquivo estático |
| `/l/:slug` | Rails renderiza server-side | Slug dinâmico (1 por usuário), criado em runtime; Rails já tem o dado |

**Detalhamento `/l/:slug`:**
- Builder de blocos (FR33-FR34) é feature React autenticada em `/app/landing-page/edit`
- Dados dos blocos salvos na Rails API (`POST/PUT /api/v1/landing-pages`)
- View pública `/l/:slug` é uma rota Rails que renderiza HTML com `<title>`, `og:title`, `og:image`, `og:description` dinâmicos e conteúdo dos blocos sem dependência de JavaScript para indexação
- Preview em tempo real (FR34): componente de preview React dentro do builder (não iframe para `/l/:slug`)
- Rationale: Elimina necessidade de Node.js SSR no Hostinger. Rails com Kamal já gerencia o VPS — zero infraestrutura adicional para SEO.

---

### Infraestrutura & Deploy

**Frontend — Hostinger:**
- Build: `vite build` → gera `dist/` com arquivos estáticos
- Deploy: upload de `dist/` para Hostinger (shared hosting ou VPS com nginx)
- Configuração nginx (se VPS): `try_files $uri /index.html` para SPA routing
- Variáveis de ambiente: `VITE_API_URL`, `VITE_CABLE_URL` injetadas no build

**Backend — Kamal + VPS:**
- Rails API + ActionCable no mesmo servidor Kamal
- CORS: `allowed_origins: [<domínio Hostinger>]`
- ActionCable allowed origins: `config.action_cable.allowed_request_origins = [<domínio Hostinger>]`

**CI/CD:**
- GitHub Actions: lint (ESLint) → typecheck (tsc --noEmit) → test (Vitest) → build → deploy para Hostinger (via FTP/rsync ou Hostinger API)
- Pipeline simples para dev solo — sem ambientes de staging no MVP

**Testing:**
- Vitest: unitários e integração para hooks, stores, utilitários
- Playwright: E2E nos fluxos críticos (cadastro, upload logo, mapa, proposta, chat)
- Foco nos fluxos do FR42 — cobertura de estados loading/erro/vazio

---

### Análise de Impacto das Decisões

**Sequência de Implementação (dependências arquiteturais):**
1. Setup Vite + TypeScript + estrutura de pastas + ESLint + Tailwind v4
2. Cliente HTTP (axios) + auth-token singleton + Zustand auth store
3. React Router v7 + ProtectedRoute + ProfileRoute
4. TanStack Query setup + padrão AsyncState
5. ActionCableProvider + useChannel hook
6. Features por módulo (auth → perfil → mapa → conexões → propostas → chat → admin)

**Dependências Cross-Component:**
- ActionCable depende de auth (token no handshake) → implementar após auth
- Mapa depende de perfis (para exibir pins) → implementar após perfis
- Propostas dependem de conexões (banda+banda) → implementar após conexões
- Chat depende de ActionCable + propostas (chat iniciado de proposta)

## Padrões de Implementação & Regras de Consistência

### Pontos de Conflito Identificados

7 áreas críticas onde agentes IA podem fazer escolhas diferentes e causar conflitos:
convenções de nome, transformação snake_case↔camelCase, estrutura de features,
query keys do TanStack Query, formato de erros, padrão de componentes assíncronos,
e nomeação de canais ActionCable.

---

### Padrões de Nomenclatura

**Arquivos e Diretórios:**
```
PascalCase     → componentes React:     UserCard.tsx, MapPin.tsx
camelCase      → hooks:                 useAuth.ts, useChannel.ts
camelCase      → utilitários/lib:       apiClient.ts, authToken.ts
camelCase      → stores Zustand:        authStore.ts, notificationStore.ts
camelCase      → schemas Zod:           profileSchema.ts, proposalSchema.ts
kebab-case     → arquivos de config:    vite.config.ts, tailwind.config.ts
PascalCase/    → features (pasta):      features/Auth/, features/Map/
```

**Código TypeScript:**
```typescript
// Componentes: PascalCase
export function UserCard() {}
export function MapPin() {}

// Hooks: prefixo "use" + camelCase
export function useAuth() {}
export function useChannel() {}

// Stores Zustand: "use" + Noun + "Store"
export const useAuthStore = create(...)
export const useNotificationStore = create(...)

// Tipos e Interfaces: PascalCase, sem prefixo "I"
type UserProfile = { ... }          // ✅
interface ProposalFormData { ... }  // ✅
interface IUserProfile { ... }      // ❌ proibido

// Schemas Zod: noun + "Schema"
const profileSchema = z.object(...)
const proposalSchema = z.object(...)

// Constantes globais: SCREAMING_SNAKE_CASE
const MAX_MAP_PINS = 5000
const CABLE_RECONNECT_MAX_MS = 30000

// Query keys TanStack Query: arrays aninhados por domínio
const profileKeys = {
  all: ['profiles'] as const,
  detail: (id: string) => ['profiles', id] as const,
  map: () => ['profiles', 'map'] as const,
}
```

**Nomenclatura de Canais ActionCable:**
```
ChatChannel          → mensagens de um conversation_id
NotificationsChannel → notificações do usuário autenticado
```

---

### Transformação snake_case ↔ camelCase

**Regra crítica:** Rails API envia e espera snake_case. TypeScript usa camelCase.
A transformação acontece **exclusivamente na camada de API client**.

```typescript
// src/lib/api-client.ts — transformação centralizada

// ✅ Correto: tipo TypeScript sempre em camelCase
type UserProfile = {
  profileType: 'band' | 'venue' | 'producer'
  genreMusic: string
  isVisible: boolean
}

// ✅ Correto: schema Zod faz a transformação
const profileSchema = z.object({
  profile_type: z.enum(['band', 'venue', 'producer']),
  genre_music: z.string(),
  is_visible: z.boolean(),
}).transform(data => ({
  profileType: data.profile_type,
  genreMusic: data.genre_music,
  isVisible: data.is_visible,
}))

// ❌ Proibido: snake_case em tipos TypeScript
type UserProfile = { profile_type: string }   // nunca
```

---

### Estrutura de Features

**Cada feature segue a mesma estrutura interna:**
```
features/
  Auth/
    index.ts              # re-exporta API pública da feature
    components/
      LoginForm.tsx
      LoginForm.test.tsx  # testes co-localizados
      RegisterForm.tsx
    hooks/
      useLogin.ts
      useLogin.test.ts
    schemas/
      authSchema.ts
    types.ts
  Map/
    index.ts
    components/
      MapView.tsx
      MapPin.tsx
      MapFilters.tsx
    hooks/
      useMapPins.ts
    types.ts
```

**Regras de estrutura:**
- `index.ts` de cada feature exporta APENAS o que outros módulos precisam
- Componentes internos de uma feature NÃO são importados diretamente por outras features
- Acesso cross-feature sempre via `features/FeatureName/index.ts`
- Testes co-localizados: `ComponentName.test.tsx` ao lado de `ComponentName.tsx`

---

### Padrão de Componentes Assíncronos

**Toda busca de dados usa o wrapper `<AsyncState>`:**

```tsx
// ✅ Padrão obrigatório para dados do servidor
function ProposalList() {
  const { data, isLoading, isError, error } = useProposals()

  return (
    <AsyncState
      isLoading={isLoading}
      isError={isError}
      isEmpty={data?.length === 0}
      error={error}
      loadingFallback={<ProposalListSkeleton />}
      emptyFallback={<EmptyState message="Nenhuma proposta ainda" cta="Criar proposta" />}
    >
      {data?.map(p => <ProposalCard key={p.id} proposal={p} />)}
    </AsyncState>
  )
}

// ❌ Proibido: condicionais manuais sem padrão
if (isLoading) return <div>Carregando...</div>
if (isError) return <div>Erro</div>
if (!data) return null
```

**Props de componentes: interface nomeada `ComponentNameProps`:**
```tsx
// ✅ Correto
interface UserCardProps {
  userId: string
  showActions?: boolean
}
export function UserCard({ userId, showActions = true }: UserCardProps) {}

// ❌ Proibido: props inline ou tipo genérico
export function UserCard(props: { userId: string }) {}
```

---

### Padrão de Formulários

**Todos os formulários usam React Hook Form + Zod:**
```tsx
// ✅ Padrão obrigatório
const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})
type FormData = z.infer<typeof schema>

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
}

// ❌ Proibido: validação manual ou useState para form fields
const [email, setEmail] = useState('')
const [emailError, setEmailError] = useState('')
```

**Dependências adicionais:** `react-hook-form` + `@hookform/resolvers` + `zod`

---

### Padrão de Tratamento de Erros

**Tipo `ApiError` centralizado:**
```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    public code: string,      // 'UNAUTHORIZED', 'NOT_FOUND', 'VALIDATION_ERROR'
    public message: string,
    public status: number,
    public details?: unknown
  ) { super(message) }
}

// Mapeamento para mensagens de UI (português, sem jargão técnico)
export const API_ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  NOT_FOUND: 'Conteúdo não encontrado.',
  VALIDATION_ERROR: 'Verifique os campos e tente novamente.',
  NETWORK_ERROR: 'Sem conexão. Verifique sua internet.',
}
```

**ErrorBoundary por feature (não global):**
```tsx
<ErrorBoundary fallback={<FeatureErrorState onRetry={retry} />}>
  <MapView />
</ErrorBoundary>
```

---

### Padrão de Stores Zustand

**Cada store tem estrutura previsível:**
```typescript
// ✅ Padrão de store
interface AuthState {
  // Estado (substantivos)
  isAuthenticated: boolean
  user: AuthUser | null
  profileType: ProfileType | null
  // Ações (verbos)
  setUser: (user: AuthUser) => void
  clearAuth: () => void
}

// Seletores fora do store para evitar re-renders desnecessários
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectProfileType = (state: AuthState) => state.profileType
```

---

### Diretrizes de Conformidade

**Todo agente IA DEVE:**
- Usar `<AsyncState>` wrapper em qualquer componente que consuma dados do servidor
- Nomear props interfaces como `ComponentNameProps`
- Definir query keys usando o padrão de objeto `{ all, detail, list }` por domínio
- Transformar snake_case↔camelCase exclusivamente no `api-client.ts` ou schemas Zod
- Co-localizar testes com os arquivos testados (`Foo.test.tsx` ao lado de `Foo.tsx`)
- Usar `ApiError` tipado — nunca fazer `catch(e: any)`
- Importar de features sempre via `index.ts` — nunca direto do arquivo interno
- Usar React Hook Form + Zod em todos os formulários

**Anti-padrões proibidos:**
```typescript
// ❌ useState para dados do servidor
const [profiles, setProfiles] = useState([])
useEffect(() => fetch('/api/profiles').then(...), [])

// ❌ Validação manual de formulário
if (!email.includes('@')) setError('email inválido')

// ❌ snake_case em tipos TypeScript
type Profile = { profile_type: string; genre_music: string }

// ❌ Import cruzado direto entre features
import { MapPin } from '../Map/components/MapPin'  // nunca
import { MapPin } from '../Map'                     // correto
```

## Estrutura do Projeto & Fronteiras Arquiteturais

### Árvore Completa do Projeto

```
garagedom-web/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── components.json              # shadcn/ui config
├── .env.example                 # VITE_API_URL, VITE_CABLE_URL
├── .env.local                   # git-ignored
├── .gitignore
├── eslint.config.ts
├── tailwind.css                 # Tailwind v4 — config via CSS
├── playwright.config.ts
├── vitest.config.ts
├── .github/
│   └── workflows/
│       └── ci.yml               # lint → typecheck → test → build → deploy
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── e2e/                         # Playwright — fluxos críticos
│   ├── auth.spec.ts             # FR01-FR06
│   ├── profile.spec.ts          # FR07-FR11
│   ├── map.spec.ts              # FR12-FR16
│   ├── proposals.spec.ts        # FR21-FR26
│   └── chat.spec.ts             # FR27-FR32
│
└── src/
    ├── main.tsx                 # entry point — monta App + Providers
    ├── App.tsx                  # providers wrapper (Query, ActionCable, Router)
    ├── index.css                # Tailwind v4 directives
    │
    ├── router/
    │   ├── index.tsx            # createBrowserRouter — todas as rotas
    │   ├── ProtectedRoute.tsx   # FR43 — verifica isAuthenticated
    │   └── ProfileRoute.tsx     # FR41 — verifica profile_type
    │
    ├── lib/
    │   ├── api-client.ts        # axios instance + interceptors JWT + retry 401
    │   ├── auth-token.ts        # JWT singleton em memória (getToken/setToken/clear)
    │   ├── action-cable.ts      # ActionCable consumer singleton
    │   ├── query-client.ts      # TanStack Query client config (staleTime, gcTime)
    │   ├── errors.ts            # ApiError class + API_ERROR_MESSAGES
    │   ├── utils.ts             # utilitários compartilhados
    │   └── schemas/             # Zod schemas com transformação snake→camel
    │       ├── auth.ts
    │       ├── profile.ts
    │       ├── proposal.ts
    │       ├── connection.ts
    │       ├── chat.ts
    │       ├── notification.ts
    │       └── landingPage.ts
    │
    ├── stores/
    │   ├── authStore.ts         # isAuthenticated, user, profileType
    │   ├── notificationStore.ts # notificações não-lidas (FR30-FR31)
    │   └── wsStatusStore.ts     # status da conexão ActionCable
    │
    ├── providers/
    │   ├── ActionCableProvider.tsx  # singleton consumer + reconnect backoff
    │   └── AppProviders.tsx         # composição de todos os providers
    │
    ├── hooks/
    │   ├── useAuth.ts           # wrapper de authStore + api-client
    │   ├── useChannel.ts        # inscrição em canal ActionCable
    │   └── useConnectionStatus.ts # status WS para indicador visual no chat
    │
    ├── components/              # componentes compartilhados
    │   ├── ui/                  # shadcn/ui — gerado pelo CLI
    │   ├── AsyncState.tsx       # FR42 — wrapper loading/erro/vazio
    │   ├── AsyncState.test.tsx
    │   ├── ErrorBoundary.tsx    # FR42 — por feature
    │   ├── EmptyState.tsx
    │   └── LoadingSkeleton.tsx
    │
    ├── types/
    │   ├── profile.ts
    │   ├── proposal.ts
    │   ├── connection.ts
    │   ├── chat.ts
    │   └── index.ts             # re-exporta todos os tipos globais
    │
    └── features/
        ├── Auth/                           # FR01-FR06
        │   ├── index.ts
        │   ├── components/
        │   │   ├── LoginForm.tsx
        │   │   ├── LoginForm.test.tsx
        │   │   ├── RegisterForm.tsx
        │   │   ├── RegisterForm.test.tsx
        │   │   ├── OAuthCallback.tsx       # FR02-FR03
        │   │   ├── DeleteAccountModal.tsx  # FR05 — 2 etapas (LGPD)
        │   │   └── TermsAcceptance.tsx     # FR06 — checkbox obrigatório
        │   ├── hooks/
        │   │   ├── useLogin.ts
        │   │   ├── useRegister.ts
        │   │   └── useDeleteAccount.ts
        │   └── types.ts
        │
        ├── Profile/                        # FR07-FR11
        │   ├── index.ts
        │   ├── components/
        │   │   ├── ProfileForm.tsx
        │   │   ├── ProfileForm.test.tsx
        │   │   ├── LogoUpload.tsx          # FR08 — upload assíncrono
        │   │   ├── VisibilityToggle.tsx    # FR10 — controle LGPD
        │   │   ├── PublicProfile.tsx       # FR11
        │   │   └── ProfileCard.tsx
        │   ├── hooks/
        │   │   ├── useProfile.ts
        │   │   ├── useLogoUpload.ts
        │   │   └── usePublicProfile.ts
        │   └── types.ts
        │
        ├── Map/                            # FR12-FR16
        │   ├── index.ts
        │   ├── components/
        │   │   ├── MapView.tsx             # importado via React.lazy()
        │   │   ├── MapPin.tsx              # logo real + fallback iniciais
        │   │   ├── MapFilters.tsx          # FR14
        │   │   └── ProfilePopup.tsx        # FR13
        │   ├── hooks/
        │   │   ├── useMapPins.ts           # clustering acima de 200 pins
        │   │   └── useMapFilters.ts
        │   └── types.ts
        │
        ├── Connections/                    # FR17-FR20
        │   ├── index.ts
        │   ├── components/
        │   │   ├── ConnectionList.tsx
        │   │   ├── ConnectionInviteButton.tsx
        │   │   └── ConnectionCard.tsx
        │   ├── hooks/
        │   │   ├── useConnections.ts
        │   │   └── useConnectionActions.ts
        │   └── types.ts
        │
        ├── Proposals/                      # FR21-FR26
        │   ├── index.ts
        │   ├── components/
        │   │   ├── ProposalForm/
        │   │   │   ├── ProposalForm.tsx    # adapta por profile_type
        │   │   │   ├── BandFields.tsx      # FR21
        │   │   │   ├── VenueFields.tsx     # FR22
        │   │   │   └── ProducerFields.tsx  # FR23
        │   │   ├── ProposalList.tsx        # FR25
        │   │   ├── ProposalCard.tsx
        │   │   ├── ProposalDetail.tsx
        │   │   └── ProposalActions.tsx     # FR24, FR26
        │   ├── hooks/
        │   │   ├── useProposals.ts
        │   │   ├── useCreateProposal.ts
        │   │   └── useProposalActions.ts
        │   └── types.ts
        │
        ├── Chat/                           # FR27-FR32
        │   ├── index.ts
        │   ├── components/
        │   │   ├── ChatWindow.tsx
        │   │   ├── MessageList.tsx
        │   │   ├── MessageInput.tsx
        │   │   ├── MessageBubble.tsx
        │   │   ├── ConversationList.tsx
        │   │   ├── WsStatusBadge.tsx       # indicador de reconexão
        │   │   └── ReportMessageModal.tsx  # FR32
        │   ├── hooks/
        │   │   ├── useChat.ts
        │   │   ├── useChatChannel.ts
        │   │   └── useConversations.ts
        │   └── types.ts
        │
        ├── Notifications/                  # FR30-FR31
        │   ├── index.ts
        │   ├── components/
        │   │   ├── NotificationBell.tsx
        │   │   ├── NotificationList.tsx
        │   │   └── NotificationItem.tsx
        │   ├── hooks/
        │   │   ├── useNotifications.ts
        │   │   └── useNotificationsChannel.ts
        │   └── types.ts
        │
        ├── LandingPage/                    # FR33-FR36
        │   ├── index.ts
        │   ├── components/
        │   │   ├── LandingPageBuilder.tsx
        │   │   ├── LandingPagePreview.tsx  # FR34 — preview no builder
        │   │   └── blocks/
        │   │       ├── TextBlock.tsx
        │   │       ├── ImageBlock.tsx
        │   │       └── LinkBlock.tsx
        │   ├── hooks/
        │   │   ├── useLandingPage.ts
        │   │   └── useSaveLandingPage.ts
        │   └── types.ts
        │   # NOTA: view pública /l/:slug renderizada pelo Rails (SEO)
        │
        └── Admin/                          # FR37-FR40
            ├── index.ts
            ├── components/
            │   ├── AdminDashboard.tsx      # FR37
            │   ├── MetricsPanel.tsx
            │   ├── ModerationList.tsx      # FR38
            │   ├── ReportList.tsx          # FR39
            │   └── UserBlockModal.tsx      # FR40
            ├── hooks/
            │   ├── useAdminMetrics.ts
            │   ├── useModerationQueue.ts
            │   └── useReports.ts
            └── types.ts
```

### Fronteiras Arquiteturais

**Fronteira HTTP (Rails API):**
```
Único ponto de entrada: src/lib/api-client.ts
Base URL: VITE_API_URL
Endpoints: /api/v1/*
Formato: JSON snake_case → camelCase via schemas Zod
Auth: Bearer token via interceptor
```

**Fronteira WebSocket (ActionCable):**
```
Único ponto de conexão: src/lib/action-cable.ts + ActionCableProvider
Cable URL: VITE_CABLE_URL
Canais: ChatChannel (por conversation_id), NotificationsChannel (por user)
Auth: token= na query string do handshake
```

**Fronteira de Features:**
```
Regra: comunicação via src/features/FeatureName/index.ts
Proibido: import direto de arquivo interno de outra feature
Cross-feature: via stores Zustand ou TanStack Query invalidation
```

**Fronteira Rails (SEO):**
```
/l/:slug → Rails renderiza HTML server-side
Frontend salva dados em POST /api/v1/landing-pages
Rails lê e serve a view pública — zero React no caminho do SEO
```

### Mapeamento FRs → Estrutura

| FRs | Feature / Arquivo |
|---|---|
| FR01–FR06 | `features/Auth/` |
| FR07–FR11 | `features/Profile/` |
| FR12–FR16 | `features/Map/` (Leaflet via `React.lazy`) |
| FR17–FR20 | `features/Connections/` |
| FR21–FR26 | `features/Proposals/` |
| FR27–FR32 | `features/Chat/` + `features/Notifications/` |
| FR33–FR36 | `features/LandingPage/` (view pública: Rails) |
| FR37–FR40 | `features/Admin/` |
| FR41 | `src/router/` + `ProfileRoute.tsx` |
| FR42 | `src/components/AsyncState.tsx` + `ErrorBoundary.tsx` |
| FR43 | `src/lib/auth-token.ts` + `src/stores/authStore.ts` |

### Fluxo de Dados

```
Ação do usuário
  → TanStack Query mutation
    → src/lib/api-client.ts (interceptor injeta JWT)
      → Rails API /api/v1/*
        → Resposta JSON snake_case
          → Zod schema parse + transform → camelCase TypeScript type
            → TanStack Query cache → React component re-render

Evento WebSocket
  → ActionCableProvider recebe frame
    → useChannel callback
      → Zustand store update (notificationStore) OU
        TanStack Query cache invalidation → React component re-render
```

### Pontos de Integração Externa

| Serviço | Onde no código | Protocolo |
|---|---|---|
| Rails API | `src/lib/api-client.ts` | HTTP REST + JWT |
| ActionCable | `src/lib/action-cable.ts` | WebSocket + token |
| OAuth (Google/FB) | `features/Auth/components/OAuthCallback.tsx` | Redirect → JWT callback |
| Leaflet tiles | `features/Map/components/MapView.tsx` | HTTP (sem API key) |
| Hostinger (deploy) | `.github/workflows/ci.yml` | FTP/rsync |

## Validação da Arquitetura

### Validação de Coerência ✅

**Compatibilidade de Decisões:**
Todas as versões verificadas são mutuamente compatíveis: Vite 8 + React 19 +
TypeScript 6 + react-leaflet 5.0.0 + React Router v7 + TanStack Query v5 +
Zustand v5 + Tailwind v4 + shadcn/ui CLI v4. Nenhuma dependência conflitante identificada.

**Consistência de Padrões:**
- JWT singleton → axios interceptor → TanStack Query → componentes: fluxo linear, sem ciclos
- ActionCableProvider singleton → useChannel → stores/invalidation: isolamento correto
- Zod schemas → transformação snake↔camel centralizada: sem vazamento de snake_case
- Feature/index.ts → sem import cruzado direto: fronteiras respeitadas na estrutura

**Alinhamento de Estrutura:**
Estrutura de pastas suporta todas as decisões: features por domínio, lib/ para infraestrutura transversal, stores/ para estado global, providers/ para contextos.

---

### Validação de Cobertura de Requisitos ✅

**Cobertura Funcional — 43/43 FRs:**
Todos os 43 FRs mapeados para arquivos específicos na árvore do projeto. Nenhuma funcionalidade sem suporte arquitetural identificada.

**Cobertura Não-Funcional:**

| NFR | Solução Arquitetural | Status |
|---|---|---|
| FCP < 1.0s / bundle < 200KB | Leaflet via `React.lazy`, code splitting por rota | ✅ |
| JWT em memória (não localStorage) | `auth-token.ts` singleton + httpOnly cookie refresh | ✅ |
| WebSocket reconexão automática | `ActionCableProvider` com backoff exponencial | ✅ |
| Mapa até 5.000 pins + clustering | `useMapPins.ts` — clustering acima de 200 pins | ✅ |
| WCAG 2.1 AA | shadcn/ui sobre Radix UI — foco e ARIA gerenciados | ✅ |
| LGPD | TermsAcceptance, VisibilityToggle, DeleteAccountModal 2 etapas | ✅ |
| XSS — conteúdo gerado pelo usuário | DOMPurify 3.3.3 centralizado | ✅ |
| SEO `/l/:slug` | Rails renderiza server-side — zero Node SSR no frontend | ✅ |
| Falha WS isolada do restante da UI | `ErrorBoundary` por feature + `wsStatusStore` separado | ✅ |

---

### Gaps Identificados e Resolvidos

**Gap 1 — Componente de Navegação Global (FR41):**
- Problema: `Navigation.tsx` ausente na árvore do projeto
- Resolução: Adicionar à estrutura:
  ```
  src/components/Navigation/
    Navigation.tsx          # menu contextual por profile_type
    Navigation.test.tsx
    useNavigation.ts        # itens de menu baseados em profileType do authStore
  ```

**Gap 2 — Estratégia de pré-renderização para `/` (landing page de marketing):**
- Problema: Estratégia não especificada na estrutura
- Resolução: Landing page de marketing é um **arquivo HTML estático independente** (`public/landing/index.html`) — não é rota React. O SPA React inicia em `/login` e `/app/*`. Nginx/Apache no Hostinger serve:
  - `/` → arquivo HTML estático (landing page de marketing, sem React)
  - `/login`, `/register`, `/app/*` → `dist/index.html` (SPA React)
  - `/l/:slug` → proxy reverso para Rails (VPS) ou redirect para domínio da API
  - Vantagem: zero dependência de `vite-plugin-prerender`, funciona em Hostinger shared e VPS.

---

### Checklist de Completude da Arquitetura

**✅ Análise de Requisitos**
- [x] Contexto do projeto analisado em profundidade
- [x] Escala e complexidade avaliados (Alta — 43 FRs, RT, mapa, 3 perfis, LGPD)
- [x] Restrições técnicas identificadas (Rails API definida, Kamal, Hostinger, dev solo)
- [x] Concerns transversais mapeados (auth, WS, permissões, estados UI, SEO híbrido)

**✅ Decisões Arquiteturais**
- [x] Decisões críticas documentadas com versões verificadas (abril 2026)
- [x] Stack completa especificada
- [x] Padrões de integração Rails↔React definidos
- [x] Considerações de performance endereçadas

**✅ Padrões de Implementação**
- [x] Convenções de nomenclatura estabelecidas
- [x] Transformação snake↔camelCase centralizada e documentada
- [x] Padrões de comunicação (ActionCable, HTTP) especificados
- [x] Padrões de processo (erros, loading, formulários) documentados com exemplos

**✅ Estrutura do Projeto**
- [x] Árvore de diretórios completa com todos os arquivos
- [x] Fronteiras de componentes estabelecidas
- [x] Pontos de integração mapeados
- [x] 43 FRs mapeados para localizações específicas
- [x] Gaps identificados e resolvidos

---

### Avaliação de Prontidão

**Status Geral:** PRONTO PARA IMPLEMENTAÇÃO

**Nível de Confiança:** Alto

**Pontos Fortes:**
- Deploy zero-surpresas: SPA estático (Hostinger) + Rails via Kamal no VPS
- Separação clara entre estado de servidor (TanStack Query) e estado de UI (Zustand)
- Segurança JWT sólida sem complexidade excessiva para dev solo
- SEO via Rails elimina Node SSR — decisão cirúrgica e simples
- Todos os 43 FRs têm endereço físico na árvore do projeto

**Áreas para Evolução Futura (pós-MVP):**
- Monitoramento de erros (Sentry)
- Responsividade mobile (fora do escopo MVP)
- Internacionalização (se expansão além do Brasil)
- App mobile nativo (Fase 3 do PRD)

---

### Handoff para Implementação

**Para agentes IA — seguir rigorosamente:**
- Seguir decisões arquiteturais exatamente como documentadas
- Usar padrões de implementação consistentemente em todos os componentes
- Respeitar fronteiras de features (sempre via `index.ts`)
- Consultar este documento para qualquer decisão arquitetural

**Primeira prioridade de implementação:**
```bash
npm create vite@latest garagedom-web -- --template react-ts
cd garagedom-web
npm install
```
Seguido da configuração de Tailwind v4, shadcn/ui, estrutura de pastas,
e implementação de `auth-token.ts` + `api-client.ts` + `authStore.ts`
antes de qualquer feature.

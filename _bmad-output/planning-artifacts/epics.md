---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-04-05'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

# garagedom - Epic Breakdown

## Overview

Este documento contém o breakdown completo de epics e stories para o **GarageDom Web** (SPA React + Vite), decompondo os requisitos do PRD e da Arquitetura em stories implementáveis.

## Requirements Inventory

### Functional Requirements

FR01: Visitante cria conta com e-mail e senha via formulário de cadastro
FR02: Visitante cria conta via OAuth (Google ou Facebook) com redirecionamento e retorno à app
FR03: Usuário faz login com e-mail/senha ou via OAuth
FR04: Usuário solicita redefinição de senha por e-mail
FR05: Usuário exclui conta e dados permanentemente com confirmação em duas etapas
FR06: Visitante visualiza e aceita termos de uso e política de privacidade no cadastro (checkbox obrigatório — LGPD)
FR07: Usuário cria perfil com tipo fixo: banda, casa de shows ou produtor
FR08: Usuário faz upload de logo/avatar associado ao perfil
FR09: Usuário edita informações do perfil (nome, bio, gênero musical, cidade, membros, fotos)
FR10: Usuário controla visibilidade do pin no mapa (público ou oculto — LGPD)
FR11: Usuário visualiza perfil público de outros usuários com histórico de shows e informações
FR12: Usuário visualiza mapa interativo com pins por cidade — cada pin exibe o logo real da entidade
FR13: Usuário clica em pin para visualizar card de perfil resumido sem sair do mapa
FR14: Usuário filtra pins por tipo de entidade (banda, venue, produtor)
FR15: Usuário navega pelo mapa livremente (zoom, pan, busca por cidade)
FR16: Usuário vê o próprio pin aparecer no mapa após completar o cadastro
FR17: Banda envia convite de conexão para outra banda a partir do perfil ou mapa
FR18: Banda aceita ou recusa convite de conexão recebido via notificação
FR19: Banda visualiza lista de conexões ativas
FR20: Banda desfaz uma conexão existente
FR21: Banda (com conexão ativa) cria e envia proposta de evento para venue com seleção de data e cachê
FR22: Venue cria proposta de evento selecionando bandas do mapa ou busca
FR23: Produtor cria proposta de evento selecionando venue e bandas em um único fluxo
FR24: Venue aceita ou rejeita proposta com feedback ao proponente
FR25: Usuário visualiza histórico de propostas enviadas e recebidas por status
FR26: Usuário cancela proposta antes da decisão final
FR27: Usuário inicia conversa de chat com outro usuário a partir de proposta ou perfil
FR28: Usuário envia e recebe mensagens em tempo real com entrega confirmada
FR29: Usuário visualiza histórico completo de conversas
FR30: Usuário recebe notificação in-app ao receber nova mensagem (sem recarregar a página)
FR31: Usuário recebe notificação in-app quando proposta é enviada, aceita ou rejeitada
FR32: Usuário denuncia mensagem de chat com seleção de motivo
FR33: Usuário cria mini landing page associada ao perfil com builder de blocos
FR34: Usuário edita blocos de conteúdo (texto, imagens, links) com preview em tempo real
FR35: Landing page é acessível por URL pública sem autenticação
FR36: Landing page é indexável por motores de busca (conteúdo disponível sem JavaScript)
FR37: Admin visualiza dashboard com métricas (cadastros, propostas, shows fechados, pins por cidade)
FR38: Admin modera e remove perfis que violam termos de uso
FR39: Admin visualiza e resolve denúncias com histórico de ação
FR40: Admin bloqueia ou desbloqueia usuários com registro de motivo
FR41: Usuário autenticado acessa menu de navegação contextual adaptado ao profile_type
FR42: Usuário visualiza estados de loading, erro e vazio em todos os fluxos críticos
FR43: Sessão mantida entre visitas sem novo login (refresh token silencioso)

### NonFunctional Requirements

NFR01: FCP < 1.0s | LCP < 2.5s | INP < 100ms | CLS < 0.1 (Core Web Vitals nível "Good")
NFR02: Mapa: carregamento inicial < 2s; pins < 1s após mapa carregado
NFR03: Chat: entrega de mensagens < 500ms via WebSocket
NFR04: Bundle JS inicial < 200KB gzipped — code splitting por rota obrigatório; Leaflet via lazy loading
NFR05: Respostas da API para ações do usuário < 1s
NFR06: JWT armazenado em memória (não localStorage/sessionStorage) — proteção contra XSS
NFR07: Refresh token com renovação silenciosa de sessão sem logout forçado
NFR08: Toda comunicação via TLS 1.2+ — sem fallback para HTTP
NFR09: WebSocket autenticado via token= no handshake — conexão rejeitada se token inválido
NFR10: Conteúdo gerado pelo usuário sanitizado antes de renderização — zero XSS
NFR11: CORS restrito ao domínio do frontend configurado no backend
NFR12: MVP dimensionado para ~500 usuários ativos (lançamento Jundiaí)
NFR13: Arquitetura suporta expansão nacional sem refatoração de frontend
NFR14: Mapa renderiza até 5.000 pins simultâneos — clustering obrigatório acima de 200 pins
NFR15: Conformidade WCAG 2.1 AA
NFR16: Todos os fluxos críticos navegáveis por teclado sem mouse
NFR17: Contraste mínimo 4.5:1 texto normal, 3:1 texto grande
NFR18: Roles ARIA e landmarks semânticos em todos os componentes Shadcn/ui
NFR19: Estados de foco visíveis em todos os elementos interativos
NFR20: Disponibilidade 99.5% uptime alinhada ao SLA do backend
NFR21: Falhas de WebSocket isoladas do restante da UI — chat fora do ar não bloqueia mapa ou propostas
NFR22: Toda falha de API exibe mensagem legível e ação de recuperação — zero telas em branco

### Additional Requirements

- **Starter template obrigatório**: `npm create vite@latest garagedom-web -- --template react-ts` — primeira story de implementação
- **Dependências core a instalar e configurar**: react-router-dom 7.14.0, @tanstack/react-query 5.96.2, zustand 5.0.12, tailwindcss 4.1, shadcn/ui CLI v4, leaflet + react-leaflet 5.0.0, @rails/actioncable, dompurify 3.3.3, axios, zod, react-hook-form, @hookform/resolvers, vitest, playwright
- **Infraestrutura de autenticação**: `auth-token.ts` singleton (JWT em memória) + httpOnly cookie refresh + `authStore` Zustand antes de qualquer feature
- **ActionCableProvider singleton** com backoff exponencial (500ms→1s→2s→4s→max 30s) — necessário antes das features de chat e notificações
- **Padrão AsyncState**: componente wrapper `<AsyncState>` obrigatório em todos os componentes com dados do servidor
- **Padrão ErrorBoundary**: por feature, não global
- **Transformação snake_case↔camelCase**: via Zod schemas, centralizada em `src/lib/schemas/`
- **Estrutura de features**: cada feature com `index.ts`, `components/`, `hooks/`, `types.ts`
- **Roteamento**: React Router v7 `createBrowserRouter` + `ProtectedRoute` + `ProfileRoute`
- **Landing page `/`**: arquivo HTML estático independente (não rota React) — para SEO
- **`/l/:slug`**: renderizado pelo Rails server-side — React apenas gerencia o builder autenticado
- **Deploy CI/CD**: GitHub Actions lint → typecheck → vitest → build → deploy Hostinger
- **Design tokens neo-brutalista**: paleta `#F2CF1D` / `#F2BD1D` / `#403208` / `#0D0D0D` configurada no Tailwind v4

### UX Design Requirements

_Nenhum documento de UX Design encontrado. Requirements de UI derivados do PRD e Arquitetura:_

UX-DR01: Onboarding máximo de 3 campos obrigatórios no cadastro inicial — músico underground não tolera formulários longos
UX-DR02: Mapa como contexto primário — qualquer ação de descoberta começa ou retorna ao mapa
UX-DR03: Pin com fallback visual: avatar com iniciais + cor baseada no nome quando logo não disponível
UX-DR04: Nenhum fluxo crítico requer mais de 3 cliques para a ação principal
UX-DR05: Upload de logo assíncrono — perfil criado primeiro, logo processado em background com indicador de progresso
UX-DR06: Linguagem da UI direta, sem jargão corporativo — negociação de shows é informal
UX-DR07: Indicador visual de status de conexão WebSocket no chat (conectado / reconectando / offline)
UX-DR08: Workflow de proposta adapta formulário, ordem de seleção e campos conforme o profile_type autenticado — sem criar 3 telas diferentes
UX-DR09: Perfil público de banda exibe histórico de shows e informações como "mini vitrine"
UX-DR10: Fluxo de exclusão de conta com confirmação em duas etapas e feedback sobre o que será apagado

### FR Coverage Map

FR01: Epic 2 — Cadastro com e-mail e senha
FR02: Epic 2 — Cadastro via OAuth (Google/Facebook)
FR03: Epic 2 — Login com e-mail/senha ou OAuth
FR04: Epic 2 — Redefinição de senha por e-mail
FR05: Epic 2 — Exclusão de conta em duas etapas (LGPD)
FR06: Epic 2 — Aceite de termos de uso (LGPD)
FR07: Epic 3 — Criação de perfil com tipo fixo
FR08: Epic 3 — Upload de logo/avatar assíncrono
FR09: Epic 3 — Edição de informações do perfil
FR10: Epic 3 — Controle de visibilidade do pin (LGPD)
FR11: Epic 3 — Visualização de perfil público
FR12: Epic 4 — Mapa interativo com pins e logos reais
FR13: Epic 4 — Card de perfil resumido ao clicar no pin
FR14: Epic 4 — Filtro de pins por tipo de entidade
FR15: Epic 4 — Navegação livre no mapa (zoom, pan, busca)
FR16: Epic 4 — Pin próprio aparece após cadastro
FR17: Epic 5 — Envio de convite de conexão entre bandas
FR18: Epic 5 — Aceitar ou recusar convite via notificação
FR19: Epic 5 — Lista de conexões ativas
FR20: Epic 5 — Desfazer conexão existente
FR21: Epic 6 — Banda cria proposta de evento para venue
FR22: Epic 6 — Venue cria proposta selecionando bandas
FR23: Epic 6 — Produtor cria proposta com venue + bandas
FR24: Epic 6 — Venue aceita ou rejeita proposta
FR25: Epic 6 — Histórico de propostas por status
FR26: Epic 6 — Cancelamento de proposta
FR27: Epic 7 — Iniciar conversa de chat
FR28: Epic 7 — Envio e recebimento em tempo real
FR29: Epic 7 — Histórico completo de conversas
FR30: Epic 7 — Notificação in-app de nova mensagem
FR31: Epic 7 — Notificação in-app de mudança de proposta
FR32: Epic 7 — Denúncia de mensagem de chat
FR33: Epic 8 — Criação de mini landing page com builder de blocos
FR34: Epic 8 — Edição de blocos com preview em tempo real
FR35: Epic 8 — Landing page pública sem autenticação
FR36: Epic 8 — Landing page indexável por buscadores
FR37: Epic 9 — Dashboard admin com métricas
FR38: Epic 9 — Moderação e remoção de perfis
FR39: Epic 9 — Resolução de denúncias
FR40: Epic 9 — Bloqueio/desbloqueio de usuários
FR41: Epic 2 — Menu de navegação contextual por profile_type
FR42: Epic 1 — AsyncState component (loading/erro/vazio) — aplicado em todos os epics
FR43: Epic 1 — Infraestrutura de refresh token silencioso

## Epic List

### Epic 1: Fundação do Projeto
Setup completo do projeto: Vite 8 + TypeScript 6 + Tailwind v4 + shadcn/ui + estrutura de features + cliente HTTP (axios) + auth-token singleton + Zustand stores + ActionCableProvider + AsyncState + ErrorBoundary + React Router v7 + CI/CD GitHub Actions. Base técnica que garante implementação consistente dos epics seguintes.
**FRs cobertos:** FR42 (AsyncState component), FR43 (refresh token infra)
**Requisitos adicionais:** Starter template, todas as dependências core, estrutura de pastas, CI/CD, design tokens neo-brutalista

### Epic 2: Autenticação, Sessão e App Shell
Usuário pode criar conta (email/senha ou OAuth), fazer login, recuperar senha, excluir conta com confirmação em duas etapas e acessar o app com navegação contextual adaptada ao seu tipo de perfil.
**FRs cobertos:** FR01, FR02, FR03, FR04, FR05, FR06, FR41

### Epic 3: Perfis e Identidade
Usuário cria seu perfil (banda, venue ou produtor), faz upload do logo de forma assíncrona, edita suas informações, controla visibilidade do pin no mapa e visualiza perfis públicos de outros.
**FRs cobertos:** FR07, FR08, FR09, FR10, FR11

### Epic 4: Mapa e Descoberta
Usuário descobre bandas, venues e produtores em um mapa interativo com pins usando logos reais (com fallback visual), filtra por tipo, navega livremente e vê seu próprio pin ao completar o cadastro.
**FRs cobertos:** FR12, FR13, FR14, FR15, FR16

### Epic 5: Conexões entre Bandas
Banda envia convites de conexão para outras bandas, aceita ou recusa via notificação, visualiza sua lista de conexões ativas e pode desfazer conexões existentes.
**FRs cobertos:** FR17, FR18, FR19, FR20

### Epic 6: Workflow de Propostas de Shows
Qualquer perfil cria, envia, recebe, aceita/rejeita e cancela propostas de show — com formulário adaptado ao profile_type do iniciador (banda, venue ou produtor) e histórico por status.
**FRs cobertos:** FR21, FR22, FR23, FR24, FR25, FR26

### Epic 7: Comunicação em Tempo Real
Usuários trocam mensagens em tempo real via chat (entrega confirmada, histórico), recebem notificações in-app de mensagens e mudanças de proposta, e podem denunciar mensagens com seleção de motivo.
**FRs cobertos:** FR27, FR28, FR29, FR30, FR31, FR32

### Epic 8: Mini Landing Pages
Usuário cria e edita sua mini landing page pública com builder de blocos e preview em tempo real; a página é acessível sem login e indexável por buscadores (renderizada pelo Rails server-side).
**FRs cobertos:** FR33, FR34, FR35, FR36

### Epic 9: Administração e Moderação
Equipe interna visualiza dashboard de métricas, modera perfis, resolve denúncias com histórico de ação e bloqueia/desbloqueia usuários com registro de motivo.
**FRs cobertos:** FR37, FR38, FR39, FR40

---

## Epic 1: Fundação do Projeto

Setup completo do projeto que garante implementação consistente de todos os epics seguintes: stack técnica, infraestrutura de autenticação, roteamento, WebSocket, componentes base e CI/CD.

**FRs cobertos:** FR42 (AsyncState), FR43 (refresh token infra)

### Story 1.1: Inicialização do Projeto

Como desenvolvedor,
Quero o projeto inicializado com a stack completa e estrutura de pastas definida,
Para que todo desenvolvimento subsequente siga os padrões arquiteturais estabelecidos.

**Acceptance Criteria:**

**Given** o projeto não existe
**When** executo `npm create vite@latest garagedom-web -- --template react-ts`
**Then** um projeto Vite 8 + React 19 + TypeScript 6 é criado com `tsconfig.json` em strict mode

**Given** o projeto foi criado
**When** instalo todas as dependências core (react-router-dom 7.14, @tanstack/react-query 5, zustand 5, tailwindcss 4.1, shadcn/ui CLI v4, react-leaflet 5, @rails/actioncable, dompurify 3.3.3, axios, zod, react-hook-form, @hookform/resolvers, vitest, playwright)
**Then** todos os pacotes resolvem sem conflitos de peer dependencies

**Given** Tailwind v4 está instalado
**When** configuro os design tokens via CSS com a paleta (`#F2CF1D`, `#F2BD1D`, `#403208`, `#0D0D0D`)
**Then** as cores neo-brutalistas estão disponíveis como utilities Tailwind

**Given** o shadcn/ui está instalado
**When** executo `npx shadcn init` com as configurações do projeto
**Then** o arquivo `components.json` é gerado e a pasta `src/components/ui/` é criada

**Given** o projeto está inicializado
**When** crio a estrutura de pastas (`src/features/`, `src/lib/`, `src/stores/`, `src/hooks/`, `src/components/`, `src/router/`, `src/providers/`, `src/types/`)
**Then** todos os diretórios existem conforme a especificação de arquitetura

**Given** o setup está completo
**When** executo `npm run dev`
**Then** o app inicia sem erros em `http://localhost:5173`

---

### Story 1.2: Infraestrutura HTTP e Autenticação

Como desenvolvedor,
Quero um cliente HTTP centralizado com gestão de JWT em memória e refresh automático,
Para que todas as chamadas de API incluam autenticação e tratem renovação de token de forma transparente.

**Acceptance Criteria:**

**Given** `src/lib/auth-token.ts` é criado com variável privada de módulo
**When** chamo `setToken(jwt)` e depois `getToken()`
**Then** o token é retornado sem jamais ter sido gravado em `localStorage`, `sessionStorage` ou cookie acessível via JS

**Given** `src/lib/api-client.ts` é criado com instância axios
**When** qualquer requisição é feita
**Then** o header `Authorization: Bearer <token>` é injetado via request interceptor usando `getToken()`

**Given** o axios interceptor de response está configurado
**When** a API retorna 401
**Then** o interceptor chama `POST /api/v1/auth/refresh`, atualiza o token via `setToken()` e reenvia a requisição original — exatamente uma vez

**Given** uma segunda requisição retorna 401 após o retry
**When** o refresh também falha
**Then** `clearToken()` é chamado, `useAuthStore.clearAuth()` é dispatched e o usuário é redirecionado para `/login`

**Given** `src/stores/authStore.ts` é criado com Zustand
**When** `setUser({ id, profileType, name })` é chamado
**Then** `isAuthenticated` é `true` e `profileType` está armazenado — o token JWT nunca está no store

**Given** `src/lib/query-client.ts` é criado
**When** TanStack Query é configurado
**Then** `staleTime` é 60000ms, `retry` é `false` para erros 401, e o `QueryClient` é exportado como singleton

---

### Story 1.3: Roteamento e Proteção de Rotas

Como desenvolvedor,
Quero React Router v7 configurado com proteção baseada em autenticação e tipo de perfil,
Para que usuários não autenticados e perfis não autorizados sejam redirecionados corretamente.

**Acceptance Criteria:**

**Given** `src/router/index.tsx` é criado com `createBrowserRouter`
**When** o app carrega
**Then** todas as rotas estão definidas: `/`, `/login`, `/register`, `/app/*` com lazy loading por feature

**Given** `ProtectedRoute.tsx` está criado
**When** um usuário não autenticado acessa qualquer rota `/app/*`
**Then** é redirecionado para `/login` com o path original preservado em `state.from`

**Given** `ProfileRoute.tsx` está criado com prop `allowedTypes`
**When** um usuário com `profileType: 'band'` acessa `/app/admin/*`
**Then** é redirecionado para `/app/map`

**Given** cada rota `/app/*` usa `React.lazy()`
**When** o usuário navega pela primeira vez para uma rota
**Then** apenas o bundle daquela feature é carregado (code splitting verificável no Network tab)

**Given** `src/providers/AppProviders.tsx` compõe todos os providers
**When** o app monta
**Then** a ordem é: `QueryClientProvider` > `ActionCableProvider` > `RouterProvider`

---

### Story 1.4: ActionCable Provider e Gestão de WebSocket

Como desenvolvedor,
Quero um ActionCable Provider centralizado que gerencia o ciclo de vida do WebSocket,
Para que chat e notificações usem uma única conexão com reconexão automática.

**Acceptance Criteria:**

**Given** `src/lib/action-cable.ts` cria o consumer ActionCable
**When** o app inicia com JWT válido
**Then** exatamente uma conexão WebSocket é estabelecida para `${VITE_CABLE_URL}?token=<jwt>`

**Given** `ActionCableProvider.tsx` envolve o app
**When** `clearToken()` é chamado (logout)
**Then** a conexão WebSocket é fechada

**Given** `useChannel(channelName, params, { onReceived })` hook está criado
**When** um componente monta com a subscrição
**Then** a subscrição é criada; quando desmonta, a subscrição é removida sem memory leak

**Given** o WebSocket desconecta inesperadamente
**When** a reconexão é tentada
**Then** backoff exponencial é aplicado: 500ms → 1s → 2s → 4s → máx 30s

**Given** `src/stores/wsStatusStore.ts` rastreia o status
**When** o estado da conexão muda
**Then** `wsStatus` atualiza para `'connected' | 'connecting' | 'disconnected'`

---

### Story 1.5: Componentes Base de UI (AsyncState e ErrorBoundary)

Como desenvolvedor,
Quero componentes compartilhados `AsyncState` e `ErrorBoundary` que padronizam estados de loading/erro/vazio,
Para que todos os fluxos críticos implementem FR42 de forma uniforme sem duplicar lógica.

**Acceptance Criteria:**

**Given** `src/components/AsyncState.tsx` está criado
**When** `isLoading` é `true`
**Then** `loadingFallback` (skeleton) é renderizado

**Given** `AsyncState` está configurado
**When** `isError` é `true`
**Then** `errorFallback` com mensagem de erro em português e botão "Tentar novamente" é renderizado

**Given** `AsyncState` está configurado
**When** `isEmpty` é `true` e `isLoading` e `isError` são `false`
**Then** `emptyFallback` com CTA é renderizado

**Given** `AsyncState` está configurado
**When** todos os flags são `false` e dados existem
**Then** `children` são renderizados

**Given** `ErrorBoundary.tsx` envolve uma feature
**When** um erro de runtime ocorre dentro da feature
**Then** o erro é capturado e o componente `fallback` é exibido sem quebrar o restante do app

**Given** `src/components/LoadingSkeleton.tsx` está criado
**When** usado como `loadingFallback`
**Then** renderiza um skeleton animado com dimensões configuráveis via props

---

### Story 1.6: CI/CD e Configuração de Produção

Como desenvolvedor,
Quero um pipeline GitHub Actions que valida, testa, builda e faz deploy do frontend,
Para que cada push para main seja automaticamente validado e publicado no Hostinger.

**Acceptance Criteria:**

**Given** `.github/workflows/ci.yml` está criado
**When** código é pushed para main
**Then** o pipeline executa em sequência: ESLint → `tsc --noEmit` → Vitest → `vite build`

**Given** o passo de build é executado
**When** `vite build` completa
**Then** o bundle JS principal em `dist/` é ≤ 200KB gzipped (verificado com `rollup-plugin-visualizer`)

**Given** `.env.example` está criado
**When** um novo dev configura o projeto
**Then** `VITE_API_URL` e `VITE_CABLE_URL` estão documentados como variáveis obrigatórias

**Given** `vitest.config.ts` está criado
**When** `npm run test` é executado
**Then** testes rodam com ambiente jsdom e cobertura é reportada

**Given** `playwright.config.ts` está criado
**When** `npm run test:e2e` é executado
**Then** testes Playwright rodam contra o dev server na porta 5173

---

## Epic 2: Autenticação, Sessão e App Shell

Usuário pode criar conta, fazer login (email/senha ou OAuth), recuperar senha, excluir conta em duas etapas e acessar o app com navegação contextual ao seu perfil.

**FRs cobertos:** FR01, FR02, FR03, FR04, FR05, FR06, FR41

### Story 2.1: Cadastro com E-mail e Senha

Como visitante,
Quero criar uma conta com e-mail e senha aceitando os termos de uso,
Para que eu possa acessar a plataforma GarageDom.

**Acceptance Criteria:**

**Given** estou em `/register`
**When** preencho nome, e-mail e senha (≥ 8 caracteres) e marco o checkbox de termos
**Then** o formulário pode ser submetido

**Given** submeto o formulário com dados válidos
**When** a API retorna 201
**Then** sou redirecionado para `/app/profile/create` com `isAuthenticated: true` no store

**Given** submeto sem marcar o checkbox de termos
**When** clico em "Criar conta"
**Then** o formulário exibe "Você precisa aceitar os termos de uso para continuar" e não é submetido

**Given** submeto com e-mail já cadastrado
**When** a API retorna 422
**Then** o campo e-mail exibe "Este e-mail já está em uso"

**Given** o princípio de onboarding mínimo
**When** o formulário é renderizado
**Then** apenas 3 campos são obrigatórios: nome, e-mail, senha (máximo 3 campos para cadastro inicial)

**Given** o formulário usa React Hook Form + Zod
**When** há erros de validação
**Then** cada campo exibe sua mensagem específica em português sem jargão técnico

---

### Story 2.2: Login e Logout

Como usuário cadastrado,
Quero fazer login com e-mail e senha e logout com segurança,
Para que eu acesse minha conta e a proteja quando terminar.

**Acceptance Criteria:**

**Given** estou em `/login`
**When** insiro credenciais válidas e submeto
**Then** o JWT é armazenado via `setToken()` (em memória), o auth store é atualizado, e sou redirecionado para `/app/map`

**Given** o login foi realizado com sucesso
**When** o JWT é armazenado
**Then** ele NÃO está presente em `localStorage`, `sessionStorage` ou qualquer cookie acessível via JS

**Given** clico em "Sair"
**When** confirmado
**Then** `clearToken()` é chamado, o auth store é limpo, o WebSocket desconecta, e sou redirecionado para `/`

**Given** insiro credenciais incorretas
**When** a API retorna 401
**Then** "E-mail ou senha incorretos" é exibido sem revelar qual dos dois está errado

**Given** fui redirecionado para `/login` a partir de uma rota protegida
**When** faço login com sucesso
**Then** sou redirecionado para o path original que havia solicitado

---

### Story 2.3: OAuth Google e Facebook

Como visitante,
Quero criar conta ou fazer login via Google ou Facebook,
Para que eu acesse a plataforma sem criar uma senha separada.

**Acceptance Criteria:**

**Given** clico em "Entrar com Google" na página de login/cadastro
**When** clicado
**Then** sou redirecionado para o endpoint OAuth do Rails que gerencia o fluxo Google

**Given** o fluxo OAuth completa com sucesso
**When** o Rails redireciona para `/app/auth/callback?token=<jwt>`
**Then** `OAuthCallback.tsx` extrai o token, chama `setToken()`, atualiza o auth store e redireciona para `/app/map`

**Given** o fluxo OAuth falha ou é cancelado
**When** o callback recebe um parâmetro de erro
**Then** "Não foi possível autenticar. Tente novamente." é exibido em `/login`

**Given** é o primeiro acesso via OAuth
**When** redirecionado após o callback
**Then** o usuário é enviado para `/app/profile/create` para completar o perfil

---

### Story 2.4: Redefinição de Senha

Como usuário que esqueceu sua senha,
Quero solicitar redefinição de senha por e-mail,
Para que eu recupere acesso à minha conta.

**Acceptance Criteria:**

**Given** estou em `/forgot-password`
**When** insiro meu e-mail cadastrado e submeto
**Then** `POST /api/v1/auth/password` é chamado e "E-mail de redefinição enviado. Verifique sua caixa de entrada." é exibido

**Given** insiro um e-mail não cadastrado
**When** submeto
**Then** a mesma mensagem de sucesso é exibida (não revela se o e-mail existe — segurança)

**Given** clico no link de redefinição recebido por e-mail
**When** chego em `/reset-password?token=<token>`
**Then** um formulário com campos "Nova senha" e "Confirmar senha" é exibido

**Given** submeto uma nova senha válida com confirmação igual
**When** a API retorna 200
**Then** "Senha atualizada com sucesso. Faça login." é exibido e sou redirecionado para `/login`

---

### Story 2.5: Exclusão de Conta

Como usuário,
Quero excluir minha conta e dados permanentemente em duas etapas,
Para que eu exerça meu direito LGPD de apagamento com pleno conhecimento do que será removido.

**Acceptance Criteria:**

**Given** estou nas configurações da conta
**When** clico em "Excluir minha conta"
**Then** um modal abre listando o que será apagado: perfil, pins, propostas, mensagens

**Given** o modal está aberto
**When** digito "CONFIRMAR" no campo de texto e clico no botão final de exclusão
**Then** `DELETE /api/v1/users/me` é chamado

**Given** a API retorna 204
**When** a conta é excluída
**Then** `clearToken()` é chamado, o auth store é limpo, e sou redirecionado para `/` com "Sua conta foi excluída permanentemente."

**Given** fecho o modal em qualquer etapa antes da confirmação final
**When** fechado
**Then** nenhuma exclusão ocorre

**Given** o texto de confirmação está incorreto
**When** tento submeter
**Then** o botão permanece desabilitado

---

### Story 2.6: Navegação Global Contextual

Como usuário autenticado,
Quero um menu de navegação que se adapta ao meu tipo de perfil,
Para que eu veja apenas as ações relevantes ao meu papel na plataforma.

**Acceptance Criteria:**

**Given** estou autenticado como `profile_type: 'band'`
**When** o `Navigation` é renderizado
**Then** o menu exibe: Mapa, Conexões, Propostas, Chat, Meu Perfil

**Given** estou autenticado como `profile_type: 'venue'`
**When** o `Navigation` é renderizado
**Then** o menu exibe: Mapa, Propostas, Chat, Meu Perfil (sem Conexões)

**Given** estou autenticado como `profile_type: 'producer'`
**When** o `Navigation` é renderizado
**Then** o menu exibe: Mapa, Propostas, Chat, Meu Perfil

**Given** estou autenticado como admin
**When** o `Navigation` é renderizado
**Then** o menu exibe: Dashboard Admin, Moderação, Denúncias

**Given** há notificações não lidas
**When** o `Navigation` renderiza o item Chat
**Then** um badge com a contagem de não lidos é exibido

**Given** navego via teclado
**When** uso Tab pelos itens do nav
**Then** cada item recebe foco visível e é ativável via Enter

---

### Story 2.7: Sessão Persistente com Refresh Token

Como usuário,
Quero que minha sessão seja renovada automaticamente entre visitas,
Para que eu permaneça logado sem comprometer a segurança.

**Acceptance Criteria:**

**Given** me autentiquei anteriormente e o httpOnly refresh cookie existe
**When** o app inicializa (page load ou refresh)
**Then** `POST /api/v1/auth/refresh` é chamado automaticamente antes de qualquer rota protegida renderizar

**Given** o refresh call é bem-sucedido
**When** o app é montado
**Then** `setToken(newJwt)` é chamado, `isAuthenticated` se torna `true` — o usuário vê o app diretamente sem redirect para login

**Given** o refresh call falha (cookie expirado)
**When** o app inicializa
**Then** `isAuthenticated` permanece `false` e o usuário é redirecionado para `/login`

**Given** o JWT expira durante a sessão ativa
**When** uma chamada API retorna 401
**Then** o interceptor axios faz refresh silencioso e reenvia — o usuário nunca vê um prompt de login durante uso ativo

**Given** o refresh é bem-sucedido
**When** o novo JWT é recebido
**Then** é armazenado apenas em memória via `setToken()` (nunca localStorage)

---

## Epic 3: Perfis e Identidade

Usuário cria seu perfil com tipo fixo, faz upload do logo, edita informações, controla visibilidade do pin e visualiza perfis públicos de outros.

**FRs cobertos:** FR07, FR08, FR09, FR10, FR11

### Story 3.1: Criação de Perfil

Como novo usuário,
Quero criar meu perfil com um tipo fixo (banda, venue ou produtor),
Para que eu estabeleça minha identidade na plataforma e seja descoberto no mapa.

**Acceptance Criteria:**

**Given** acabei de me cadastrar
**When** estou em `/app/profile/create`
**Then** o formulário exibe: nome do perfil, tipo (banda/venue/produtor — seleção única), cidade, gênero musical

**Given** seleciono "banda" e submeto dados válidos
**When** `POST /api/v1/profiles` retorna 201
**Then** meu perfil é criado, `useAuthStore` atualiza `profileType`, e sou redirecionado para `/app/map`

**Given** submeto sem selecionar um tipo de perfil
**When** clico em "Criar perfil"
**Then** "Selecione o tipo de perfil para continuar" é exibido e o formulário não é submetido

**Given** o formulário é submetido com sucesso
**When** a resposta da API chega
**Then** ela é parseada via `profileSchema` (Zod) antes de atualizar o store

---

### Story 3.2: Upload de Logo

Como usuário com perfil criado,
Quero fazer upload da minha logo e vê-la imediatamente no meu perfil e no mapa,
Para que minha identidade visual esteja representada na plataforma.

**Acceptance Criteria:**

**Given** estou na página do meu perfil
**When** clico na área de upload e seleciono uma imagem (PNG/JPG ≤ 5MB)
**Then** `POST /api/v1/profiles/:id/logo` é chamado e um indicador de progresso é exibido

**Given** o upload está em andamento
**When** o indicador é exibido
**Then** o perfil permanece totalmente utilizável (upload assíncrono não bloqueia a UI)

**Given** o upload é concluído com sucesso
**When** a API retorna a URL da logo
**Then** a logo é exibida imediatamente no perfil e no pin do mapa

**Given** nenhuma logo foi enviada
**When** meu pin é exibido no mapa
**Then** um avatar com minhas iniciais e uma cor derivada do nome é mostrado como fallback

**Given** seleciono um arquivo > 5MB ou formato inválido
**When** o arquivo é selecionado
**Then** "Arquivo inválido. Use PNG ou JPG com no máximo 5MB." é exibido e nenhum upload é disparado

---

### Story 3.3: Edição de Perfil

Como usuário,
Quero editar as informações do meu perfil,
Para que eu mantenha meus dados precisos e completos.

**Acceptance Criteria:**

**Given** estou em `/app/profile/edit`
**When** o formulário carrega
**Then** os valores atuais estão pré-preenchidos: nome, bio, gênero musical, cidade, membros (se banda)

**Given** atualizo campos e submeto
**When** `PUT /api/v1/profiles/:id` retorna 200
**Then** "Perfil atualizado com sucesso." é exibido e os dados são atualizados via TanStack Query invalidation

**Given** submeto com o campo nome vazio
**When** clico em "Salvar"
**Then** "O nome é obrigatório" é exibido

**Given** o formulário é submetido
**When** validado via `profileSchema` (Zod)
**Then** apenas dados válidos chegam à API

---

### Story 3.4: Controle de Visibilidade do Pin

Como usuário,
Quero controlar se meu pin aparece no mapa público,
Para que eu exerça meu direito LGPD de não ser descoberto sem meu consentimento.

**Acceptance Criteria:**

**Given** estou nas configurações do perfil
**When** desativo "Visível no mapa" e salvo
**Then** `PUT /api/v1/profiles/:id` é chamado com `is_visible: false`

**Given** `is_visible: false` está definido
**When** outros usuários visualizam o mapa
**Then** meu pin não aparece

**Given** `is_visible: false` está definido
**When** visualizo o mapa
**Then** meu próprio pin ainda aparece para mim com um indicador visual "Oculto para outros"

**Given** reativo a visibilidade
**When** salvo
**Then** meu pin reaparece no mapa público imediatamente

**Given** o toggle é renderizado
**When** interajo via teclado
**Then** o foco é visível e a mudança de estado é anunciada via `aria-label`

---

### Story 3.5: Visualização de Perfil Público

Como usuário,
Quero visualizar o perfil público de outro usuário com seu histórico,
Para que eu avalie antes de enviar uma conexão ou proposta.

**Acceptance Criteria:**

**Given** clico no nome ou pin de um usuário
**When** `/app/profile/:id` carrega
**Then** vejo: logo, nome, tipo, cidade, bio, gênero musical, histórico de shows (propostas fechadas)

**Given** o perfil carrega
**When** os dados são buscados via `GET /api/v1/profiles/:id`
**Then** são parseados via `profileSchema` (Zod) antes de renderizar

**Given** o perfil não tem histórico de shows
**When** renderizado
**Then** "Nenhum show registrado ainda." é exibido via `EmptyState`

**Given** estou visualizando um perfil de banda e sou uma banda
**When** a página renderiza
**Then** o botão "Enviar Conexão" é visível (se ainda não conectados)

**Given** o perfil está carregando
**When** os dados não chegaram
**Then** `AsyncState` exibe o skeleton; se a API retorna 404, "Perfil não encontrado." com link para o mapa é exibido

---

## Epic 4: Mapa e Descoberta

Usuário descobre entidades num mapa interativo com pins de logos reais, filtra por tipo, navega livremente e vê seu próprio pin ao completar o cadastro.

**FRs cobertos:** FR12, FR13, FR14, FR15, FR16

### Story 4.1: Mapa Base com Pins

Como usuário autenticado,
Quero visualizar um mapa interativo com pins de todas as entidades visíveis,
Para que eu descubra bandas, venues e produtores próximos ou em cidades-alvo.

**Acceptance Criteria:**

**Given** navego para `/app/map`
**When** o mapa Leaflet carrega via `React.lazy`
**Then** o mapa renderiza com a cidade do usuário em foco (ou última posição conhecida)

**Given** o mapa está carregado
**When** `GET /api/v1/map/pins` responde
**Then** os pins aparecem em menos de 1s após o mapa estar pronto

**Given** um pin tem logo enviada
**When** o pin renderiza no mapa
**Then** a logo real da entidade é exibida como marcador

**Given** um pin não tem logo
**When** renderizado
**Then** um avatar com iniciais e cor determinística (baseada no hash do nome) é exibido

**Given** mais de 200 pins estão na mesma área
**When** o mapa renderiza
**Then** os pins são agrupados em cluster com badge de contagem — pins individuais visíveis apenas ao dar zoom

**Given** o bundle Leaflet
**When** o bundle principal é construído
**Then** `react-leaflet` e `leaflet` NÃO estão incluídos no JS inicial (verificável no Network tab)

---

### Story 4.2: Card de Perfil no Pin

Como usuário,
Quero clicar em um pin do mapa e ver um resumo do perfil sem sair do mapa,
Para que eu avalie um contato antes de decidir conectar ou propor.

**Acceptance Criteria:**

**Given** clico em um pin no mapa
**When** `ProfilePopup` renderiza
**Then** vejo: logo, nome, tipo, cidade, gênero musical e botões de ação

**Given** estou visualizando o popup de uma banda e também sou uma banda
**When** renderizado
**Then** o botão "Enviar Conexão" é visível

**Given** estou visualizando qualquer popup de perfil
**When** renderizado
**Then** o link "Ver Perfil Completo" está visível

**Given** o popup está aberto
**When** pressiono Escape
**Then** o popup fecha e o foco retorna ao pin

**Given** o popup carrega dados do perfil
**When** buscando
**Then** `AsyncState` exibe um skeleton dentro do popup

---

### Story 4.3: Filtros e Navegação do Mapa

Como usuário,
Quero filtrar pins por tipo de entidade e navegar livremente no mapa,
Para que eu foque minha descoberta em tipos específicos de entidades ou localizações.

**Acceptance Criteria:**

**Given** o mapa está carregado
**When** seleciono o filtro "Bandas"
**Then** apenas pins de bandas são visíveis; pins de venues e produtores são ocultados

**Given** seleciono "Todos"
**When** o filtro é aplicado
**Then** todos os pins visíveis são exibidos

**Given** digito o nome de uma cidade no campo de busca
**When** pressiono Enter ou seleciono a sugestão
**Then** o mapa faz pan e zoom para essa cidade

**Given** faço zoom no mapa
**When** o nível de zoom é suficiente
**Then** clusters se quebram em pins individuais

**Given** uso apenas o teclado
**When** Tabo para os botões de filtro e pressiono Enter
**Then** o filtro é aplicado com estado de foco visível

---

### Story 4.4: Pin Próprio em Tempo Real

Como novo usuário que acabou de completar o cadastro,
Quero ver meu próprio pin no mapa imediatamente após criar meu perfil,
Para que eu tenha prova visual de que faço parte da cena (momento de valor do produto).

**Acceptance Criteria:**

**Given** acabei de criar meu perfil com `is_visible: true`
**When** sou redirecionado para `/app/map`
**Then** meu pin está visível no mapa na cidade informada no perfil

**Given** meu pin está no mapa
**When** o visualizo
**Then** usa minha logo enviada (ou fallback de iniciais) — igual aos outros pins

**Given** meu perfil tem `is_visible: false`
**When** o mapa carrega
**Then** meu pin aparece apenas para mim com um indicador "Oculto para outros"

**Given** clico no meu próprio pin
**When** o `ProfilePopup` abre
**Then** exibe "Este é você" em vez dos botões de conexão/proposta

---

## Epic 5: Conexões entre Bandas

Banda envia convites de conexão para outras bandas, aceita ou recusa, gerencia sua lista de conexões ativas e pode desfazer conexões.

**FRs cobertos:** FR17, FR18, FR19, FR20

### Story 5.1: Enviar Convite de Conexão

Como banda,
Quero convidar outra banda para se conectar,
Para que possamos formar um agrupamento formal e criar propostas conjuntas.

**Acceptance Criteria:**

**Given** estou visualizando o perfil ou popup de uma banda
**When** clico em "Enviar Conexão"
**Then** `POST /api/v1/connections` é chamado com o id da banda-alvo

**Given** a requisição é bem-sucedida
**When** a API retorna 201
**Then** o botão muda para "Convite Enviado" (desabilitado)

**Given** já enviei um convite para essa banda
**When** visualizo o perfil dela novamente
**Then** o botão exibe "Convite Enviado" sem fazer nova chamada à API

**Given** sou uma venue ou produtor
**When** visualizo o perfil de uma banda
**Then** o botão "Enviar Conexão" não está visível (conexões são apenas entre bandas)

---

### Story 5.2: Aceitar ou Recusar Convite

Como banda,
Quero aceitar ou recusar convites de conexão que recebo,
Para que eu controle minha rede formal na plataforma.

**Acceptance Criteria:**

**Given** tenho um convite de conexão pendente
**When** visualizo a lista de conexões ou notificação
**Then** vejo: logo do remetente, nome e botões "Aceitar" / "Recusar"

**Given** clico em "Aceitar"
**When** `PUT /api/v1/connections/:id/accept` retorna 200
**Then** a conexão muda para status "ativa" e aparece na minha lista de conexões

**Given** clico em "Recusar"
**When** `DELETE /api/v1/connections/:id` retorna 200
**Then** o convite desaparece e nenhuma conexão é criada

**Given** aceito uma conexão
**When** ambas as partes visualizam os perfis uma da outra
**Then** o botão "Enviar Conexão" não aparece (já conectadas)

---

### Story 5.3: Gerenciar Conexões

Como banda,
Quero ver todas as minhas conexões ativas e removê-las se necessário,
Para que eu mantenha controle sobre minha rede formal.

**Acceptance Criteria:**

**Given** navego para `/app/connections`
**When** a página carrega
**Then** vejo a lista de todas as conexões ativas com: logo, nome, cidade, gênero

**Given** a lista está carregando
**When** os dados não chegaram
**Then** `AsyncState` exibe os skeletons

**Given** não tenho conexões
**When** a página carrega
**Then** "Nenhuma conexão ainda. Encontre bandas no mapa!" é exibido via `EmptyState` com link para o mapa

**Given** clico em "Desfazer Conexão" numa conexão ativa
**When** um modal de confirmação aparece e confirmo
**Then** `DELETE /api/v1/connections/:id` é chamado e a conexão é removida da lista

---

## Epic 6: Workflow de Propostas de Shows

Qualquer perfil cria, envia, recebe, aceita/rejeita e cancela propostas — com formulário adaptado ao profile_type e histórico por status.

**FRs cobertos:** FR21, FR22, FR23, FR24, FR25, FR26

### Story 6.1: Banda Cria Proposta para Venue

Como banda com conexão ativa,
Quero criar e enviar uma proposta de show para uma venue,
Para que eu possa formalizar um pitch sem sair da plataforma.

**Acceptance Criteria:**

**Given** estou autenticado como `band` e navego para criar proposta
**When** o formulário carrega com `initiator_type: 'band'`
**Then** os campos exibidos são: seleção de venue (busca), data do evento, cachê proposto, notas, bandas do lineup (a partir das minhas conexões ativas)

**Given** preencho todos os campos obrigatórios e submeto
**When** `POST /api/v1/proposals` retorna 201
**Then** sou redirecionado para o detalhe da proposta com status "Aguardando resposta"

**Given** tento adicionar uma banda sem conexão ativa ao lineup
**When** seleciono a banda
**Then** "Você precisa ter uma conexão ativa com esta banda para incluí-la." é exibido

**Given** o formulário usa React Hook Form + Zod
**When** submeto sem data
**Then** "A data do evento é obrigatória." é exibido

---

### Story 6.2: Venue Cria Proposta com Bandas

Como venue,
Quero criar uma proposta de show selecionando bandas do mapa ou busca,
Para que eu monte meu lineup sem precisar de contatos pessoais.

**Acceptance Criteria:**

**Given** estou autenticado como `venue` e navego para criar proposta
**When** o formulário carrega com `initiator_type: 'venue'`
**Then** os campos são: seleção de bandas (busca ou mapa), data, cachê por banda, descrição da noite

**Given** busco por uma banda
**When** os resultados aparecem
**Then** posso selecionar múltiplas bandas para o lineup

**Given** submeto com pelo menos uma banda e data
**When** `POST /api/v1/proposals` retorna 201
**Then** a proposta é criada com `initiator_type: 'venue'` e todas as bandas selecionadas recebem notificações

**Given** uma banda tem `is_visible: false`
**When** aparece nos resultados de busca
**Then** ela não é retornada (apenas perfis visíveis são descobríveis)

---

### Story 6.3: Produtor Cria Proposta Composta

Como produtor,
Quero criar uma proposta selecionando venue e bandas em um único fluxo,
Para que eu organize um evento completo do zero dentro da plataforma.

**Acceptance Criteria:**

**Given** estou autenticado como `producer` e navego para criar proposta
**When** o formulário carrega com `initiator_type: 'producer'`
**Then** os campos são: seleção de venue + seleção de bandas + data + cachê + descrição (tudo em um fluxo)

**Given** seleciono venue e pelo menos uma banda e submeto
**When** `POST /api/v1/proposals` retorna 201
**Then** `initiator_type: 'producer'` é enviado e todas as partes (venue + bandas) recebem notificações

**Given** o formulário é válido e submetido
**When** a proposta é criada
**Then** sou redirecionado para o detalhe com status "Aguardando respostas"

---

### Story 6.4: Aceitar ou Rejeitar Proposta

Como venue ou banda,
Quero aceitar ou rejeitar uma proposta que recebi,
Para que eu dê uma resposta formal ao iniciador.

**Acceptance Criteria:**

**Given** tenho uma proposta pendente
**When** visualizo o detalhe da proposta
**Then** vejo todos os detalhes + botões "Aceitar" e "Rejeitar"

**Given** clico em "Aceitar"
**When** `PUT /api/v1/proposals/:id/accept` retorna 200
**Then** o status da proposta muda para "Aceita" e o iniciador recebe uma notificação

**Given** clico em "Rejeitar"
**When** um campo de texto para feedback aparece e submeto
**Then** `PUT /api/v1/proposals/:id/reject` é chamado com o texto de feedback e o iniciador é notificado com o motivo

**Given** todas as partes de uma proposta multi-parte aceitam
**When** a última aceitação é confirmada
**Then** o status da proposta muda para "Show Fechado"

**Given** já respondi à proposta
**When** visualizo novamente
**Then** os botões aceitar/rejeitar são substituídos pela resposta que dei

---

### Story 6.5: Histórico de Propostas

Como usuário,
Quero ver todas as minhas propostas organizadas por status,
Para que eu acompanhe o progresso das minhas negociações de show.

**Acceptance Criteria:**

**Given** navego para `/app/proposals`
**When** a página carrega
**Then** as propostas são agrupadas por status: "Aguardando", "Aceitas", "Recusadas", "Shows Fechados", "Canceladas"

**Given** um grupo de status não tem propostas
**When** renderizado
**Then** o `EmptyState` daquele grupo é exibido (não uma seção em branco)

**Given** clico em qualquer card de proposta
**When** a página de detalhe carrega
**Then** todas as informações são exibidas: partes, data, cachê, histórico de status e link para o chat

**Given** a lista está carregando
**When** os dados não chegaram
**Then** `AsyncState` exibe os skeletons de card

---

### Story 6.6: Cancelar Proposta

Como usuário iniciador de uma proposta,
Quero cancelar uma proposta antes de ela receber uma decisão final,
Para que eu possa retirar uma oferta que não é mais válida.

**Acceptance Criteria:**

**Given** sou o iniciador e o status da proposta é "Aguardando"
**When** clico em "Cancelar Proposta"
**Then** um modal de confirmação aparece

**Given** confirmo o cancelamento
**When** `DELETE /api/v1/proposals/:id` retorna 200
**Then** o status muda para "Cancelada" e todas as partes recebem uma notificação

**Given** a proposta já foi aceita ou rejeitada
**When** visualizo o detalhe
**Then** o botão cancelar não está visível

**Given** cancelo a proposta
**When** a ação completa
**Then** a proposta cancelada permanece no meu histórico com status "Cancelada" (não é deletada)

---

## Epic 7: Comunicação em Tempo Real

Usuários trocam mensagens em tempo real via chat, recebem notificações in-app de mensagens e propostas, e podem denunciar mensagens.

**FRs cobertos:** FR27, FR28, FR29, FR30, FR31, FR32

### Story 7.1: Iniciar e Visualizar Chat

Como usuário,
Quero iniciar uma conversa a partir de uma proposta ou perfil e ver meu histórico de conversas,
Para que eu me comunique diretamente com outras partes sem sair da plataforma.

**Acceptance Criteria:**

**Given** estou no detalhe de uma proposta
**When** clico em "Chat sobre esta proposta"
**Then** uma conversa é criada (ou existente aberta) e sou levado para `/app/chat/:conversationId`

**Given** estou no perfil de outro usuário
**When** clico em "Iniciar Chat"
**Then** o mesmo fluxo de abertura/criação de conversa se aplica

**Given** navego para `/app/chat`
**When** a página carrega
**Then** vejo a lista de todas as minhas conversas com: avatar, nome, preview da última mensagem, timestamp

**Given** não tenho conversas
**When** a lista de chat renderiza
**Then** "Nenhuma conversa ainda. Inicie um chat a partir de uma proposta." é exibido via `EmptyState`

**Given** abro uma conversa
**When** o histórico carrega
**Then** todas as mensagens são exibidas em ordem cronológica (mais recente no final)

---

### Story 7.2: Mensagens em Tempo Real

Como usuário em uma conversa,
Quero enviar e receber mensagens em tempo real com confirmação de entrega,
Para que eu negocie sem precisar recarregar a página.

**Acceptance Criteria:**

**Given** estou em uma janela de chat
**When** digito uma mensagem e pressiono Enter ou clico "Enviar"
**Then** `useChatChannel` envia a mensagem via ActionCable `ChatChannel`

**Given** a mensagem é enviada
**When** o servidor confirma a entrega
**Then** um indicador "✓ Enviado" aparece na minha mensagem

**Given** a outra parte envia uma mensagem
**When** estou na tela de chat
**Then** a nova mensagem aparece instantaneamente sem refresh da página

**Given** o WebSocket desconecta durante o chat
**When** o `WsStatusBadge` exibe "Reconectando..."
**Then** o usuário vê o indicador de reconexão e não perde mensagens já enviadas

**Given** envio uma mensagem com conteúdo HTML ou tags de script
**When** renderizado na UI
**Then** o conteúdo é sanitizado via DOMPurify antes de ser exibido (zero XSS)

---

### Story 7.3: Notificações In-App de Mensagens

Como usuário,
Quero receber notificações in-app quando recebo uma nova mensagem,
Para que eu seja alertado sem precisar ficar na página de chat.

**Acceptance Criteria:**

**Given** estou em qualquer parte do app e recebo uma nova mensagem
**When** o `NotificationsChannel` recebe o evento
**Then** `notificationStore` incrementa a contagem de não-lidos e `NotificationBell` exibe um badge

**Given** clico no sino de notificações
**When** o dropdown abre
**Then** vejo a notificação: "Nova mensagem de [Nome]" com link para a conversa

**Given** clico na notificação
**When** chego no chat da conversa
**Then** a contagem de não-lidos daquela conversa é zerada

**Given** já estou na conversa ativa
**When** uma nova mensagem chega
**Then** a notificação NÃO é adicionada ao sino (já estou lendo)

---

### Story 7.4: Notificações In-App de Propostas

Como usuário,
Quero receber notificações in-app quando uma proposta é enviada, aceita ou rejeitada,
Para que eu responda prontamente às mudanças nas minhas negociações.

**Acceptance Criteria:**

**Given** uma nova proposta é enviada para mim
**When** o `NotificationsChannel` faz broadcast
**Then** uma notificação aparece: "Nova proposta recebida de [Nome]" com link para a proposta

**Given** uma proposta que enviei é aceita
**When** o evento chega
**Then** "Sua proposta foi aceita por [Nome]!" é exibido no sino

**Given** uma proposta que enviei é rejeitada
**When** o evento chega
**Then** "Sua proposta foi recusada por [Nome]." é exibido com o motivo de rejeição (se fornecido)

**Given** tenho notificações não lidas
**When** o sino exibe o badge
**Then** a contagem é precisa e atualiza em tempo real

**Given** clico em uma notificação de proposta
**When** chego no detalhe da proposta
**Then** a notificação é marcada como lida

---

### Story 7.5: Denúncia de Mensagem

Como usuário,
Quero denunciar uma mensagem de chat que viola os termos da plataforma,
Para que eu possa sinalizar conteúdo abusivo para a equipe de moderação.

**Acceptance Criteria:**

**Given** estou em um chat
**When** clico no menu "..." de qualquer mensagem recebida
**Then** "Denunciar mensagem" aparece como opção

**Given** clico em "Denunciar mensagem"
**When** o `ReportMessageModal` abre
**Then** vejo opções de motivo: "Spam", "Assédio", "Conteúdo ofensivo", "Outro"

**Given** seleciono um motivo e submeto
**When** `POST /api/v1/reports` retorna 201
**Then** o modal fecha e "Denúncia enviada. Nossa equipe vai analisar." é exibido

**Given** a denúncia é submetida
**When** o admin visualiza relatórios (Epic 9)
**Then** a denúncia aparece com: conteúdo da mensagem, denunciante, denunciado e motivo

---

## Epic 8: Mini Landing Pages

Usuário cria e edita sua mini landing page pública com builder de blocos e preview em tempo real; a página é indexável por buscadores via Rails server-side rendering.

**FRs cobertos:** FR33, FR34, FR35, FR36

### Story 8.1: Criar Landing Page com Builder de Blocos

Como usuário,
Quero criar minha mini landing page com um builder de blocos,
Para que eu tenha uma página pública para divulgar minha música e informações de contato.

**Acceptance Criteria:**

**Given** navego para `/app/landing-page`
**When** a página carrega
**Then** vejo a interface do builder com botão "Adicionar bloco"

**Given** clico em "Adicionar bloco"
**When** o seletor de blocos aparece
**Then** posso escolher: Texto, Imagem, Link

**Given** adiciono um bloco de Texto
**When** o bloco é adicionado
**Then** um editor de texto inline aparece para aquele bloco

**Given** adiciono um bloco de Imagem
**When** o bloco é adicionado
**Then** uma área de upload de imagem é exibida

**Given** adiciono um bloco de Link
**When** o bloco é adicionado
**Then** campos de URL e label aparecem

**Given** já tenho blocos salvos
**When** carrego o builder
**Then** os blocos existentes são carregados via `GET /api/v1/landing-pages/:profileId` e pré-preenchidos

---

### Story 8.2: Editar Blocos com Preview em Tempo Real

Como usuário editando minha landing page,
Quero ver um preview ao vivo da minha página enquanto edito blocos,
Para que eu saiba exatamente como minha página pública ficará antes de salvar.

**Acceptance Criteria:**

**Given** o builder está aberto
**When** digito em um bloco de Texto
**Then** o componente `LandingPagePreview` atualiza em tempo real (sem delay perceptível)

**Given** reordeno blocos (via setas para cima/baixo)
**When** a ordem muda
**Then** o preview reflete imediatamente a nova ordem

**Given** clico em "Salvar"
**When** `POST/PUT /api/v1/landing-pages` retorna 200
**Then** "Landing page salva!" é exibido e os dados são persistidos

**Given** navego para outra rota sem salvar
**When** existem mudanças não salvas
**Then** "Você tem alterações não salvas. Deseja sair mesmo assim?" é exibido

**Given** deleto um bloco
**When** confirmado
**Then** o bloco desaparece do editor e do preview imediatamente

---

### Story 8.3: Acesso Público e SEO

Como visitante ou usuário não autenticado,
Quero acessar a landing page pública de alguém via URL,
Para que eu descubra sua música e entre em contato mesmo sem uma conta GarageDom.

**Acceptance Criteria:**

**Given** um usuário tem uma landing page salva
**When** `/l/:slug` é acessado no browser
**Then** o servidor Rails renderiza o HTML com todo o conteúdo dos blocos presente no HTML inicial (sem JavaScript obrigatório)

**Given** a página é renderizada pelo Rails
**When** um motor de busca faz crawl de `/l/:slug`
**Then** as meta tags `<title>`, `og:title`, `og:description` e `og:image` estão presentes e preenchidas com os dados do perfil

**Given** a landing page não depende de JavaScript
**When** renderizada com JS desabilitado
**Then** toda a página é legível: blocos de texto, imagens e links são visíveis

**Given** o perfil do usuário tem `is_visible: false`
**When** `/l/:slug` é acessado
**Then** a página retorna 404 ou "Página indisponível" (respeita privacidade LGPD)

---

## Epic 9: Administração e Moderação

Equipe interna visualiza métricas, modera perfis, resolve denúncias e bloqueia/desbloqueia usuários com registro de motivo.

**FRs cobertos:** FR37, FR38, FR39, FR40

### Story 9.1: Dashboard de Métricas Admin

Como membro da equipe interna GarageDom,
Quero visualizar um dashboard com métricas da plataforma,
Para que eu monitore a saúde e o crescimento da plataforma.

**Acceptance Criteria:**

**Given** estou autenticado como admin e navego para `/app/admin`
**When** o dashboard carrega
**Then** são exibidas: cadastros do dia/semana/mês, propostas enviadas, shows fechados, pins ativos por cidade

**Given** o dashboard carrega
**When** busca `GET /api/v1/admin/metrics`
**Then** os dados são exibidos com `AsyncState` gerenciando estados de loading/erro/vazio

**Given** as métricas são exibidas
**When** visualizo "Pins por cidade"
**Then** uma lista ordenada de cidades com contagem de pins é exibida

**Given** não sou admin
**When** tento acessar `/app/admin/*`
**Then** `ProfileRoute` me redireciona para `/app/map`

---

### Story 9.2: Moderação de Perfis

Como admin,
Quero revisar e remover perfis que violam os termos de uso,
Para que eu mantenha a qualidade e segurança da plataforma.

**Acceptance Criteria:**

**Given** estou em `/app/admin/moderation`
**When** a página carrega
**Then** uma lista paginada de perfis é exibida com: logo, nome, tipo, cidade, data de cadastro, contagem de denúncias

**Given** seleciono um perfil
**When** clico em "Ver detalhes"
**Then** vejo o perfil completo incluindo conteúdo reportado e contagem de denúncias

**Given** decido remover um perfil
**When** clico em "Remover perfil" e insiro uma justificativa
**Then** `DELETE /api/v1/admin/profiles/:id` é chamado com o motivo

**Given** o perfil é removido
**When** a ação completa
**Then** o perfil é desativado, seu pin desaparece do mapa e o usuário é notificado

---

### Story 9.3: Resolução de Denúncias

Como admin,
Quero visualizar e resolver denúncias com histórico de ações,
Para que eu trate violações de forma consistente e mantenha um registro.

**Acceptance Criteria:**

**Given** navego para `/app/admin/reports`
**When** a página carrega
**Then** as denúncias são listadas com: tipo (perfil ou mensagem), denunciante, denunciado, motivo, data

**Given** clico em uma denúncia
**When** o detalhe abre
**Then** vejo o conteúdo denunciado (mensagem ou perfil) e opções de ação: "Ignorar" ou "Bloquear usuário"

**Given** resolvo uma denúncia com "Ignorar"
**When** salvo
**Then** o status da denúncia muda para "Resolvido - Sem ação" e é registrado com timestamp e admin responsável

**Given** resolvo com "Bloquear usuário"
**When** confirmado
**Then** o usuário é bloqueado (Story 9.4) e a denúncia é marcada como "Resolvido - Usuário bloqueado"

**Given** uma denúncia é resolvida
**When** visualizo o histórico
**Then** todas as ações passadas, admin responsável e notas são visíveis

---

### Story 9.4: Bloqueio e Desbloqueio de Usuários

Como admin,
Quero bloquear ou desbloquear usuários com motivo registrado,
Para que eu aplique os termos de uso com trilha de auditoria documentada.

**Acceptance Criteria:**

**Given** estou visualizando um perfil de usuário no admin
**When** clico em "Bloquear usuário"
**Then** um modal solicita o motivo e duração (ou indefinido)

**Given** submeto o bloqueio com um motivo
**When** `PUT /api/v1/admin/users/:id/block` retorna 200
**Then** o usuário é bloqueado, seu JWT é invalidado pelo backend e seu pin desaparece do mapa

**Given** um usuário bloqueado tenta fazer login
**When** a autenticação é tentada
**Then** recebe "Sua conta foi suspensa. Entre em contato com suporte@garagedom.com.br."

**Given** quero desbloquear um usuário
**When** clico em "Desbloquear" e confirmo
**Then** `PUT /api/v1/admin/users/:id/unblock` é chamado e o usuário pode fazer login novamente

**Given** um bloqueio é aplicado
**When** visualizo o log de auditoria
**Then** nome do admin bloqueador, timestamp e motivo estão registrados

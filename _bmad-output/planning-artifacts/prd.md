---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
status: 'complete'
completedAt: '2026-04-03'
inputDocuments:
  - 'garagedom-api/_bmad-output/planning-artifacts/prd.md'
  - 'garagedom-api/_bmad-output/planning-artifacts/architecture.md'
workflowType: 'prd'
classification:
  projectType: 'web_app'
  domain: 'entertainment_music'
  complexity: 'high'
  projectContext: 'greenfield'
---

# Product Requirements Document — GarageDom Web

**Author:** GarageDom
**Date:** 2026-04-03

## Sumário Executivo

O **GarageDom Web** é a interface React (SPA desktop-first) do marketplace SaaS 3-sided dedicado à música independente brasileira. O frontend materializa três primitivos de negócio inéditos — conexões entre artistas como unidade formal de negociação, workflow de proposta multi-iniciador, e descoberta geográfica via mapa — em uma experiência visual neo-brutalista que reflete a estética da cena underground que serve.

O produto resolve a ausência de infraestrutura formal no mercado musical independente: bandas e venues dependem de redes pessoais e redes sociais para fechar shows. O GarageDom Web torna a cena **visível geograficamente** — o mapa com logos reais de bandas e venues como pins é a prova social que converte visitante em usuário ativo.

A aplicação atende três perfis com experiências distintas — **Banda**, **Casa de Shows** e **Produtor** — mais um painel administrativo interno. Consome a API Rails via HTTP + WebSocket (ActionCable) para chat e notificações em tempo real.

### O que Torna Este Produto Especial

**O mapa é o produto.** Pins com logos reais criam densidade visual da cena — cada novo cadastro torna o mapa mais convincente para o próximo usuário, invertendo o cold-start problem: a descoberta geográfica é o argumento de adoção, não um recurso secundário.

**Neo-brutalismo como posicionamento.** A paleta `#F2CF1D` / `#F2BD1D` / `#403208` / `#0D0D0D` comunica que o GarageDom é ferramenta para quem faz música de verdade — não um produto genérico de SaaS.

**Ferramenta, não rede social.** A interface prioriza ações transacionais (enviar proposta, aceitar show, iniciar chat) sobre métricas de engajamento. Nenhuma plataforma combina agrupamento formal de artistas, fluxo multi-iniciador e descoberta geográfica num único frontend.

## Classificação do Projeto

- **Tipo:** Web Application — SPA (React + Vite)
- **Domínio:** Entretenimento / Música Independente
- **Complexidade:** Alta — tempo real, mapa interativo, 3 perfis com permissões distintas, state machines de proposta e conexão, LGPD
- **Contexto:** Greenfield

## Critérios de Sucesso

### Sucesso do Usuário

- **Banda:** Completa cadastro + perfil + upload de logo em menos de 5 minutos, sem suporte; visualiza o próprio pin no mapa imediatamente após cadastro; envia primeira proposta sem abandonar o fluxo
- **Casa de Shows:** Encontra bandas no mapa por cidade, cria proposta com lineup completo e aprova/rejeita sem dúvida sobre o próximo passo
- **Produtor:** Orquestra evento completo (venue + bandas) via plataforma sem contato externo
- **Indicador-chave:** Taxa de conclusão do fluxo de proposta ≥ 80% sem abandono

### Sucesso de Negócio

Primeiros 6 meses pós-lançamento em Jundiaí:
- 500 bandas cadastradas com perfil completo e pin visível no mapa
- 50 shows fechados via plataforma (fluxo completo pelo frontend)
- 20 cidades com pelo menos 1 pin ativo
- Taxa de conversão proposta → show fechado ≥ 20%
- Retenção de 30 dias após cadastro ≥ 40%

### Sucesso Técnico

- FCP < 1.0s | LCP < 2.5s | INP < 100ms | CLS < 0.1
- Mapa: carregamento inicial < 2s; pins < 1s após mapa carregado
- Bundle JS inicial < 200KB gzipped
- Nenhum fluxo crítico requer mais de 3 cliques para a ação principal
- Zero erros de UI não tratados em produção (estados de loading, erro e vazio em todos os componentes)
- Todos os 43 FRs do frontend implementados e acessíveis via interface

## Escopo do Produto

### MVP — Fase 1 (Experience MVP)

O produto precisa entregar a experiência completa para validar os três diferenciais centrais. Um MVP parcial não valida a proposta de valor. Todos os 43 FRs são obrigatórios, implementados sequencialmente por dependência:

| Ordem | Módulo | FRs |
|---|---|---|
| 1 | Autenticação | FR01–FR06 |
| 2 | Perfis + upload de logo | FR07–FR11 |
| 3 | Mapa interativo + pins | FR12–FR16 |
| 4 | Conexões entre bandas | FR17–FR20 |
| 5 | Workflow de propostas | FR21–FR26 |
| 6 | Comunicação em tempo real | FR27–FR32 |
| 7 | Mini landing pages | FR33–FR36 |
| 8 | Administração e moderação | FR37–FR40 |
| 9 | Navegação e experiência global | FR41–FR43 |

**Princípio de lançamento:** Seed manual de 20+ perfis em Jundiaí, SP antes da abertura pública — densidade mínima de pins para validar o mapa como argumento de adoção.

**Equipe:** Solo dev full-stack; backend Rails já especificado e aprovado para implementação.

### Crescimento — Fase 2 (Pós-MVP)

- Landing page premium (primeiro modelo de monetização)
- Avaliações e sistema de reputação de bandas/venues
- Notificações por e-mail
- Filtros avançados no mapa (gênero musical, disponibilidade)
- Responsividade mobile (iOS/Android via browser)

### Expansão — Fase 3 (Visão)

- App mobile nativo (iOS/Android)
- Interface para distribuição digital (Spotify, Deezer)
- Venda de ingressos integrada
- Expansão para outros tipos de artistas (teatro, standup)

## Jornadas do Usuário

### Jornada 1 — Banda: O Primeiro Show Fora da Cidade

**Persona:** Lucas, guitarrista de banda de rock independente em Campinas, SP. 2 anos de estrada, nunca tocou fora da cidade.

**Cena inicial:** Lucas abre o GarageDom pela primeira vez no laptop. A tela de entrada exibe o mapa — pins com logos de bandas e venues espalhados por SP. Primeiro pensamento: *"tem gente usando isso de verdade"*.

**Ação:** Clica em "Cadastrar". Formulário: nome da banda, cidade, tipo de perfil. Faz upload do logo — vê o pin aparecer no mapa em tempo real. Navega, encontra venue em SP. Convida outra banda de Campinas para conexão. Juntos enviam proposta de noite dupla.

**Momento de valor:** Notificação in-app: *"Venue X aceitou sua proposta"*. Lucas negocia cachê e horário via chat sem sair do GarageDom.

**Nova realidade:** Primeiro show em SP confirmado. Perfil com histórico público — próxima vez, venues o encontram no mapa.

---

### Jornada 2 — Casa de Shows: Montando uma Noite Especial

**Persona:** Carol, gerente de venue em BH. Quer noite temática rock + blues sem banda de blues na rede pessoal.

**Cena inicial:** Carol filtra bandas de blues no mapa por BH e cidades próximas. Vê logos como pins — clica para ver perfis com gênero musical, fotos e histórico.

**Ação:** Seleciona duas bandas nunca contatadas. Cria conexão entre elas e monta proposta com data, cachê e descrição da noite temática. Envia com um clique.

**Momento de valor:** Ambas aceitam. Histórico de propostas organizado por status.

**Nova realidade:** GarageDom substitui planilhas e WhatsApp na curadoria de lineup.

---

### Jornada 3 — Produtor: Orquestrando um Evento do Zero

**Persona:** Roberto, produtor independente no RJ. Evento temático sem venue fixo nem bandas confirmadas.

**Cena inicial:** Roberto filtra venues no mapa por capacidade. Clica nos pins para ver fotos do espaço e histórico.

**Ação:** Escolhe venue, seleciona 3 bandas descobertas no mapa. Monta proposta composta, envia. Venue faz contraproposta via chat — Roberto ajusta e confirma.

**Momento de valor:** Evento fechado sem contato prévio com nenhuma das partes.

**Nova realidade:** GarageDom é o escritório de produção — descoberta, negociação e comunicação em um lugar.

---

### Jornada 4 — Administrador da Plataforma

**Persona:** Equipe interna GarageDom, responsável por operações e qualidade.

**Cena inicial:** Admin acessa `/admin`. Dashboard exibe métricas: cadastros do dia, propostas enviadas, shows fechados, denúncias pendentes.

**Ação:** Revisa perfis, aprova ou recusa com justificativa. Examina denúncia de chat, bloqueia perfil infrator. Acompanha crescimento de pins por cidade.

**Momento de valor:** Plataforma saudável, operação controlada com visibilidade total.

---

### Resumo de Capacidades por Jornada

| Jornada | Capacidades de UI Necessárias |
|---|---|
| Banda | Cadastro, upload de logo, mapa com pin próprio, conexões, proposta, chat, notificações in-app |
| Casa de Shows | Filtro no mapa, perfil de banda, criação de proposta com lineup, histórico por status |
| Produtor | Seleção multi-entidade no mapa, proposta composta, chat, contraproposta |
| Admin | Dashboard de métricas, lista de moderação, resolução de denúncias, bloqueio de usuário |

## Requisitos de Domínio

### Conformidade (LGPD)

- Tela de cadastro exibe termos de uso e política de privacidade com aceite explícito (checkbox obrigatório)
- Controle de visibilidade do pin nas configurações do perfil — usuário pode se tornar invisível no mapa
- Fluxo de exclusão permanente de conta com confirmação em duas etapas e feedback sobre o que será apagado
- Sistema de denúncia acessível em mensagens de chat e perfis públicos

### Padrões de Interface por Domínio

- Onboarding máximo de 3 campos obrigatórios no cadastro inicial — músico underground não tolera formulários longos
- Linguagem da UI direta, sem jargão corporativo — negociação de shows é informal
- Mapa como contexto primário — qualquer ação de descoberta começa ou retorna ao mapa

### Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Pin sem logo degrada experiência visual do mapa | Fallback: avatar com iniciais + cor baseada no nome |
| Cold start — mapa vazio na primeira semana | Seed manual de 20+ perfis em Jundiaí antes do lançamento |
| Upload de logo lento bloqueia cadastro | Upload assíncrono — perfil criado primeiro, logo processado em background |
| WebSocket cai silenciosamente | Reconnect automático + indicador visual de status de conexão no chat |

## Inovação e Padrões Inéditos

### Áreas de Inovação Detectadas

**1. O Mapa como Argumento de Adoção**
Nenhuma plataforma de booking musical usa descoberta geográfica com identidade visual real (logos) como mecanismo central de conversão. O pin é a presença da banda no mundo — quanto mais densa a cena, mais convincente o produto para o próximo usuário.

**2. Workflow Multi-Iniciador com UX Adaptada por Perfil**
O mesmo fluxo de proposta adapta formulário, ordem de seleção e campos conforme o `profile_type` autenticado — sem criar 3 telas diferentes. Nenhum marketplace de entretenimento implementou isso como padrão de UX.

**3. Conexões como Primitivo Visual**
Bandas formam agrupamentos formais que aparecem como entidades únicas em propostas. A UI representa "você + Banda X" como unidade negociadora de forma imediata e intuitiva, sem explicação textual.

**4. Neo-Brutalismo como Posicionamento**
Paleta `#F2CF1D` / `#0D0D0D` e linguagem visual crua posicionam o GarageDom como ferramenta da cena underground — filtro natural de público-alvo integrado ao design.

### Paisagem Competitiva

Sympla e Ticket360 focam em eventos já fechados. Redes sociais focam em audiência existente. Nenhuma plataforma combina descoberta geográfica com identidade visual real nos pins + agrupamento formal de artistas + fluxo de proposta iniciado por qualquer dos 3 lados do marketplace.

### Abordagem de Validação

| Inovação | Métrica | Fallback |
|---|---|---|
| Mapa como argumento de adoção | % de cadastros originados por clique no mapa vs. busca direta | Busca textual por nome/cidade |
| Workflow multi-iniciador | Qual `profile_type` inicia mais propostas — calibrar UX para o dominante | UI simplificada com iniciador padrão |
| Conexões como primitivo | Taxa de propostas com conexão vs. individual nos primeiros 3 meses | Proposta individual continua funcionando |
| Neo-brutalismo | Bounce rate na landing < 60% | Ajuste de paleta mantendo identidade |

## Requisitos de Plataforma Web

### Arquitetura

SPA (React + Vite) para rotas autenticadas (`/app/*`). Mini landing pages (`/l/:slug`) e rota raiz (`/`) requerem pré-renderização estática ou SSR para indexação por motores de busca.

### Matriz de Browsers

| Browser | Suporte |
|---|---|
| Chrome / Edge (últimas 2 versões) | ✓ Primário |
| Firefox (últimas 2 versões) | ✓ Primário |
| Safari (últimas 2 versões) | ✓ Secundário |
| Mobile browsers | ✗ Fora do escopo MVP |

### Design Responsivo

- Desktop-first — viewport mínimo: 1280px; layout fluido até 1920px
- Mobile e tablet fora do escopo MVP

### Estratégia de SEO

- Rotas `/app/*`: SPA client-side — sem requisito de SEO
- `/l/:slug`: conteúdo indexável sem JavaScript (pré-renderização ou SSR)
- `/`: landing page de marketing — pré-renderização recomendada
- Meta tags dinâmicas (`<title>`, `og:image`, `og:description`) nas rotas públicas

## Requisitos Funcionais

### Autenticação e Conta

- **FR01:** Visitante cria conta com e-mail e senha via formulário de cadastro
- **FR02:** Visitante cria conta via OAuth (Google ou Facebook) com redirecionamento e retorno à app
- **FR03:** Usuário faz login com e-mail/senha ou via OAuth
- **FR04:** Usuário solicita redefinição de senha por e-mail
- **FR05:** Usuário exclui conta e dados permanentemente com confirmação em duas etapas
- **FR06:** Visitante visualiza e aceita termos de uso e política de privacidade no cadastro (checkbox obrigatório — LGPD)

### Perfis e Identidade

- **FR07:** Usuário cria perfil com tipo fixo: banda, casa de shows ou produtor
- **FR08:** Usuário faz upload de logo/avatar associado ao perfil
- **FR09:** Usuário edita informações do perfil (nome, bio, gênero musical, cidade, membros, fotos)
- **FR10:** Usuário controla visibilidade do pin no mapa (público ou oculto — LGPD)
- **FR11:** Usuário visualiza perfil público de outros usuários com histórico de shows e informações

### Descoberta e Mapa

- **FR12:** Usuário visualiza mapa interativo com pins por cidade — cada pin exibe o logo real da entidade
- **FR13:** Usuário clica em pin para visualizar card de perfil resumido sem sair do mapa
- **FR14:** Usuário filtra pins por tipo de entidade (banda, venue, produtor)
- **FR15:** Usuário navega pelo mapa livremente (zoom, pan, busca por cidade)
- **FR16:** Usuário vê o próprio pin aparecer no mapa após completar o cadastro

### Conexões entre Artistas

- **FR17:** Banda envia convite de conexão para outra banda a partir do perfil ou mapa
- **FR18:** Banda aceita ou recusa convite de conexão recebido via notificação
- **FR19:** Banda visualiza lista de conexões ativas
- **FR20:** Banda desfaz uma conexão existente

### Workflow de Propostas de Eventos

- **FR21:** Banda (com conexão ativa) cria e envia proposta de evento para venue com seleção de data e cachê
- **FR22:** Venue cria proposta de evento selecionando bandas do mapa ou busca
- **FR23:** Produtor cria proposta de evento selecionando venue e bandas em um único fluxo
- **FR24:** Venue aceita ou rejeita proposta com feedback ao proponente
- **FR25:** Usuário visualiza histórico de propostas enviadas e recebidas por status
- **FR26:** Usuário cancela proposta antes da decisão final

### Comunicação em Tempo Real

- **FR27:** Usuário inicia conversa de chat com outro usuário a partir de proposta ou perfil
- **FR28:** Usuário envia e recebe mensagens em tempo real com entrega confirmada
- **FR29:** Usuário visualiza histórico completo de conversas
- **FR30:** Usuário recebe notificação in-app ao receber nova mensagem (sem recarregar a página)
- **FR31:** Usuário recebe notificação in-app quando proposta é enviada, aceita ou rejeitada
- **FR32:** Usuário denuncia mensagem de chat com seleção de motivo

### Mini Landing Pages

- **FR33:** Usuário cria mini landing page associada ao perfil com builder de blocos
- **FR34:** Usuário edita blocos de conteúdo (texto, imagens, links) com preview em tempo real
- **FR35:** Landing page é acessível por URL pública sem autenticação
- **FR36:** Landing page é indexável por motores de busca (conteúdo disponível sem JavaScript)

### Administração e Moderação

- **FR37:** Admin visualiza dashboard com métricas (cadastros, propostas, shows fechados, pins por cidade)
- **FR38:** Admin modera e remove perfis que violam termos de uso
- **FR39:** Admin visualiza e resolve denúncias com histórico de ação
- **FR40:** Admin bloqueia ou desbloqueia usuários com registro de motivo

### Navegação e Experiência Global

- **FR41:** Usuário autenticado acessa menu de navegação contextual adaptado ao `profile_type`
- **FR42:** Usuário visualiza estados de loading, erro e vazio em todos os fluxos críticos
- **FR43:** Sessão mantida entre visitas sem novo login (refresh token silencioso)

## Requisitos Não-Funcionais

### Performance

- FCP < 1.0s | LCP < 2.5s | INP < 100ms | CLS < 0.1 (Core Web Vitals nível "Good")
- Mapa: carregamento inicial < 2s; pins < 1s após mapa carregado
- Chat: entrega de mensagens < 500ms via WebSocket
- Bundle JS inicial < 200KB gzipped — code splitting por rota obrigatório; Leaflet via lazy loading
- Respostas da API para ações do usuário < 1s

### Segurança

- JWT armazenado em memória (não `localStorage`/`sessionStorage`) — proteção contra XSS
- Refresh token com renovação silenciosa de sessão sem logout forçado
- Toda comunicação via TLS 1.2+ — sem fallback para HTTP
- WebSocket autenticado via `token=` no handshake — conexão rejeitada se token inválido
- Conteúdo gerado pelo usuário sanitizado antes de renderização — zero XSS
- CORS restrito ao domínio do frontend configurado no backend

### Escalabilidade

- MVP dimensionado para ~500 usuários ativos (lançamento Jundiaí)
- Arquitetura suporta expansão nacional sem refatoração de frontend
- Mapa renderiza até 5.000 pins simultâneos — clustering obrigatório acima de 200 pins na mesma área

### Acessibilidade

- Conformidade WCAG 2.1 AA
- Todos os fluxos críticos navegáveis por teclado sem mouse
- Contraste mínimo 4.5:1 texto normal, 3:1 texto grande (`#F2CF1D` sobre `#0D0D0D` = 13.7:1 ✓)
- Roles ARIA e landmarks semânticos em todos os componentes Shadcn/ui
- Estados de foco visíveis em todos os elementos interativos

### Integração

- Rails API (`/api/v1/`): HTTP REST com JSON simples — sem envelope, sem JSON:API spec
- ActionCable: WebSocket com reconexão automática e backoff exponencial; indicador visual de status no chat
- OAuth: redirecionamento para Google/Facebook — frontend recebe JWT no retorno via callback do backend
- Leaflet: mapa open source sem dependência de API key para renderização básica

### Confiabilidade

- Disponibilidade 99.5% uptime alinhada ao SLA do backend
- Falhas de WebSocket isoladas do restante da UI — chat fora do ar não bloqueia mapa ou propostas
- Toda falha de API exibe mensagem legível e ação de recuperação — zero telas em branco

# Story 3.5: Visualização de Perfil Público

Status: ready-for-dev

## Story

Como usuário,
Quero visualizar o perfil público de outro usuário com seu histórico,
Para que eu avalie antes de enviar uma conexão ou proposta.

---

## Acceptance Criteria

**AC1 — Exibição do perfil público**
- Given clico no nome ou pin de um usuário (ou navego diretamente para `/app/profile/:id`)
- When a página carrega
- Then vejo: logo (ou avatar fallback), nome, tipo de perfil, cidade, bio, gênero musical e histórico de shows (propostas fechadas)

**AC2 — Parsing via Zod**
- Given o perfil carrega
- When os dados são buscados via `GET /api/v1/profiles/:id`
- Then são parseados via `profileSchema` (Zod) antes de renderizar

**AC3 — Estado vazio de histórico**
- Given o perfil não tem histórico de shows
- When a seção de histórico é renderizada
- Then "Nenhum show registrado ainda." é exibido via `EmptyState`

**AC4 — Botão "Enviar Conexão" para bandas**
- Given estou autenticado como `profile_type: 'band'` e estou visualizando um perfil de banda
- When a página renderiza
- Then o botão "Enviar Conexão" é visível (se ainda não conectados)

- Given estou visualizando o meu próprio perfil
- When a página renderiza
- Then o botão "Enviar Conexão" não é exibido

**AC5 — Estado de loading com skeleton**
- Given o perfil está carregando
- When os dados não chegaram ainda
- Then `AsyncState` exibe o skeleton da página de perfil

**AC6 — Perfil não encontrado**
- Given a API retorna 404 para o perfil solicitado
- When a resposta chega
- Then "Perfil não encontrado." é exibido com um link "Explorar no mapa" para `/app/map`

**AC7 — Navegação de volta ao mapa**
- Given estou visualizando um perfil público
- When clico em "← Voltar ao mapa" ou uso o botão back do browser
- Then retorno ao mapa sem perder o estado de posição/zoom

---

## Technical Context

### Stack
- TanStack Query `useQuery` para `GET /api/v1/profiles/:id`
- `useAuthStore` para determinar profile_type do usuário logado
- `AsyncState` para estados de loading/erro/vazio
- `ProfileAvatar` (criado na Story 3.2) para logo com fallback
- React Router `useParams` para obter `id` da URL

### API Contract

```
GET /api/v1/profiles/:id
Success: 200 + Profile object completo (incluindo shows_history)
Error: 404 + { message: "Profile not found" }
```

### Profile Schema estendido

O objeto de perfil público pode incluir histórico de shows. Estender `profileSchema.ts`:

```typescript
export const showHistoryItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(),
  venue_name: z.string().optional(),
});

export const publicProfileSchema = profileSchema.extend({
  shows_history: z.array(showHistoryItemSchema).optional().default([]),
});

export type PublicProfile = z.infer<typeof publicProfileSchema>;
```

### Hook usePublicProfile

Em `src/features/profile/hooks/useProfile.ts` (criado na Story 3.3), adicionar:

```typescript
export function usePublicProfile(id: string) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () =>
      apiClient.get(`/profiles/${id}`).then(r => publicProfileSchema.parse(r.data)),
  });
}
```

### Lógica de exibição do botão de conexão

```typescript
const { user } = useAuthStore();
const isOwnProfile = user?.profileId === Number(id);
const canConnect =
  !isOwnProfile &&
  authStore.profileType === 'band' &&
  profile.profile_type === 'band' &&
  !alreadyConnected;
```

**Nota:** A funcionalidade de enviar conexão é implementada na Story 5.1. Nesta story, o botão pode estar presente mas ainda sem funcionalidade (`disabled` ou placeholder com `// TODO: Story 5.1`).

### Estrutura de arquivos a criar

```
src/features/profile/
  components/
    PublicProfilePage.tsx     ← novo
    ShowsHistory.tsx          ← novo (lista de shows ou EmptyState)
    ProfileHeader.tsx         ← novo (logo, nome, tipo, cidade, bio)
```

### Rota a adicionar em `src/router/index.tsx`

```typescript
{
  path: '/app/profile/:id',
  element: (
    <Suspense fallback={null}>
      <ProtectedRoute>
        <PublicProfilePage />
      </ProtectedRoute>
    </Suspense>
  ),
}
```

---

## Dependencies

- **Bloqueante:** Story 3.1 (Criação de Perfil) — precisa de perfis existentes para visualizar
- **Reutiliza:** `ProfileAvatar` (Story 3.2), `profileSchema` (Story 3.1), `AsyncState` (Story 1.1)
- **Alimenta:** Story 5.1 (Enviar Convite de Conexão) — o botão "Enviar Conexão" é o entry point
- **Backend API endpoint:** `GET /api/v1/profiles/:id` com histórico de shows

---

## Dev Notes

- Esta é a "mini vitrine" do músico (UX-DR09) — priorizar clareza visual e legibilidade
- O histórico de shows pode ser vazio no MVP — `EmptyState` com mensagem motivacional
- Para perfis de venue/produtor, o botão de conexão NÃO aparece (conexões são só entre bandas — FR17)
- A rota `/app/profile/:id` é protegida (requer login) — perfis públicos sem login são escopo futuro (mini landing pages - Epic 8)
- Manter navegação de volta ao mapa — o mapa é o contexto primário (UX-DR02)

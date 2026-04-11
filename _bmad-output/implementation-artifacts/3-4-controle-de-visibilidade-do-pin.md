# Story 3.4: Controle de Visibilidade do Pin

Status: ready-for-dev

## Story

Como usuário,
Quero controlar se meu pin aparece no mapa público,
Para que eu exerça meu direito LGPD de não ser descoberto sem meu consentimento.

---

## Acceptance Criteria

**AC1 — Desativar visibilidade**
- Given estou nas configurações do perfil (ex: `/app/profile/edit` com seção de privacidade)
- When desativo "Visível no mapa" e salvo
- Then `PUT /api/v1/profiles/:id` é chamado com `{ profile: { is_visible: false } }`

**AC2 — Pin oculto para outros usuários**
- Given `is_visible: false` está definido no perfil
- When outros usuários visualizam o mapa
- Then meu pin não aparece na listagem de pins públicos

**AC3 — Pin próprio ainda visível para mim**
- Given `is_visible: false` está definido
- When visualizo o mapa com minha própria sessão autenticada
- Then meu próprio pin ainda aparece com um indicador visual "Oculto para outros" (ex: ícone de cadeado ou badge)

**AC4 — Reativar visibilidade**
- Given reativo "Visível no mapa" e salvo
- When `PUT /api/v1/profiles/:id` retorna 200 com `is_visible: true`
- Then meu pin reaparece no mapa público e o indicador "Oculto para outros" some

**AC5 — Acessibilidade do toggle**
- Given o toggle de visibilidade é renderizado
- When interajo via teclado (Tab + Space/Enter)
- Then o foco é visível e a mudança de estado é anunciada via `aria-label` (ex: "Visibilidade no mapa: ativo/inativo")

**AC6 — Feedback de confirmação**
- Given altero o toggle e salvo
- When a API retorna 200
- Then um feedback visual confirma que a alteração foi salva ("Configuração de privacidade atualizada.")

**AC7 — Estado de loading**
- Given o toggle foi acionado e o save está pendente
- When aguardando resposta da API
- Then o toggle fica desabilitado durante a operação

---

## Technical Context

### Stack
- Shadcn/ui `Switch` component para o toggle
- TanStack Query `useMutation` para o PUT
- `useAuthStore` para `profileId`
- LGPD compliance: transparência sobre o efeito do toggle

### API Contract

```
PUT /api/v1/profiles/:id
Body: { profile: { is_visible: boolean } }
Success: 200 + Profile object atualizado
Error: 422 + { errors: [...] }
```

### Localização no UI

O toggle pode estar integrado na `EditProfilePage` (Story 3.3) como uma seção de "Privacidade", ou em uma página separada de configurações. Para o MVP, integrar na página de edição de perfil é mais simples.

### Implementação do indicador "Oculto para outros"

No componente do mapa (Story 4.x), o pin do usuário logado deve verificar `is_visible` do perfil próprio:

```typescript
// Dentro do componente de pin no mapa
if (isOwnProfile && !profile.is_visible) {
  return <Pin><ProfileAvatar name={profile.name} logoUrl={profile.logo_url} /><HiddenBadge /></Pin>
}
```

### Schema atualizado

`updateProfileSchema` (criado na Story 3.3) já suporta campos parciais — adicionar `is_visible` como campo opcional:

```typescript
export const updateProfileSchema = z.object({
  // ... campos existentes
  is_visible: z.boolean().optional(),
});
```

### Estrutura de arquivos a criar/atualizar

```
src/features/profile/
  components/
    VisibilityToggle.tsx    ← novo (Switch com aria-label e feedback)
    EditProfilePage.tsx     ← atualizar (adicionar seção de privacidade)
```

---

## Dependencies

- **Bloqueante:** Story 3.3 (Edição de Perfil) — o toggle vive na mesma página ou próximo a ela
- **Usado por:** Story 4.1 (Mapa Base com Pins) — o mapa precisa renderizar o indicador "Oculto para outros"
- **Backend API endpoint:** `PUT /api/v1/profiles/:id` com campo `is_visible`
- **LGPD:** Esta feature é requisito legal — não pode ser ignorada

---

## Dev Notes

- O texto do toggle deve ser claro e direto: "Aparecer no mapa para outros usuários"
- Incluir uma descrição curta abaixo do toggle explicando o efeito (UX: linguagem sem jargão)
- O indicador "Oculto para outros" no mapa é implementado na Story 4.x — nesta story só precisamos garantir que o campo `is_visible` seja controlável
- Acessibilidade WCAG 2.1 AA: `aria-checked`, `role="switch"`, `aria-label` descritivo

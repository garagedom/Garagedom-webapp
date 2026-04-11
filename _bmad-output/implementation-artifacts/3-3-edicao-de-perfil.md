# Story 3.3: Edição de Perfil

Status: ready-for-dev

## Story

Como usuário,
Quero editar as informações do meu perfil,
Para que eu mantenha meus dados precisos e completos.

---

## Acceptance Criteria

**AC1 — Pré-preenchimento do formulário**
- Given estou em `/app/profile/edit`
- When o formulário carrega
- Then os valores atuais estão pré-preenchidos: nome, bio, gênero musical, cidade, membros (se profile_type = 'band')

**AC2 — Atualização bem-sucedida**
- Given atualizo campos e submeto
- When `PUT /api/v1/profiles/:id` retorna 200
- Then "Perfil atualizado com sucesso." é exibido e os dados são atualizados via TanStack Query invalidation de `['profile', id]`

**AC3 — Validação de nome obrigatório**
- Given submeto com o campo nome vazio
- When clico em "Salvar"
- Then "O nome é obrigatório" é exibido e o formulário não é submetido

**AC4 — Validação via Zod**
- Given o formulário é submetido
- When validado via `profileSchema` (Zod)
- Then apenas dados válidos chegam à API

**AC5 — Campos condicionais por tipo**
- Given profile_type = 'band'
- When o formulário renderiza
- Then o campo "Membros" é exibido (texto livre ou lista de nomes)

- Given profile_type = 'venue' ou 'producer'
- When o formulário renderiza
- Then o campo "Membros" não é exibido

**AC6 — Estado de loading**
- Given o formulário está sendo submetido
- When aguardando resposta da API
- Then o botão "Salvar" exibe estado de loading e fica desabilitado

**AC7 — Erro de API**
- Given a API retorna erro
- When a resposta chega
- Then a mensagem de erro é exibida e o formulário permanece preenchido com os dados editados

**AC8 — Carregamento dos dados atuais**
- Given o perfil está sendo carregado
- When `GET /api/v1/profiles/:id` está pendente
- Then `AsyncState` exibe o skeleton do formulário

---

## Technical Context

### Stack
- React Hook Form + Zod (`updateProfileSchema`)
- TanStack Query: `useQuery` para carregar dados atuais + `useMutation` para PUT
- `useAuthStore` para obter `profileId`
- Tailwind v4 + Shadcn/ui (Input, Textarea, Button)

### API Contract

```
GET /api/v1/profiles/:id
Success: 200 + Profile object

PUT /api/v1/profiles/:id
Body: { profile: { name, bio, city, musical_genre, members? } }
Success: 200 + Profile object atualizado
Error: 422 + { errors: [...] }
```

### Schema Zod para update

Adicionar em `src/lib/schemas/profileSchema.ts`:

```typescript
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  bio: z.string().max(500).optional(),
  city: z.string().min(1, 'A cidade é obrigatória'),
  musical_genre: z.string().optional(),
  members: z.string().optional(), // somente para bands
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

### Hook useProfile

Criar `src/features/profile/hooks/useProfile.ts`:

```typescript
export function useProfile(id: number) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => apiClient.get(`/profiles/${id}`).then(r => profileSchema.parse(r.data)),
  });
}

export function useUpdateProfile(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiClient.put(`/profiles/${id}`, { profile: data }).then(r => profileSchema.parse(r.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
    },
  });
}
```

### Estrutura de arquivos a criar/atualizar

```
src/features/profile/
  hooks/
    useProfile.ts          ← novo (useProfile + useUpdateProfile)
  components/
    EditProfileForm.tsx    ← novo
  EditProfilePage.tsx      ← novo
```

### Rota a adicionar em `src/router/index.tsx`

```typescript
{
  path: '/app/profile/edit',
  element: (
    <Suspense fallback={null}>
      <ProtectedRoute>
        <EditProfilePage />
      </ProtectedRoute>
    </Suspense>
  ),
}
```

---

## Dependencies

- **Bloqueante:** Story 3.1 (Criação de Perfil) — precisa de `profileId` no auth store
- **Pode ser desenvolvida em paralelo com:** Story 3.2 (Upload de Logo)
- **Reutiliza:** `profileSchema`, `useAuthStore`, `AsyncState`
- **Backend API endpoint:** `GET /api/v1/profiles/:id` e `PUT /api/v1/profiles/:id`

---

## Dev Notes

- Usar `defaultValues` do React Hook Form com os dados carregados via `useQuery` — evita re-renders desnecessários
- O campo "Membros" pode ser um simples `Textarea` com instrução "Um nome por linha" para MVP
- `AsyncState` deve envolver o formulário inteiro enquanto os dados carregam
- Não redirecionar após salvar — exibir toast/feedback inline e manter o usuário na página de edição

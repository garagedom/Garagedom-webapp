import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';

const schema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await apiClient.put('/api/v1/auth/password', {
        user: {
          reset_password_token: token,
          password: data.password,
          password_confirmation: data.password_confirmation,
        },
      });
      void navigate('/login', {
        replace: true,
        state: { successMessage: 'Senha atualizada com sucesso. Faça login.' },
      });
    } catch {
      setError('root', { message: 'Link inválido ou expirado. Solicite um novo.' });
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}
        >
          GarageDom
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="px-3 py-2 text-sm bg-transparent outline-none"
              style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
              {...register('password')}
            />
            {errors.password && (
              <span className="text-xs" style={{ color: '#ef4444' }}>{errors.password.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password_confirmation" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>
              Confirmar senha
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              className="px-3 py-2 text-sm bg-transparent outline-none"
              style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
              {...register('password_confirmation')}
            />
            {errors.password_confirmation && (
              <span className="text-xs" style={{ color: '#ef4444' }}>{errors.password_confirmation.message}</span>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-center" style={{ color: '#ef4444' }}>{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#F2CF1D',
              color: '#0D0D0D',
              border: '2px solid #0D0D0D',
              boxShadow: '4px 4px 0 #F2CF1D',
            }}
          >
            {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </main>
  );
}

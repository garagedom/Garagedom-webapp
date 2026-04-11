import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { register as registerUser } from './authService';
import { useAuthStore } from '@/stores/authStore';

const registerSchema = z
  .object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    password_confirmation: z.string(),
    terms_accepted: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Você precisa aceitar os termos de uso para continuar',
      }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  if (isAuthenticated) return <Navigate to="/app/profile/create" replace />;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        terms_accepted: data.terms_accepted,
      });
      void navigate('/app/profile/create', { replace: true });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const axiosErr = err as {
          response?: { status?: number; data?: { code?: string; error?: string } };
        };
        if (axiosErr.response?.status === 422) {
          const code = axiosErr.response.data?.code;
          if (code === 'email_taken') {
            setError('email', { message: 'Este e-mail já está em uso' });
          } else if (code === 'terms_required') {
            setError('terms_accepted', {
              message: 'Você precisa aceitar os termos de uso para continuar',
            });
          } else {
            setError('root', {
              message: axiosErr.response.data?.error ?? 'Erro ao processar o cadastro',
            });
          }
        } else {
          setError('root', { message: 'Erro ao criar conta. Tente novamente.' });
        }
      } else {
        setError('root', { message: 'Erro de conexão. Verifique sua internet.' });
      }
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}
        >
          GarageDom
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: '#F2CF1D' }}
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="px-3 py-2 text-sm bg-transparent outline-none"
              style={{
                color: '#f3f4f6',
                border: '2px solid #F2CF1D',
              }}
              {...register('email')}
            />
            {errors.email && (
              <span className="text-xs" style={{ color: '#ef4444' }}>
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: '#F2CF1D' }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="px-3 py-2 text-sm bg-transparent outline-none"
              style={{
                color: '#f3f4f6',
                border: '2px solid #F2CF1D',
              }}
              {...register('password')}
            />
            {errors.password && (
              <span className="text-xs" style={{ color: '#ef4444' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password_confirmation"
              className="text-sm font-medium"
              style={{ color: '#F2CF1D' }}
            >
              Confirmar senha
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              className="px-3 py-2 text-sm bg-transparent outline-none"
              style={{
                color: '#f3f4f6',
                border: '2px solid #F2CF1D',
              }}
              {...register('password_confirmation')}
            />
            {errors.password_confirmation && (
              <span className="text-xs" style={{ color: '#ef4444' }}>
                {errors.password_confirmation.message}
              </span>
            )}
          </div>

          <div className="flex items-start gap-3">
            <input
              id="terms_accepted"
              type="checkbox"
              className="mt-0.5 w-4 h-4 cursor-pointer"
              style={{ accentColor: '#F2CF1D' }}
              {...register('terms_accepted')}
            />
            <label
              htmlFor="terms_accepted"
              className="text-sm cursor-pointer"
              style={{ color: '#9ca3af' }}
            >
              Aceito os termos de uso
            </label>
          </div>
          {errors.terms_accepted && (
            <span className="text-xs -mt-2" style={{ color: '#ef4444' }}>
              {errors.terms_accepted.message}
            </span>
          )}

          {errors.root && (
            <p className="text-sm text-center" style={{ color: '#ef4444' }}>
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            style={{
              backgroundColor: '#F2CF1D',
              color: '#0D0D0D',
              border: '2px solid #0D0D0D',
              boxShadow: '4px 4px 0 #F2CF1D',
            }}
          >
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>
          Já tem conta?{' '}
          <Link
            to="/login"
            className="font-medium underline"
            style={{ color: '#F2CF1D' }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}

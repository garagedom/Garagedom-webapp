import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { login } from './authService';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) return <Navigate to="/app/map" replace />;

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      void navigate('/app/map', { replace: true });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 401) {
          setError('root', { message: 'E-mail ou senha incorretos' });
        } else {
          setError('root', { message: 'Erro ao fazer login. Tente novamente.' });
        }
      } else {
        setError('root', { message: 'Erro de conexão. Verifique sua internet.' });
      }
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
              autoComplete="current-password"
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
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>
          Não tem conta?{' '}
          <Link
            to="/register"
            className="font-medium underline"
            style={{ color: '#F2CF1D' }}
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}

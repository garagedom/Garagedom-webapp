import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await apiClient.post('/api/v1/auth/password', { user: { email: data.email } });
    } catch {
      // Mostra sempre sucesso — não revela se o e-mail existe (segurança)
    } finally {
      setSent(true);
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

        {sent ? (
          <p className="text-sm text-center" style={{ color: '#9ca3af' }}>
            E-mail de redefinição enviado. Verifique sua caixa de entrada.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="px-3 py-2 text-sm bg-transparent outline-none"
                style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
                {...register('email')}
              />
              {errors.email && (
                <span className="text-xs" style={{ color: '#ef4444' }}>{errors.email.message}</span>
              )}
            </div>

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
              {isSubmitting ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>
          <Link to="/login" className="font-medium underline" style={{ color: '#F2CF1D' }}>
            Voltar para login
          </Link>
        </p>
      </div>
    </main>
  );
}

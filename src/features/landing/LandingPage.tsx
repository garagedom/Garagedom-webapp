import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <div className="w-full max-w-lg flex flex-col items-center gap-8">
        {/* Logo / Brand */}
        <div className="text-center">
          <h1
            className="text-6xl font-bold tracking-tight"
            style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}
          >
            GarageDom
          </h1>
          <p
            className="mt-4 text-lg"
            style={{ color: '#9ca3af' }}
          >
            Conecte bandas, venues e produtores. Faça a cena acontecer.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/login"
            className="px-8 py-3 text-base font-semibold text-center transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            style={{
              backgroundColor: '#F2CF1D',
              color: '#0D0D0D',
              border: '2px solid #0D0D0D',
              boxShadow: '4px 4px 0 #F2CF1D',
              outline: 'none',
            }}
          >
            Entrar
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 text-base font-semibold text-center transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            style={{
              backgroundColor: 'transparent',
              color: '#F2CF1D',
              border: '2px solid #F2CF1D',
              boxShadow: '4px 4px 0 #F2CF1D',
              outline: 'none',
            }}
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}

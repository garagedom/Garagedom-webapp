import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation/Navigation';

interface ComingSoonPageProps {
  title: string;
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      <Navigation />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-xl font-bold" style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}>
          {title}
        </h1>
        <p className="text-sm" style={{ color: '#6b7280' }}>Em breve</p>
        <Link to="/app/map" className="text-sm underline mt-2" style={{ color: '#9ca3af' }}>
          ← Voltar ao mapa
        </Link>
      </main>
    </div>
  );
}

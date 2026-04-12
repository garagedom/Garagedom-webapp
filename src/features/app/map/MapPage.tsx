import { useState } from 'react';
import { Navigation } from '@/components/Navigation/Navigation';
import { DeleteAccountModal } from '@/features/auth/DeleteAccountModal';

export default function MapPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      <Navigation />

      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        <p style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif', fontSize: '1.5rem' }}>
          Mapa em breve
        </p>

        {/* TODO: mover para Settings (Story futura) */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 text-xs"
          style={{ color: '#6b7280', border: '2px solid #374151', backgroundColor: 'transparent' }}
        >
          Excluir minha conta
        </button>
      </main>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}

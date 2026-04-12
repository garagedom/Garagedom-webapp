import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { logout } from './authService';

interface Props {
  onClose: () => void;
}

export function DeleteAccountModal({ onClose }: Props) {
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = confirmation === 'CONFIRMAR';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await apiClient.delete('/api/v1/account');
      logout();
      void navigate('/', {
        replace: true,
        state: { successMessage: 'Sua conta foi excluída permanentemente.' },
      });
    } catch {
      setError('Erro ao excluir conta. Tente novamente.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm p-6 flex flex-col gap-4"
        style={{ backgroundColor: '#1a1a1a', border: '2px solid #F2CF1D' }}
      >
        <h2 className="text-lg font-bold" style={{ color: '#F2CF1D' }}>
          Excluir conta
        </h2>

        <p className="text-sm" style={{ color: '#9ca3af' }}>
          Esta ação é permanente e removerá:
        </p>
        <ul className="text-sm list-disc list-inside" style={{ color: '#9ca3af' }}>
          <li>Perfil</li>
          <li>Pins no mapa</li>
          <li>Propostas</li>
          <li>Mensagens</li>
        </ul>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: '#F2CF1D' }}>
            Digite <strong>CONFIRMAR</strong> para continuar
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="px-3 py-2 text-sm bg-transparent outline-none"
            style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium"
            style={{ color: '#9ca3af', border: '2px solid #374151' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="flex-1 px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: '2px solid #ef4444',
            }}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir conta'}
          </button>
        </div>
      </div>
    </div>
  );
}

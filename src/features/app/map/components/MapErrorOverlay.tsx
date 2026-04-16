interface MapErrorOverlayProps {
  onRetry: () => void;
}

export function MapErrorOverlay({ onRetry }: MapErrorOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: 'rgba(13,13,13,0.8)' }}
    >
      <p style={{ color: '#f87171', fontFamily: 'Geist Variable, sans-serif' }}>
        Erro ao carregar pins. Tente novamente.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium"
        style={{
          backgroundColor: '#F2CF1D',
          color: '#0D0D0D',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}

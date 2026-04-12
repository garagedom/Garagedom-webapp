interface VisibilityToggleProps {
  isVisible: boolean;
  isPending: boolean;
  onChange: (value: boolean) => void;
}

export function VisibilityToggle({ isVisible, isPending, onChange }: VisibilityToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: '#F2CF1D' }}>
            Aparecer no mapa para outros usuários
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
            Quando desativado, seu pin fica oculto publicamente (LGPD)
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isVisible}
          aria-label={`Visibilidade no mapa: ${isVisible ? 'ativo' : 'inativo'}`}
          disabled={isPending}
          onClick={() => onChange(!isVisible)}
          className="relative w-11 h-6 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 disabled:opacity-50"
          style={{
            backgroundColor: isVisible ? '#F2CF1D' : '#374151',
          }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform"
            style={{
              backgroundColor: '#0D0D0D',
              transform: isVisible ? 'translateX(20px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>
    </div>
  );
}

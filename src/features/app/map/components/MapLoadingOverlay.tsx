export function MapLoadingOverlay() {
  return (
    <div
      className="absolute inset-0 z-[1000] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(13,13,13,0.6)' }}
    >
      <div
        className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: '#F2CF1D', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

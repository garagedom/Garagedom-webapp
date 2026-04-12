interface AsyncStateProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  skeleton?: React.ReactNode;
  errorMessage?: string;
  emptyMessage?: string;
  children: React.ReactNode;
}

function DefaultSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse p-4">
      <div className="h-4 rounded" style={{ backgroundColor: '#374151', width: '60%' }} />
      <div className="h-4 rounded" style={{ backgroundColor: '#374151', width: '80%' }} />
      <div className="h-4 rounded" style={{ backgroundColor: '#374151', width: '40%' }} />
    </div>
  );
}

export function AsyncState({
  isLoading,
  isError,
  isEmpty = false,
  skeleton,
  errorMessage = 'Erro ao carregar os dados.',
  emptyMessage,
  children,
}: AsyncStateProps) {
  if (isLoading) return <>{skeleton ?? <DefaultSkeleton />}</>;
  if (isError) return <p className="text-sm text-center py-6" style={{ color: '#ef4444' }}>{errorMessage}</p>;
  if (isEmpty && emptyMessage) return <p className="text-sm text-center py-6" style={{ color: '#6b7280' }}>{emptyMessage}</p>;
  return <>{children}</>;
}

interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm" style={{ color: '#6b7280' }}>{message}</p>
      {action}
    </div>
  );
}

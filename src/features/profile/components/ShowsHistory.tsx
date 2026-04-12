import { EmptyState } from '@/components/EmptyState';
import type { PublicProfile } from '@/lib/schemas/profileSchema';

interface ShowsHistoryProps {
  shows: PublicProfile['shows_history'];
}

export function ShowsHistory({ shows }: ShowsHistoryProps) {
  if (!shows || shows.length === 0) {
    return <EmptyState message="Nenhum show registrado ainda." />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {shows.map((show) => (
        <li
          key={show.id}
          className="px-4 py-3"
          style={{ border: '1px solid #374151' }}
        >
          <p className="text-sm font-medium" style={{ color: '#f3f4f6' }}>{show.title}</p>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            {show.date}{show.venue_name ? ` · ${show.venue_name}` : ''}
          </p>
        </li>
      ))}
    </ul>
  );
}

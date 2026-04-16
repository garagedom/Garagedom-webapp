import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useMapPins } from '../hooks/useMapPins';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

const mockPins = [
  { id: 1, name: 'Banda X', profile_type: 'band', latitude: -23.18, longitude: -46.89, city: 'Jundiaí', music_genre: 'Rock', logo_url: null },
  { id: 2, name: 'Venue Y', profile_type: 'venue', latitude: -23.55, longitude: -46.63, city: 'São Paulo', music_genre: null, logo_url: 'https://cdn.example.com/1.png' },
];

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => vi.clearAllMocks());

describe('useMapPins', () => {
  it('retorna pins ao carregar com sucesso', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPins });

    const { result } = renderHook(() => useMapPins(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].name).toBe('Banda X');
  });

  it('passa filtros como query params', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

    const { result } = renderHook(() => useMapPins({ profile_type: 'band', city: 'Jundiaí' }), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/map/pins', {
      params: { profile_type: 'band', city: 'Jundiaí' },
    });
  });

  it('expõe isError quando a API falha', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMapPins(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('expõe isLoading durante o carregamento', () => {
    vi.mocked(apiClient.get).mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useMapPins(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('rejeita payload inválido do backend', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [{ id: 'nao-numero' }] });

    const { result } = renderHook(() => useMapPins(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

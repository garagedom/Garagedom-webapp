import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createConsumer } from '@rails/actioncable';
import { getToken } from '@/lib/auth-token';
import { mapPinSchema, type MapPin } from '@/lib/schemas/mapSchema';

export function useMapChannel() {
  const queryClient = useQueryClient();
  const consumerRef = useRef<ReturnType<typeof createConsumer> | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Derive WS URL from VITE_API_URL to avoid duplicating env vars
    const wsBase = (import.meta.env.VITE_API_URL as string)
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
    const wsUrl = `${wsBase}/cable?token=${token}`;

    const consumer = createConsumer(wsUrl);
    consumerRef.current = consumer;

    const subscription = consumer.subscriptions.create('MapChannel', {
      received(data: unknown) {
        const event = data as { type: string; pin?: unknown; pin_id?: number };

        if (event.type === 'pin_added' && event.pin) {
          const parsed = mapPinSchema.safeParse(event.pin);
          if (!parsed.success) return;
          queryClient.setQueryData<MapPin[]>(['map-pins', {}], (old = []) => {
            if (old.some((p) => p.id === parsed.data.id)) return old;
            return [...old, parsed.data];
          });
        }

        if (event.type === 'pin_removed' && event.pin_id != null) {
          queryClient.setQueryData<MapPin[]>(['map-pins', {}], (old = []) =>
            old.filter((p) => p.id !== event.pin_id),
          );
        }

        if (event.type === 'pin_updated' && event.pin) {
          const parsed = mapPinSchema.safeParse(event.pin);
          if (!parsed.success) return;
          queryClient.setQueryData<MapPin[]>(['map-pins', {}], (old = []) =>
            old.map((p) => (p.id === parsed.data.id ? parsed.data : p)),
          );
        }
      },

      connected() {
        if (import.meta.env.DEV) console.debug('[MapChannel] connected');
      },

      disconnected() {
        if (import.meta.env.DEV) console.debug('[MapChannel] disconnected');
      },
    });

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
      consumerRef.current = null;
    };
  }, [queryClient]);
}

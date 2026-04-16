import { describe, it, expect } from 'vitest';
import { mapPinSchema, mapPinsSchema } from '../mapSchema';

const validPin = {
  id: 1,
  name: 'Banda X',
  profile_type: 'band' as const,
  latitude: -23.18,
  longitude: -46.89,
  city: 'Jundiaí',
  music_genre: 'Rock',
  logo_url: 'https://cdn.example.com/logos/1.png',
};

describe('mapPinSchema', () => {
  it('parseia pin válido com todos os campos', () => {
    expect(() => mapPinSchema.parse(validPin)).not.toThrow();
  });

  it('aceita logo_url null', () => {
    const pin = mapPinSchema.parse({ ...validPin, logo_url: null });
    expect(pin.logo_url).toBeNull();
  });

  it('aceita city null', () => {
    const pin = mapPinSchema.parse({ ...validPin, city: null });
    expect(pin.city).toBeNull();
  });

  it('aceita music_genre null', () => {
    const pin = mapPinSchema.parse({ ...validPin, music_genre: null });
    expect(pin.music_genre).toBeNull();
  });

  it('aceita profile_type venue e producer', () => {
    expect(() => mapPinSchema.parse({ ...validPin, profile_type: 'venue' })).not.toThrow();
    expect(() => mapPinSchema.parse({ ...validPin, profile_type: 'producer' })).not.toThrow();
  });

  it('rejeita profile_type inválido', () => {
    expect(() => mapPinSchema.parse({ ...validPin, profile_type: 'invalid' })).toThrow();
  });

  it('rejeita pin sem id', () => {
    const { id: _, ...withoutId } = validPin;
    expect(() => mapPinSchema.parse(withoutId)).toThrow();
  });
});

describe('mapPinsSchema', () => {
  it('parseia array de pins', () => {
    const result = mapPinsSchema.parse([validPin, { ...validPin, id: 2 }]);
    expect(result).toHaveLength(2);
  });

  it('parseia array vazio', () => {
    expect(mapPinsSchema.parse([])).toEqual([]);
  });
});

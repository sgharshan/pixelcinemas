import { generateSeatLayout } from '../../src/seats/layout.js';
import { calculatePrice } from '../../src/seats/pricing.js';
import { calculateSeatView } from '../../src/seats/view.js';

describe('seat domain', () => {
  test('generates stable, unique seat IDs and metadata', () => {
    const seats = generateSeatLayout({
      rows: ['A', 'B'], seatsPerRow: 3, premiumRows: ['B'], accessibleSeats: ['A-1'],
    });
    expect(seats.map((seat) => seat.id)).toEqual(['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'B-3']);
    expect(new Set(seats.map((seat) => seat.id))).toHaveProperty('size', 6);
    expect(seats[0]).toMatchObject({ accessible: true, type: 'standard' });
    expect(seats[3].type).toBe('premium');
  });

  test('prices mixed seats and rejects unknown categories', () => {
    expect(calculatePrice([{ type: 'standard' }, { type: 'premium' }], { standard: 9, premium: 14 }))
      .toEqual({ total: 23, items: { standard: 9, premium: 14 } });
    expect(() => calculatePrice([{ type: 'mystery' }], { standard: 9 })).toThrow(/price/i);
  });

  test('calculates bounded, symmetric approximate views', () => {
    const layout = generateSeatLayout({ rows: ['A', 'B'], seatsPerRow: 5 });
    const centre = calculateSeatView(layout.find((seat) => seat.id === 'A-3'), layout);
    const left = calculateSeatView(layout.find((seat) => seat.id === 'A-1'), layout);
    const right = calculateSeatView(layout.find((seat) => seat.id === 'A-5'), layout);
    const back = calculateSeatView(layout.find((seat) => seat.id === 'B-3'), layout);
    expect(centre.angleDegrees).toBe(0);
    expect(centre.offsetMetres).toBe(0);
    expect(left.angleDegrees).toBe(-right.angleDegrees);
    expect(back.distanceMetres).toBeGreaterThan(centre.distanceMetres);
    expect(Math.abs(left.transform.translateXPercent)).toBeLessThanOrEqual(24);
  });
});

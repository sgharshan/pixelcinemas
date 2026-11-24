import { generateBookingReference } from '../src/modules/bookings/bookingReference.js';
test('booking references are readable and sufficiently distinct', () => {
  const references = new Set(Array.from({ length: 200 }, generateBookingReference));
  expect(references.size).toBe(200);
  expect([...references][0]).toMatch(/^PX-[A-Z0-9]{8}$/);
});

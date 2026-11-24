import request from 'supertest';
import { createApp } from '../src/app.js';
import { Booking } from '../src/models/Booking.js';
import { Movie } from '../src/models/Movie.js';
import { Screening } from '../src/models/Screening.js';
import { User } from '../src/models/User.js';
import { createToken } from '../src/modules/auth/auth.service.js';
import { generateSeatLayout } from '../src/seats/layout.js';
import { seatHoldService } from '../src/seats/SeatHoldService.js';
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from './helpers/database.js';

const secret = 'booking-test-secret-with-enough-length'; const app = createApp({ jwtSecret: secret });
let customer; let other; let screening; let token;
beforeAll(startTestDatabase);
beforeEach(async () => {
  await clearTestDatabase(); seatHoldService.clear();
  [customer, other] = await User.create([{ name: 'Alex', email: 'alex@test.dev', passwordHash: 'x' }, { name: 'Sam', email: 'sam@test.dev', passwordHash: 'x' }]); token = createToken(customer, secret);
  const movie = await Movie.create({ title: 'Signal', synopsis: 'A sufficiently detailed synopsis for this test film.', genre: ['Drama'], durationMinutes: 100, ageRating: '12A', posterUrl: '/p.svg', backdropUrl: '/b.svg', releaseDate: '2026-12-01', status: 'now-showing' });
  screening = await Screening.create({ movie: movie.id, auditoriumName: 'Screen One', startsAt: '2027-12-20T19:30:00Z', seatLayout: generateSeatLayout({ rows: ['A'], seatsPerRow: 3, premiumRows: ['A'] }), prices: { standard: 9, premium: 14 }, status: 'scheduled' });
});
afterAll(stopTestDatabase);

test('books only an authenticated owner hold using server pricing and protects history', async () => {
  seatHoldService.hold(screening.id, ['A-1'], 'browser-1');
  const created = await request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`).send({ screeningId: screening.id, seatIds: ['A-1'], holdOwnerId: 'browser-1', total: 0.01 });
  expect(created.status).toBe(201); expect(created.body.booking).toMatchObject({ total: 14, status: 'confirmed' }); expect(created.body.booking.reference).toMatch(/^PX-/);
  const mine = await request(app).get('/api/bookings/me').set('Authorization', `Bearer ${token}`); expect(mine.body.bookings).toHaveLength(1);
  const forbidden = await request(app).get(`/api/bookings/${created.body.booking.id}`).set('Authorization', `Bearer ${createToken(other, secret)}`); expect(forbidden.status).toBe(404);
});

test('rejects missing/wrong holds and duplicate occupied seats', async () => {
  const missing = await request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`).send({ screeningId: screening.id, seatIds: ['A-1'], holdOwnerId: 'wrong' }); expect(missing.status).toBe(409);
  seatHoldService.hold(screening.id, ['A-1'], 'browser-1');
  await request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`).send({ screeningId: screening.id, seatIds: ['A-1'], holdOwnerId: 'browser-1' });
  seatHoldService.hold(screening.id, ['A-1'], 'browser-2');
  const duplicate = await request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`).send({ screeningId: screening.id, seatIds: ['A-1'], holdOwnerId: 'browser-2' }); expect(duplicate.status).toBe(409);
  expect(await Booking.countDocuments({ status: 'confirmed' })).toBe(1);
});

test('cancels eligible future bookings and releases seats', async () => {
  seatHoldService.hold(screening.id, ['A-2'], 'browser-1');
  const created = await request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`).send({ screeningId: screening.id, seatIds: ['A-2'], holdOwnerId: 'browser-1' });
  const cancelled = await request(app).patch(`/api/bookings/${created.body.booking.id}/cancel`).set('Authorization', `Bearer ${token}`); expect(cancelled.body.booking.status).toBe('cancelled'); expect(seatHoldService.getBooked(screening.id)).not.toContain('A-2');
});

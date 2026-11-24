import request from 'supertest';
import { createApp } from '../src/app.js';
import { Movie } from '../src/models/Movie.js';
import { User } from '../src/models/User.js';
import { createToken } from '../src/modules/auth/auth.service.js';
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from './helpers/database.js';

const secret = 'screening-test-secret-with-enough-length';
const app = createApp({ jwtSecret: secret });
let adminToken;
let customerToken;
let movie;

const moviePayload = {
  title: 'Signal at Midnight', synopsis: 'A projectionist discovers a message hidden between frames.',
  genre: ['Thriller'], durationMinutes: 118, ageRating: '15', posterUrl: '/poster.svg',
  backdropUrl: '/backdrop.svg', releaseDate: '2026-12-04', status: 'now-showing',
};

beforeAll(startTestDatabase);
beforeEach(async () => {
  await clearTestDatabase();
  movie = await Movie.create(moviePayload);
  const [admin, customer] = await User.create([
    { name: 'Admin', email: 'admin@pixel.test', passwordHash: 'unused', role: 'admin' },
    { name: 'Customer', email: 'customer@pixel.test', passwordHash: 'unused' },
  ]);
  adminToken = createToken(admin, secret);
  customerToken = createToken(customer, secret);
});
afterAll(stopTestDatabase);

function payload(overrides = {}) {
  return {
    movieId: movie.id, auditoriumName: 'Screen One', startsAt: '2027-12-20T19:30:00.000Z',
    layoutConfig: { rows: ['A', 'B'], seatsPerRow: 4, premiumRows: ['B'], accessibleSeats: ['A-1'] },
    prices: { standard: 9.99, premium: 14.99 }, ...overrides,
  };
}

test('administrator CRUD generates seats; public filters return populated films', async () => {
  const created = await request(app).post('/api/screenings').set('Authorization', `Bearer ${adminToken}`).send(payload());
  expect(created.status).toBe(201);
  expect(created.body.screening.seatLayout).toHaveLength(8);
  expect(created.body.screening.seatLayout[0]).toMatchObject({ id: 'A-1', accessible: true });

  const list = await request(app).get(`/api/screenings?movieId=${movie.id}&date=2027-12-20`);
  expect(list.status).toBe(200);
  expect(list.body.screenings[0].movie).toMatchObject({ title: movie.title });

  const updated = await request(app).patch(`/api/screenings/${created.body.screening.id}`)
    .set('Authorization', `Bearer ${adminToken}`).send({ auditoriumName: 'Screen Two' });
  expect(updated.body.screening.auditoriumName).toBe('Screen Two');

  await request(app).delete(`/api/screenings/${created.body.screening.id}`).set('Authorization', `Bearer ${adminToken}`);
  const bookable = await request(app).get('/api/screenings?status=scheduled');
  expect(bookable.body.screenings).toHaveLength(0);
});

test('rejects past screenings, invalid prices and customer mutation', async () => {
  const past = await request(app).post('/api/screenings').set('Authorization', `Bearer ${adminToken}`)
    .send(payload({ startsAt: '2020-01-01T10:00:00.000Z' }));
  expect(past.status).toBe(400);
  const invalidPrice = await request(app).post('/api/screenings').set('Authorization', `Bearer ${adminToken}`)
    .send(payload({ prices: { standard: -1, premium: 14 } }));
  expect(invalidPrice.status).toBe(400);
  const forbidden = await request(app).post('/api/screenings').set('Authorization', `Bearer ${customerToken}`).send(payload());
  expect(forbidden.status).toBe(403);
});

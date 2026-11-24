import request from 'supertest';
import { createApp } from '../src/app.js';
import { Movie } from '../src/models/Movie.js';
import { User } from '../src/models/User.js';
import { createToken } from '../src/modules/auth/auth.service.js';
import {
  clearTestDatabase,
  startTestDatabase,
  stopTestDatabase,
} from './helpers/database.js';

const jwtSecret = 'movie-integration-secret-with-enough-length';
const app = createApp({ jwtSecret });
let adminToken;
let customerToken;

const moviePayload = {
  title: 'Signal at Midnight',
  synopsis: 'A projectionist discovers a message hidden between frames.',
  genre: ['Thriller', 'Mystery'],
  durationMinutes: 118,
  ageRating: '15',
  posterUrl: '/posters/signal-at-midnight.svg',
  backdropUrl: '/backdrops/signal-at-midnight.svg',
  trailerUrl: 'https://example.com/trailers/signal-at-midnight',
  releaseDate: '2026-12-04',
  status: 'now-showing',
};

beforeAll(startTestDatabase);
beforeEach(async () => {
  await clearTestDatabase();
  const [admin, customer] = await User.create([
    { name: 'Admin', email: 'admin@pixel.test', passwordHash: 'not-used', role: 'admin' },
    { name: 'Customer', email: 'customer@pixel.test', passwordHash: 'not-used' },
  ]);
  adminToken = createToken(admin, jwtSecret);
  customerToken = createToken(customer, jwtSecret);
});
afterAll(stopTestDatabase);

describe('movie catalogue API', () => {
  test('lists public movies and filters by status, genre and search text', async () => {
    await Movie.create([
      moviePayload,
      {
        ...moviePayload,
        title: 'Little Orbit',
        synopsis: 'A family adventure beyond the moon.',
        genre: ['Family'],
        ageRating: 'PG',
        status: 'coming-soon',
      },
      { ...moviePayload, title: 'Archived Film', status: 'archived' },
    ]);

    const response = await request(app).get(
      '/api/movies?status=coming-soon&genre=Family&q=orbit',
    );

    expect(response.status).toBe(200);
    expect(response.body.movies).toHaveLength(1);
    expect(response.body.movies[0]).toMatchObject({
      title: 'Little Orbit',
      status: 'coming-soon',
      ageRating: 'PG',
    });
  });

  test('returns movie details and distinguishes invalid and missing IDs', async () => {
    const movie = await Movie.create(moviePayload);

    const detail = await request(app).get(`/api/movies/${movie.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.movie.title).toBe('Signal at Midnight');

    const invalid = await request(app).get('/api/movies/not-an-id');
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe('INVALID_ID');

    const missing = await request(app).get('/api/movies/507f1f77bcf86cd799439011');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('MOVIE_NOT_FOUND');
  });
});

describe('administrator movie CRUD API', () => {
  test('allows an administrator to create, update and archive a movie', async () => {
    const created = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(moviePayload);
    expect(created.status).toBe(201);
    expect(created.body.movie.title).toBe('Signal at Midnight');

    const updated = await request(app)
      .patch(`/api/movies/${created.body.movie.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Signal After Midnight', durationMinutes: 121 });
    expect(updated.status).toBe(200);
    expect(updated.body.movie).toMatchObject({
      title: 'Signal After Midnight',
      durationMinutes: 121,
    });

    const archived = await request(app)
      .delete(`/api/movies/${created.body.movie.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(archived.status).toBe(200);
    expect(archived.body.movie.status).toBe('archived');
  });

  test('forbids customer mutations', async () => {
    const response = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(moviePayload);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  test('rejects unknown or unsafe fields', async () => {
    const response = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...moviePayload, createdByAdmin: true, $where: 'return true' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
    expect(await Movie.countDocuments()).toBe(0);
  });
});

import bcrypt from 'bcrypt';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import {
  clearTestDatabase,
  startTestDatabase,
  stopTestDatabase,
} from './helpers/database.js';

const jwtSecret = 'integration-test-secret-with-enough-length';
const app = createApp({ jwtSecret });

beforeAll(startTestDatabase);
afterEach(clearTestDatabase);
afterAll(stopTestDatabase);

const validRegistration = {
  name: 'Alex Morgan',
  email: '  ALEX@Example.COM ',
  password: 'CinemaPass123!',
};

async function register(overrides = {}) {
  return request(app)
    .post('/api/auth/register')
    .send({ ...validRegistration, ...overrides });
}

describe('authentication API', () => {
  test('registers a customer with a normalised email and bcrypt hash', async () => {
    const response = await register();

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      role: 'customer',
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(response.body.token).toEqual(expect.any(String));

    const stored = await User.findOne({ email: 'alex@example.com' }).select('+passwordHash');
    expect(stored.passwordHash).not.toBe(validRegistration.password);
    await expect(bcrypt.compare(validRegistration.password, stored.passwordHash)).resolves.toBe(true);
  });

  test('rejects a duplicate email without creating another account', async () => {
    await register();
    const response = await register({ name: 'Another Person', email: 'alex@example.com' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { code: 'EMAIL_EXISTS', message: 'An account already uses this email' },
    });
    expect(await User.countDocuments()).toBe(1);
  });

  test('rejects invalid login credentials with one non-disclosing response', async () => {
    await register();

    const response = await request(app).post('/api/auth/login').send({
      email: 'alex@example.com',
      password: 'WrongPassword123!',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' },
    });
  });

  test('returns and updates the authenticated profile without password data', async () => {
    const registration = await register();
    const authorization = `Bearer ${registration.body.token}`;

    const profile = await request(app).get('/api/auth/me').set('Authorization', authorization);
    expect(profile.status).toBe(200);
    expect(profile.body.user.email).toBe('alex@example.com');
    expect(profile.body.user).not.toHaveProperty('passwordHash');

    const update = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', authorization)
      .send({ name: 'Alex Updated' });
    expect(update.status).toBe(200);
    expect(update.body.user.name).toBe('Alex Updated');
  });
});

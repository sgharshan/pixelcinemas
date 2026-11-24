import { getEnvironment } from '../src/config/env.js';

const validEnvironment = {
  PORT: '3001',
  MONGODB_URI: 'mongodb://localhost:27017/pixel-cinemas-test',
  JWT_SECRET: 'a-secure-test-secret-that-is-long-enough',
  CLIENT_ORIGIN: 'http://localhost:5173',
  SEAT_HOLD_SECONDS: '300',
};

describe('getEnvironment', () => {
  test('parses validated environment values into application types', () => {
    expect(getEnvironment(validEnvironment)).toEqual({
      port: 3001,
      mongoUri: 'mongodb://localhost:27017/pixel-cinemas-test',
      jwtSecret: 'a-secure-test-secret-that-is-long-enough',
      clientOrigin: 'http://localhost:5173',
      seatHoldSeconds: 300,
      nodeEnv: 'development',
    });
  });

  test.each([
    ['PORT', 'not-a-number'],
    ['MONGODB_URI', ''],
    ['JWT_SECRET', 'short'],
    ['CLIENT_ORIGIN', 'not-a-url'],
    ['SEAT_HOLD_SECONDS', '0'],
  ])('rejects an invalid %s value', (key, value) => {
    expect(() => getEnvironment({ ...validEnvironment, [key]: value })).toThrow(
      /invalid server environment/i,
    );
  });
});

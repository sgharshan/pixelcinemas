import express from 'express';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { AppError, errorHandler } from '../src/middleware/errorHandler.js';

describe('API error envelopes', () => {
  test('returns a stable not-found response for unknown API routes', async () => {
    const response = await request(createApp()).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  test('returns the public code, message and details from an AppError', async () => {
    const app = express();
    app.get('/expected', (_request, _response, next) => {
      next(new AppError('INVALID_INPUT', 'Check the highlighted fields', 400, {
        email: 'Enter a valid email address',
      }));
    });
    app.use(errorHandler);

    const response = await request(app).get('/expected');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_INPUT',
        message: 'Check the highlighted fields',
        details: { email: 'Enter a valid email address' },
      },
    });
  });

  test('hides internal exception details and stack traces', async () => {
    const app = express();
    app.get('/unexpected', () => {
      throw new Error('database password leaked here');
    });
    app.use(errorHandler);

    const response = await request(app).get('/unexpected');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    });
    expect(JSON.stringify(response.body)).not.toContain('database password');
    expect(JSON.stringify(response.body)).not.toContain('stack');
  });
});

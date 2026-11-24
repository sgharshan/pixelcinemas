import express from 'express';
import request from 'supertest';
import { createToken } from '../src/modules/auth/auth.service.js';
import { authenticate } from '../src/middleware/authenticate.js';
import { authorize } from '../src/middleware/authorize.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const jwtSecret = 'authorization-test-secret-with-enough-length';

function createProtectedApp() {
  const app = express();
  app.locals.jwtSecret = jwtSecret;
  app.get('/admin', authenticate, authorize('admin'), (request, response) => {
    response.json({ userId: request.user.id });
  });
  app.use(errorHandler);
  return app;
}

describe('role authorization', () => {
  test('rejects a missing token with 401 UNAUTHENTICATED', async () => {
    const response = await request(createProtectedApp()).get('/admin');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue' },
    });
  });

  test('rejects a customer from an administrator route with 403 FORBIDDEN', async () => {
    const token = createToken(
      { id: '507f1f77bcf86cd799439011', role: 'customer' },
      jwtSecret,
    );

    const response = await request(createProtectedApp())
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { code: 'FORBIDDEN', message: 'You do not have access to this action' },
    });
  });

  test('allows an administrator and exposes the verified user identity', async () => {
    const token = createToken(
      { id: '507f1f77bcf86cd799439011', role: 'admin' },
      jwtSecret,
    );

    const response = await request(createProtectedApp())
      .get('/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: '507f1f77bcf86cd799439011' });
  });
});

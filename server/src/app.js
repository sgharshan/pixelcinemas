import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { movieRouter } from './modules/movies/movie.routes.js';
import { screeningRouter } from './modules/screenings/screening.routes.js';

export function createApp({
  jwtSecret = 'development-only-secret-change-before-deploy',
  clientOrigin = 'http://localhost:5173',
} = {}) {
  const app = express();
  app.locals.jwtSecret = jwtSecret;
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/movies', movieRouter);
  app.use('/api/screenings', screeningRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

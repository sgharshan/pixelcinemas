import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { archive, create, detail, list, update } from './movie.controller.js';
import {
  createMovieSchema,
  movieQuerySchema,
  updateMovieSchema,
} from './movie.schemas.js';

export const movieRouter = Router();

movieRouter.get('/', validate(movieQuerySchema, 'query'), list);
movieRouter.get('/:id', detail);
movieRouter.post('/', authenticate, authorize('admin'), validate(createMovieSchema), create);
movieRouter.patch('/:id', authenticate, authorize('admin'), validate(updateMovieSchema), update);
movieRouter.delete('/:id', authenticate, authorize('admin'), archive);

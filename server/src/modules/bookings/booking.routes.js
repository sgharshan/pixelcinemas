import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js'; import { authorize } from '../../middleware/authorize.js'; import { validate } from '../../middleware/validate.js';
import { cancel, create, detail, list, mine, remove } from './booking.controller.js'; import { createBookingSchema } from './booking.schemas.js';
export const bookingRouter = Router(); bookingRouter.use(authenticate); bookingRouter.post('/', validate(createBookingSchema), create); bookingRouter.get('/me', mine); bookingRouter.get('/', authorize('admin'), list); bookingRouter.get('/:id', detail); bookingRouter.patch('/:id/cancel', cancel); bookingRouter.delete('/:id', authorize('admin'), remove);

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { getProfile, login, register, updateProfile } from './auth.controller.js';
import { loginSchema, registerSchema, updateProfileSchema } from './auth.schemas.js';

export const authRouter = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

authRouter.post('/register', authLimiter, validate(registerSchema), register);
authRouter.post('/login', authLimiter, validate(loginSchema), login);
authRouter.get('/me', authenticate, getProfile);
authRouter.patch('/me', authenticate, validate(updateProfileSchema), updateProfile);

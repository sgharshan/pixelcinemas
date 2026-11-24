import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export function authenticate(request, _response, next) {
  const authorization = request.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHENTICATED', 'Sign in to continue', 401));
  }

  try {
    const payload = jwt.verify(authorization.slice(7), request.app.locals.jwtSecret);
    request.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(new AppError('UNAUTHENTICATED', 'Sign in to continue', 401));
  }
}

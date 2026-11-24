import { AppError } from './errorHandler.js';

export function authorize(...roles) {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(
        new AppError('FORBIDDEN', 'You do not have access to this action', 403),
      );
    }
    return next();
  };
}

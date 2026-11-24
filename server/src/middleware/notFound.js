import { AppError } from './errorHandler.js';

export function notFound(_request, _response, next) {
  next(new AppError('NOT_FOUND', 'Route not found', 404));
}

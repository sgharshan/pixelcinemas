import { AppError } from './errorHandler.js';

export function validate(schema, source = 'body') {
  return (request, _response, next) => {
    const result = schema.safeParse(request[source]);
    if (!result.success) {
      const details = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] ?? 'form';
        if (details[field] === undefined) details[field] = issue.message;
      }
      return next(
        new AppError('INVALID_INPUT', 'Check the highlighted fields', 400, details),
      );
    }

    request[source] = result.data;
    return next();
  };
}

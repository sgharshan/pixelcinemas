export class AppError extends Error {
  constructor(code, message, status, details) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof AppError) {
    const publicError = { code: error.code, message: error.message };
    if (error.details !== undefined) publicError.details = error.details;
    return response.status(error.status).json({ error: publicError });
  }

  if (process.env.NODE_ENV !== 'test') console.error(error);
  return response.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}

const apiBase = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(message, { code, details, status } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export async function request(path, { method = 'GET', body, token, signal } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error?.message ?? 'The request could not be completed', {
      code: payload.error?.code,
      details: payload.error?.details,
      status: response.status,
    });
  }
  return payload;
}

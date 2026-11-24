import { request } from './http.js';

function queryString(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const moviesApi = {
  list: (filters, signal) => request(`/movies${queryString(filters)}`, { signal }),
  detail: (id, signal) => request(`/movies/${id}`, { signal }),
  create: (token, movie) => request('/movies', { method: 'POST', body: movie, token }),
  update: (token, id, movie) =>
    request(`/movies/${id}`, { method: 'PATCH', body: movie, token }),
  archive: (token, id) => request(`/movies/${id}`, { method: 'DELETE', token }),
};

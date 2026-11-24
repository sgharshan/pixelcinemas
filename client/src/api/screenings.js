import { request } from './http.js';
export const screeningsApi = {
  list: (query = {}, signal) => request(`/screenings?${new URLSearchParams(Object.entries(query).filter(([, value]) => value))}`, { signal }),
  detail: (id, signal) => request(`/screenings/${id}`, { signal }),
  create: (data, token) => request('/screenings', { method: 'POST', body: data, token }),
  update: (id, data, token) => request(`/screenings/${id}`, { method: 'PATCH', body: data, token }),
  cancel: (id, token) => request(`/screenings/${id}`, { method: 'DELETE', token }),
};

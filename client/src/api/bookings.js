import { request } from './http.js';
export const bookingsApi = { create: (data, token) => request('/bookings', { method: 'POST', body: data, token }), mine: (token, signal) => request('/bookings/me', { token, signal }), detail: (id, token, signal) => request(`/bookings/${id}`, { token, signal }), cancel: (id, token) => request(`/bookings/${id}/cancel`, { method: 'PATCH', token }) };

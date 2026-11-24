import { request } from './http.js';
export const adminApi = { stats: (token) => request('/admin/stats', { token }), movies: (token) => request('/movies?status=now-showing', { token }), screenings: (token) => request('/screenings', { token }), bookings: (token) => request('/bookings', { token }), deleteBooking: (id, token) => request(`/bookings/${id}`, { method: 'DELETE', token }) };

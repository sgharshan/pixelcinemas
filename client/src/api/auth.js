import { request } from './http.js';

export const authApi = {
  register: (details) => request('/auth/register', { method: 'POST', body: details }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  profile: (token) => request('/auth/me', { token }),
  updateProfile: (token, details) =>
    request('/auth/me', { method: 'PATCH', body: details, token }),
};

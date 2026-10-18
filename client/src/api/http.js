import { getSession } from './session';

async function request(path, { method = 'GET', body } = {}) {
  const token = getSession()?.token;
  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || `Request failed (${response.status})`);
  return data;
}

export const httpApi = {
  summary: () => request('/summary'),
  countries: () => request('/countries'),
  vaccinations: (isoCode) => request(`/countries/${isoCode}/vaccinations`),
  hospitalizations: (isoCode) => request(`/countries/${isoCode}/hospitalizations`),

  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  register: (username, password) => request('/auth/register', { method: 'POST', body: { username, password } }),

  watchlist: () => request('/watchlist'),
  watch: (isoCode) => request('/watchlist', { method: 'POST', body: { isoCode } }),
  unwatch: (isoCode) => request(`/watchlist/${isoCode}`, { method: 'DELETE' }),
};

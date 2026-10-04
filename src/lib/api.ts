const configuredApiBase = import.meta.env.VITE_API_BASE as string | undefined;

if (!configuredApiBase) {
  throw new Error('VITE_API_BASE is required. Configure it in the Cloudflare Pages build environment.');
}

const API_BASE = configuredApiBase.replace(/\/$/, '');

function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split('; ').find(v => v.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = getCookie('csrf_token');
    if (csrf) headers.set('X-CSRF-Token', csrf);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && retry && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    const refreshed = await fetch(`${API_BASE}/api/v1/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshed.ok) return request<T>(path, init, false);
  }

  const payload = await res.json().catch(() => null) as any;
  if (!res.ok) throw new Error(payload?.error?.message ?? `Request failed (${res.status})`);
  return payload.data as T;
}

export const api = {
  login: (login: string, password: string) => request<{ user: any; forcePasswordChange: boolean }>('/api/v1/auth/login', {
    method: 'POST', body: JSON.stringify({ login, password, client: 'web' })
  }),
  me: () => request<{ user: any }>('/api/v1/auth/me'),
  logout: () => request<{ loggedOut: boolean }>('/api/v1/auth/logout', { method: 'POST', body: '{}' }),
  dashboard: () => request<any>('/api/v1/admin/dashboard'),
  users: (q = '') => request<any>(`/api/v1/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  user: (id: string) => request<any>(`/api/v1/admin/users/${encodeURIComponent(id)}`),
  createUser: (body: any) => request<any>('/api/v1/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id: string, body: any) => request<any>(`/api/v1/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  setEnabled: (id: string, enabled: boolean) => request<any>(`/api/v1/admin/users/${encodeURIComponent(id)}/${enabled ? 'enable' : 'disable'}`, { method: 'POST', body: '{}' }),
  audit: () => request<any>('/api/v1/admin/audit')
};

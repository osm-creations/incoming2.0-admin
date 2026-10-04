const configuredApiBase = import.meta.env.VITE_API_BASE as string | undefined;

if (!configuredApiBase) {
  throw new Error('VITE_API_BASE is required. Configure it in the Cloudflare Pages build environment.');
}

const API_BASE = configuredApiBase.replace(/\/$/, '');

let csrfToken: string | null = null;

function rememberCsrfToken(value: unknown) {
  if (typeof value === 'string' && value.length >= 16) csrfToken = value;
}

async function loadCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  const res = await fetch(`${API_BASE}/api/v1/auth/csrf`, {
    method: 'GET',
    credentials: 'include'
  });
  const payload = await res.json().catch(() => null) as any;
  if (!res.ok) throw new Error(payload?.error?.message ?? 'Unable to verify this request. Please sign in again.');

  rememberCsrfToken(payload?.data?.csrfToken);
  if (!csrfToken) throw new Error('Unable to verify this request. Please sign in again.');
  return csrfToken;
}

async function refreshWebSession(): Promise<boolean> {
  const refreshed = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });
  const payload = await refreshed.json().catch(() => null) as any;
  if (!refreshed.ok) return false;
  rememberCsrfToken(payload?.data?.csrfToken);
  return true;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const needsCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method) && path.startsWith('/api/v1/admin/');
  if (needsCsrf) headers.set('X-CSRF-Token', await loadCsrfToken());

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && retry && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    const refreshed = await refreshWebSession();
    if (refreshed) return request<T>(path, init, false);
  }

  const payload = await res.json().catch(() => null) as any;
  if (!res.ok) throw new Error(payload?.error?.message ?? `Request failed (${res.status})`);
  rememberCsrfToken(payload?.data?.csrfToken);
  return payload.data as T;
}

export const api = {
  login: (login: string, password: string) => request<{ user: any; forcePasswordChange: boolean; csrfToken?: string }>('/api/v1/auth/login', {
    method: 'POST', body: JSON.stringify({ login, password, client: 'web' })
  }),
  me: () => request<{ user: any }>('/api/v1/auth/me'),
  logout: async () => {
    const result = await request<{ loggedOut: boolean }>('/api/v1/auth/logout', { method: 'POST', body: '{}' });
    csrfToken = null;
    return result;
  },
  dashboard: () => request<any>('/api/v1/admin/dashboard'),
  users: (q = '') => request<any>(`/api/v1/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  user: (id: string) => request<any>(`/api/v1/admin/users/${encodeURIComponent(id)}`),
  createUser: (body: any) => request<any>('/api/v1/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  updateUser: (id: string, body: any) => request<any>(`/api/v1/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  setEnabled: (id: string, enabled: boolean) => request<any>(`/api/v1/admin/users/${encodeURIComponent(id)}/${enabled ? 'enable' : 'disable'}`, { method: 'POST', body: '{}' }),
  audit: () => request<any>('/api/v1/admin/audit')
};

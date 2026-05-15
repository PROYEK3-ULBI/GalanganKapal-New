// Thin fetch wrapper for the SIMS backend API.
//
// Responsibilities:
//  - Resolve base URL from VITE_API_BASE_URL (defaults to localhost dev server).
//  - Inject the bearer token from localStorage on every request.
//  - Parse JSON responses and surface readable errors via ApiError.
//  - Notify subscribers on 401 so AuthContext can sign the user out.

const TOKEN_STORAGE_KEY = 'sims.token';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const unauthorizedListeners = new Set();

export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

// Subscribe to 401 responses; returns an unsubscribe function.
export function onUnauthorized(handler) {
  unauthorizedListeners.add(handler);
  return () => unauthorizedListeners.delete(handler);
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach(fn => {
    try { fn(); } catch (err) { console.error('unauthorized handler failed', err); }
  });
}

function buildURL(path, params) {
  const url = new URL(
    path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`,
  );
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function request(method, path, { params, body, signal, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  let payload;

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(buildURL(path, params), { method, headers, body: payload, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Tidak dapat terhubung ke server', { status: 0 });
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    if (res.status === 401 && auth) notifyUnauthorized();
    const message = data?.error || res.statusText || 'Request gagal';
    throw new ApiError(message, { status: res.status, code: data?.code, data });
  }

  return data;
}

export const apiClient = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};

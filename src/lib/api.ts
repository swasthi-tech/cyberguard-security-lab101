const isProduction = import.meta.env.PROD;
const DEFAULT_ONLINE_API = 'https://cyberguard-security-api.onrender.com';
const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
let rawUrl = envApiUrl;
if (!rawUrl || (isProduction && (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')))) {
  rawUrl = isProduction ? DEFAULT_ONLINE_API : 'http://localhost:3000';
}
const API_BASE_URL = (rawUrl as string).replace(/\/$/, '');

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'omit',
    });
    return response;
  } catch (_e) {
    throw new Error('Unable to connect to authentication server');
  }
}

export async function fetchAuthApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
    return response;
  } catch (_e) {
    throw new Error('Unable to connect to authentication server');
  }
}

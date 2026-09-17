const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('cte_token');
}

export function getUser() {
  const raw = localStorage.getItem('cte_user');
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setAuth(token, user) {
  localStorage.setItem('cte_token', token);
  localStorage.setItem('cte_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('cte_token');
  localStorage.removeItem('cte_user');
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  get: (url) => apiRequest(url, { method: 'GET' }),
  post: (url, body) => apiRequest(url, { method: 'POST', body }),
  put: (url, body) => apiRequest(url, { method: 'PUT', body }),
  patch: (url, body) => apiRequest(url, { method: 'PATCH', body }),
  delete: (url) => apiRequest(url, { method: 'DELETE' })
};

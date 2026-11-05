// Reusable fetch helper: adds the JWT header, parses JSON, and throws readable errors.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The JWT is kept in localStorage (simple approach for this academic project).
export const getToken = () => localStorage.getItem('token');
export const saveToken = (token) => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  let json = {};
  try {
    json = await response.json();
  } catch (err) {
    // response had no JSON body
  }

  if (!response.ok) {
    // Expired/invalid token on a protected call: drop it and send the user to login
    if (response.status === 401 && token && !path.startsWith('/auth/login')) {
      clearToken();
      window.location.assign('/login');
    }
    throw new Error(json.message || `Request failed (${response.status})`);
  }
  return json;
}

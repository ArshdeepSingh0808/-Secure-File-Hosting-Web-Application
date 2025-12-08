const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return fetch(url, { ...options, headers });
}
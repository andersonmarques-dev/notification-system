import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const TOKEN_KEY = 'auth_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Instância única para rotas da API (prefixo /api), autenticada via Bearer token
export const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Injeta o token salvo em toda requisição, se existir
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

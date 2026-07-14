import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const TOKEN_KEY = 'auth_token';

// Use sessionStorage instead of localStorage to mitigate XSS token theft (S10)
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

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

// Interceptor para lidar com 401 (token expirado/inválido) (R4)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;

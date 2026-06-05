import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Instância para rotas da API (prefixo /api)
export const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true, // Essencial para trafegar o Cookie HttpOnly
  withXSRFToken: true,   // Suporte nativo ao CSRF do Laravel 11+
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Instância para rotas Web estritas (como o sanctum/csrf-cookie)
export const web = axios.create({
  baseURL: BASE,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Accept': 'application/json',
  }
});

export default api;
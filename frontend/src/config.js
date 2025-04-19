const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  ME: `${API_BASE_URL}/api/me`,
  PROXY: `${API_BASE_URL}/proxy`,
  COLLECTIONS: `${API_BASE_URL}/api/collections`,
}; 
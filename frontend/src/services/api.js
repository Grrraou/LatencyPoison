import { API_ENDPOINTS } from '../config';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.detail || 'Request failed');
    error.response = { data };
    throw error;
  }
  return data;
};

// Authentication functions
export const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);

  const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const data = await handleResponse(response);
  localStorage.setItem('token', data.access_token);
  return data;
};

export const register = async (email, password) => {
  const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  return handleResponse(response);
};

export const getCurrentUser = async () => {
  const response = await fetch(API_ENDPOINTS.AUTH.ME, {
    headers: getAuthHeader(),
  });

  return handleResponse(response);
};

export const logout = () => {
  localStorage.removeItem('token');
};

// Collection functions
export const fetchCollections = async () => {
  const response = await fetch(API_ENDPOINTS.COLLECTIONS, {
    headers: getAuthHeader(),
  });

  return handleResponse(response);
};

export const fetchCollection = async (collectionId) => {
  const response = await fetch(`${API_ENDPOINTS.COLLECTIONS}${collectionId}/`, {
    headers: getAuthHeader(),
  });

  return handleResponse(response);
};

export const createCollection = async (name) => {
  const response = await fetch(API_ENDPOINTS.COLLECTIONS, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  return handleResponse(response);
};

export const deleteCollection = async (collectionId) => {
  const response = await fetch(`${API_ENDPOINTS.COLLECTIONS}${collectionId}/`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  return handleResponse(response);
};

// Endpoint functions
export const fetchEndpoints = async (collectionId) => {
  const response = await fetch(`${API_ENDPOINTS.ENDPOINTS}collection/${collectionId}/`, {
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const createEndpoint = async (collectionId, endpointData) => {
  const response = await fetch(`${API_ENDPOINTS.ENDPOINTS}?collection_id=${collectionId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(endpointData),
  });

  return handleResponse(response);
};

export const updateEndpoint = async (endpointId, endpointData) => {
  const response = await fetch(`${API_ENDPOINTS.ENDPOINTS}${endpointId}/`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(endpointData),
  });

  return handleResponse(response);
};

export const deleteEndpoint = async (endpointId) => {
  const response = await fetch(`${API_ENDPOINTS.ENDPOINTS}${endpointId}/`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  return handleResponse(response);
}; 
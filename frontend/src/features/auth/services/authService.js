import { apiRequest } from '../../../services/api';

export async function loginUser(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser({ name, email, password, pin, phone }) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, pin, phone }),
  });
}

export async function verifyPin(email, pin) {
  return apiRequest('/api/auth/verify-pin', {
    method: 'POST',
    body: JSON.stringify({ email, pin }),
  });
}


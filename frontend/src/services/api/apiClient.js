export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

/**
 * Standard HTTP API Request Wrapper
 * Centralizes Authorization headers, JSON body serialization, and error handling.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Auto-detect JSON payload unless FormData is sent
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();

    // Detect session termination by another device
    if (data.code === 'SESSION_TERMINATED' || (response.status === 401 && data.error?.includes('terminated'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('docvault_token');
      sessionStorage.removeItem('docvault_unlocked');
      alert('Your DocVault session was terminated because another device signed into your vault.');
      window.location.href = '/login';
    }

    return { status: response.status, ok: response.ok, ...data };
  }

  // Handle blob/text/raw streams (e.g. calendar.ics, file downloads)
  return response;
}


/**
 * AutoPro API Service Layer
 * ─────────────────────────
 * Currently uses static mock data with simulated async delay.
 * To connect to a real backend later:
 *   1. Set BASE_URL to your ASP.NET Core API URL
 *   2. Replace `mockFetch(data)` calls with `apiFetch(endpoint, options)`
 *   3. No changes needed in page components — they already use async/await
 */

export const BASE_URL = 'https://api.autopro.local'; // ← change this when backend is ready

/** Simulate network delay (remove when using real API) */
const MOCK_DELAY_MS = 400;
export const mockFetch = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), MOCK_DELAY_MS));

/** Real API fetch helper (ready to use, just swap mockFetch → apiFetch) */
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API request failed');
  }
  return res.json();
}

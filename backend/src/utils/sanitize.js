/**
 * Sanitize keys for MongoDB Map storage (no dots or special characters)
 */
export function sanitizeKeyDetails(details) {
  if (!details || typeof details !== 'object') return {};
  const sanitized = {};
  for (const [k, v] of Object.entries(details)) {
    const safeKey = String(k).replace(/[.\$]/g, '_').trim();
    sanitized[safeKey] = typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
  return sanitized;
}


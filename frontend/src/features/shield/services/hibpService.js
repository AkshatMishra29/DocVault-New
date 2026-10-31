/**
 * DocVault Shield: Have I Been Pwned (HIBP) Range API Service
 *
 * Implements strict k-Anonymity breach detection.
 * Sends ONLY the first 5 characters (prefix) of the SHA-1 hash to api.pwnedpasswords.com.
 * Comparison with the 35-character suffix occurs strictly in client memory.
 * Never logs or stores plaintext passwords, complete hashes, or suffixes.
 */

import { sha1Hex } from './cryptoUtils.js';

// Alias for backward-compatible import
export const checkPasswordPwned = checkPasswordBreach;
export const HIBP_STATUS = {
  IDLE: 'idle',
  CHECKING: 'checking',
  COMPROMISED: 'compromised',
  CLEAN: 'clean',       // "No match found" (not guaranteed 100% safe, but not in public breach dump)
  UNAVAILABLE: 'unavailable', // Network failure, timeout, or rate-limited
};

/**
 * Checks a password against HIBP Pwned Passwords Range API using k-Anonymity.
 *
 * @param {string} password - Password to check
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation on rapid typing
 * @returns {Promise<{ status: string, count: number, error?: string }>}
 */
export async function checkPasswordBreach(password, signal = null) {
  if (!password) {
    return { status: HIBP_STATUS.IDLE, count: 0 };
  }

  try {
    // 1. Generate full 40-char uppercase SHA-1 locally
    const hash = await sha1Hex(password);
    if (!hash || hash.length !== 40) {
      return { status: HIBP_STATUS.UNAVAILABLE, count: 0, error: 'Local cryptographic hash failed' };
    }

    // 2. Extract 5-char prefix and 35-char suffix
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    // 3. Query HIBP range endpoint with timeout & Add-Padding
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    let effectiveSignal = controller.signal;
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'Add-Padding': 'true', // Padding obscures the number of hashes returned
      },
      signal: effectiveSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        status: HIBP_STATUS.UNAVAILABLE,
        count: 0,
        error: `HIBP service responded with status ${response.status}`,
      };
    }

    // 4. Parse response lines: "SUFFIX:COUNT"
    const text = await response.text();
    const lines = text.split('\n');

    let matchCount = 0;
    for (const line of lines) {
      const parts = line.trim().split(':');
      if (parts.length >= 2) {
        const lineSuffix = parts[0].trim().toUpperCase();
        if (lineSuffix === suffix) {
          matchCount = parseInt(parts[1].trim(), 10) || 0;
          break;
        }
      }
    }

    if (matchCount > 0) {
      return { status: HIBP_STATUS.COMPROMISED, count: matchCount };
    }

    return { status: HIBP_STATUS.CLEAN, count: 0 };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { status: HIBP_STATUS.UNAVAILABLE, count: 0, error: 'Request cancelled or timed out' };
    }
    return {
      status: HIBP_STATUS.UNAVAILABLE,
      count: 0,
      error: err.message || 'Network error connecting to HIBP verification service',
    };
  }
}

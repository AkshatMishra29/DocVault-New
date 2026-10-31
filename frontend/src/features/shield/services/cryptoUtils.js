/**
 * DocVault Shield: Local Cryptographic Utilities
 *
 * Implements privacy-first client-side hashing using standard Web Crypto API.
 * NEVER transmits plaintext passwords or full hashes over the network.
 */

/**
 * Computes uppercase SHA-1 hexadecimal hash using Web Crypto API.
 * Used exclusively for HIBP k-Anonymity range check.
 *
 * @param {string} text - Plaintext to hash
 * @returns {Promise<string>} Uppercase 40-character hex string
 */
export async function sha1Hex(text) {
  if (!text) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Generates cryptographically secure random integers in the range [0, max).
 * Uses crypto.getRandomValues to eliminate bias.
 *
 * @param {number} max - Upper bound (exclusive)
 * @returns {number}
 */
export function secureRandomInt(max) {
  if (max <= 0) return 0;
  const range = 0x100000000; // 2^32
  const limit = range - (range % max);
  const array = new Uint32Array(1);

  let val;
  do {
    crypto.getRandomValues(array);
    val = array[0];
  } while (val >= limit);

  return val % max;
}


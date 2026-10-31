/**
 * DocVault Shield: Cryptographically Secure Password & Passphrase Generator
 *
 * Implements CSPRNG using window.crypto.getRandomValues().
 * Never uses Math.random().
 * Never persists generated passwords automatically.
 */

import { secureRandomInt } from './cryptoUtils.js';

const UPPERCASE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes ambiguous 'I', 'O' if requested
const UPPERCASE_ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const LOWERCASE_CHARS = 'abcdefghijkmnopqrstuvwxyz'; // Excludes ambiguous 'l'
const LOWERCASE_ALL = 'abcdefghijklmnopqrstuvwxyz';

const NUMBER_CHARS = '23456789'; // Excludes '0', '1' if requested
const NUMBER_ALL = '0123456789';

const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Curated EFF-inspired wordlist for memorable passphrases
const PASSPHRASE_WORDS = [
  'anchor', 'beacon', 'breeze', 'canyon', 'castle', 'cipher', 'cobalt', 'cosmos',
  'crater', 'crystal', 'delta', 'dragon', 'falcon', 'feather', 'forest', 'fossil',
  'galaxy', 'glacier', 'granite', 'harbor', 'horizon', 'island', 'jasper', 'lagoon',
  'lantern', 'legend', 'meadow', 'meteor', 'monarch', 'nebula', 'oasis', 'ocean',
  'orbit', 'panther', 'pebble', 'phoenix', 'planet', 'portal', 'prism', 'pyramid',
  'quartz', 'radiant', 'ranger', 'ripple', 'safari', 'shadow', 'sierra', 'silver',
  'solace', 'spiral', 'summit', 'temple', 'thunder', 'timber', 'topaz', 'tundra',
  'valley', 'vessel', 'vortex', 'voyage', 'whisper', 'zenith'
];

/**
 * Generates a random cryptographic password.
 *
 * @param {object} options
 * @param {number} options.length - Desired password length (recommended >= 16)
 * @param {boolean} options.useUpper - Include uppercase
 * @param {boolean} options.useLower - Include lowercase
 * @param {boolean} options.useNumbers - Include digits
 * @param {boolean} options.useSymbols - Include symbols
 * @param {boolean} options.excludeAmbiguous - Exclude similar characters (0, O, 1, l, I)
 * @returns {string} Generated password
 */
export function generateSecurePassword(options = {}) {
  const {
    length = 16,
    useUpper = true,
    useLower = true,
    useNumbers = true,
    useSymbols = true,
    excludeAmbiguous = false,
  } = options;

  let upper = excludeAmbiguous ? UPPERCASE_CHARS : UPPERCASE_ALL;
  let lower = excludeAmbiguous ? LOWERCASE_CHARS : LOWERCASE_ALL;
  let numbers = excludeAmbiguous ? NUMBER_CHARS : NUMBER_ALL;
  let symbols = SYMBOL_CHARS;

  let pool = '';
  const mandatoryChars = [];

  if (useUpper) {
    pool += upper;
    mandatoryChars.push(upper[secureRandomInt(upper.length)]);
  }
  if (useLower) {
    pool += lower;
    mandatoryChars.push(lower[secureRandomInt(lower.length)]);
  }
  if (useNumbers) {
    pool += numbers;
    mandatoryChars.push(numbers[secureRandomInt(numbers.length)]);
  }
  if (useSymbols) {
    pool += symbols;
    mandatoryChars.push(symbols[secureRandomInt(symbols.length)]);
  }

  // Fallback if user unchecks all boxes
  if (!pool) {
    pool = lower + numbers;
    mandatoryChars.push(lower[secureRandomInt(lower.length)]);
  }

  const result = [...mandatoryChars];
  const targetLength = Math.max(length, mandatoryChars.length);

  while (result.length < targetLength) {
    const idx = secureRandomInt(pool.length);
    result.push(pool[idx]);
  }

  // Fisher-Yates shuffle using CSPRNG to mix mandatory characters
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result.join('');
}

/**
 * Generates a memorable passphrase (e.g. "beacon-granite-summit-vortex-84")
 *
 * @param {object} options
 * @param {number} options.wordCount - Number of words (default 4)
 * @param {string} options.separator - Separator character (default '-')
 * @param {boolean} options.includeNumber - Append random digits
 * @returns {string}
 */
export const generatePassword = generateSecurePassword;
export const generatePassphrase = generateMemorablePassphrase;
export function generateMemorablePassphrase(options = {}) {
  const { wordCount = 4, separator = '-', includeNumber = true } = options;
  const chosenWords = [];

  for (let i = 0; i < wordCount; i++) {
    const idx = secureRandomInt(PASSPHRASE_WORDS.length);
    chosenWords.push(PASSPHRASE_WORDS[idx]);
  }

  let phrase = chosenWords.join(separator);
  if (includeNumber) {
    const randNum = secureRandomInt(90) + 10; // 10–99
    phrase += `${separator}${randNum}`;
  }

  return phrase;
}

// AES-GCM encryption utilities using Web Crypto API
// Key is derived from the user's password using PBKDF2

const SALT = 'vauriz-password-manager-salt-v1';
const ITERATIONS = 100000;

/**
 * Derive an AES-GCM key from a password string
 */
async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a plaintext string. Returns { ciphertext, iv } as base64 strings.
 */
export async function encrypt(plaintext, password) {
  const key = await deriveKey(password);
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypt a ciphertext string. Takes base64 ciphertext and iv.
 */
export async function decrypt(ciphertextB64, ivB64, password) {
  const key = await deriveKey(password);

  const ciphertext = Uint8Array.from(atob(ciphertextB64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

// A short list of unambiguous, easy-to-type words (BIP39 inspired)
const WORD_LIST = [
  "apple", "bird", "cloud", "dance", "earth", "fire", "ghost", "heart", "ice", "jump",
  "kite", "lion", "moon", "night", "ocean", "plant", "quiet", "river", "star", "tree",
  "umbrella", "valley", "water", "xylophone", "yellow", "zebra", "autumn", "breeze",
  "candy", "dream", "eagle", "forest", "garden", "honey", "island", "jungle", "koala",
  "lemon", "mountain", "nebula", "orange", "puzzle", "quartz", "rabbit", "sunset", "tiger",
  "universe", "volcano", "window", "yacht", "action", "brave", "clever", "gentle", "happy",
  "lucky", "magic", "noble", "peace", "proud", "rapid", "sacred", "silent", "strong", "truth"
];

/**
 * Generate a secure 4-word passphrase.
 */
export function generatePassphrase() {
  const words = [];
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  for (let i = 0; i < 4; i++) {
    words.push(WORD_LIST[array[i] % WORD_LIST.length]);
  }
  return words.join('-');
}

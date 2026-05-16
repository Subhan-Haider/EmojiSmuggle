import { deflate, inflate } from 'pako';
import CryptoJS from 'crypto-js';

// Zero-Width Unicode characters used as binary carriers
const ZW0  = '\u200B'; // Zero Width Space        → bit 0
const ZW1  = '\u200C'; // Zero Width Non-Joiner   → bit 1
const ZWS  = '\u200D'; // Zero Width Joiner       → separator
const ZWMK = '\uFEFF'; // BOM                     → magic marker

// Signature to detect hidden data reliably
const SIGNATURE = ZWMK + ZW0 + ZW1 + ZW0 + ZW1 + ZWMK;
const SIGNATURE_END = ZWMK + ZW1 + ZW0 + ZW1 + ZW0 + ZWMK;

export const EMOJI_PRESETS = {
  cyberpunk: ['🕵️','📦','💾','💿','🔌','💻','📡','🔋','⚡','🌃','🔒','👁️','🤫','👾','🦾'],
  ghost:     ['👻','🌑','🔮','💀','☠️','🕯️','🌫️','🕴️','🎭','😶','🧿','🌀','🔦','🪬','👀'],
  nature:    ['🌿','🍀','🌲','🌳','🍂','🍁','🍄','🌍','🌋','🌊','☀️','🌙','🌬️','🍃','🌺'],
  random:    ['😂','🔥','🎉','😎','⚡','🎮','💯','🤖','🎲','🌈','🦄','🎸','🚀','💎','🌊']
};

/**
 * Converts a string to a UTF-8 Uint8Array
 */
function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

/**
 * Converts a Uint8Array back to a string
 */
function bytesToString(bytes) {
  return new TextDecoder().decode(bytes);
}

/**
 * Converts a Uint8Array to a binary string (e.g. "01010101")
 */
function bytesToBits(bytes) {
  let bits = '';
  for (let i = 0; i < bytes.length; i++) {
    bits += bytes[i].toString(2).padStart(8, '0');
  }
  return bits;
}

/**
 * Converts a binary string back to a Uint8Array
 */
function bitsToBytes(bits) {
  const padded = bits.padEnd(Math.ceil(bits.length / 8) * 8, '0');
  const out = new Uint8Array(padded.length / 8);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(padded.slice(i * 8, i * 8 + 8), 2);
  }
  return out;
}

/**
 * Converts binary string to Zero-Width characters
 */
function bitsToZW(bits) {
  let zw = '';
  for (let i = 0; i < bits.length; i++) {
    zw += bits[i] === '1' ? ZW1 : ZW0;
    if ((i + 1) % 64 === 0) zw += ZWS; // chunk separator every 64 bits to avoid massive grapheme clusters
  }
  return zw;
}

/**
 * Extracts binary string from Zero-Width characters
 */
function zwToBits(zw) {
  let bits = '';
  for (const ch of zw) {
    if (ch === ZW1) bits += '1';
    else if (ch === ZW0) bits += '0';
  }
  return bits;
}

/**
 * Splits ZW data and interleaves it across an array of emojis
 */
function injectIntoEmojis(zwData, emojiArray) {
  if (!emojiArray || !emojiArray.length) return zwData;
  const chunkSize = Math.ceil(zwData.length / emojiArray.length);
  let result = '';
  let idx = 0;
  for (const emoji of emojiArray) {
    result += emoji + zwData.slice(idx, idx + chunkSize);
    idx += chunkSize;
  }
  return result;
}

/**
 * Detects if a string contains hidden emoji-smuggle data
 * @param {string} input - The string to check
 * @returns {boolean} True if hidden data is detected
 */
export function detectHiddenMessage(input) {
  if (typeof input !== 'string') return false;
  return input.includes(SIGNATURE) && input.includes(SIGNATURE_END);
}

/**
 * Encodes a text message into an emoji string using Zero-Width steganography.
 * 
 * @param {string} text - The secret message to hide
 * @param {Object} [options] - Configuration options
 * @param {string} [options.password] - Optional AES encryption password
 * @param {string|string[]} [options.carrier='random'] - Pre-defined preset name ('cyberpunk', 'random') or custom array of emojis
 * @param {boolean} [options.compress=true] - Whether to use gzip compression (recommended)
 * @returns {string} The resulting emoji string containing the hidden data
 */
export function encodeMessage(text, options = {}) {
  if (!text) throw new Error("Text payload cannot be empty");

  const opts = {
    password: null,
    carrier: 'random',
    compress: true,
    ...options
  };

  // 1. Process password encryption
  let processText = text;
  if (opts.password) {
    processText = CryptoJS.AES.encrypt(text, opts.password).toString();
  }

  // 2. Convert to Bytes
  let bytes = stringToBytes(processText);

  // 3. Compress
  if (opts.compress) {
    try {
      bytes = deflate(bytes, { level: 9 });
    } catch (e) {
      throw new Error(`Compression failed: ${e.message}`);
    }
  }

  // 4. Convert Bytes to Bits
  const bits = bytesToBits(bytes);

  // 5. Convert Bits to Zero-Width Sequence
  const zwData = bitsToZW(bits);

  // 6. Wrap in Signature Boundaries
  const fullZWPayload = SIGNATURE + zwData + SIGNATURE_END;

  // 7. Inject into Emojis
  let emojiArray = [];
  if (Array.isArray(opts.carrier)) {
    emojiArray = opts.carrier;
  } else if (EMOJI_PRESETS[opts.carrier]) {
    emojiArray = [...EMOJI_PRESETS[opts.carrier]];
    // Shuffle the preset array for randomness
    emojiArray.sort(() => Math.random() - 0.5);
  } else {
    emojiArray = [...EMOJI_PRESETS.random].sort(() => Math.random() - 0.5);
  }

  // Limit emoji array to the size of chunks we need, but at least a few
  const maxEmojis = Math.min(emojiArray.length, Math.max(1, Math.ceil(fullZWPayload.length / 32)));
  emojiArray = emojiArray.slice(0, maxEmojis);

  return injectIntoEmojis(fullZWPayload, emojiArray);
}

/**
 * Decodes a hidden message from an emoji string.
 * 
 * @param {string} encoded - The emoji string containing hidden data
 * @param {Object} [options] - Configuration options
 * @param {string} [options.password] - AES decryption password (if message was encrypted)
 * @param {boolean} [options.compressed=true] - Whether the message was compressed
 * @returns {string} The decoded secret message
 */
export function decodeMessage(encoded, options = {}) {
  if (!encoded || typeof encoded !== 'string') {
    throw new Error("Invalid input: must be a string");
  }

  const opts = {
    password: null,
    compressed: true,
    ...options
  };

  // 1. Extract the ZW payload using signatures
  const startIdx = encoded.indexOf(SIGNATURE);
  const endIdx = encoded.indexOf(SIGNATURE_END);

  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    throw new Error("No valid hidden message signature found.");
  }

  // Slice out everything between signatures and strip out emojis/text and separators
  let rawZw = encoded.substring(startIdx + SIGNATURE.length, endIdx);
  
  // Extract strictly ZW0 and ZW1 characters
  let cleanZw = '';
  for (let i = 0; i < rawZw.length; i++) {
    const char = rawZw[i];
    if (char === ZW0 || char === ZW1) {
      cleanZw += char;
    }
  }

  // 2. ZW back to Bits
  const bits = zwToBits(cleanZw);
  
  if (!bits.length) {
    throw new Error("Failed to extract binary data.");
  }

  // 3. Bits back to Bytes
  let bytes = bitsToBytes(bits);

  // 4. Decompress if needed
  if (opts.compressed) {
    try {
      bytes = inflate(bytes);
    } catch (e) {
      // Fallback: If it wasn't compressed but flag was true, let's try reading it directly
      // This happens if user sets compressed:true but it actually wasn't.
    }
  }

  // 5. Bytes to String
  let decodedText = bytesToString(bytes);

  // 6. Decrypt if password provided
  if (opts.password) {
    try {
      const decrypted = CryptoJS.AES.decrypt(decodedText, opts.password);
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plaintext) throw new Error("Decryption resulted in empty string");
      return plaintext;
    } catch (e) {
      throw new Error("Decryption failed. Incorrect password or corrupted data.");
    }
  }

  // If the result looks like AES encrypted payload but no password was provided
  if (decodedText.startsWith('U2FsdGVkX1')) {
    throw new Error("Message appears to be encrypted. Please provide a password.");
  }

  return decodedText;
}

/**
 * Convenience wrapper for password-protected encoding
 * @param {string} text - Message to encode
 * @param {string} password - AES password
 * @param {Object} [options] - Additional options
 */
export function encodeWithPassword(text, password, options = {}) {
  return encodeMessage(text, { ...options, password });
}

/**
 * Convenience wrapper for password-protected decoding
 * @param {string} encoded - Encoded string
 * @param {string} password - AES password
 * @param {Object} [options] - Additional options
 */
export function decodeWithPassword(encoded, password, options = {}) {
  return decodeMessage(encoded, { ...options, password });
}

export default {
  encodeMessage,
  decodeMessage,
  encodeWithPassword,
  decodeWithPassword,
  detectHiddenMessage,
  EMOJI_PRESETS
};

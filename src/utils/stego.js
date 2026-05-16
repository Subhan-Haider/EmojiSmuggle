import CryptoJS from 'crypto-js';

const BIT_1 = '\u200B'; // Zero Width Space
const BIT_0 = '\u2060'; // Word Joiner

/**
 * Encodes a message with optional AES encryption
 */
export const smuggleMessage = (text, password = '', emojiTemplate = '📦') => {
  let payload = text;

  // 1. Optional AES Encryption
  if (password) {
    payload = CryptoJS.AES.encrypt(text, password).toString();
  }

  // 2. Convert payload to binary
  const binary = payload
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  // 3. Map bits to zero-width characters
  const hiddenData = binary
    .split('')
    .map(bit => (bit === '1' ? BIT_1 : BIT_0))
    .join('');

  // 4. Inject into emoji carriers
  // Use Intl.Segmenter or Array.from to handle surrogate pairs correctly
  const emojiArray = Array.from(emojiTemplate);
  
  let result = '';
  let dataIndex = 0;
  const charsPerEmoji = Math.ceil(hiddenData.length / emojiArray.length);

  emojiArray.forEach((emoji, i) => {
    const chunk = hiddenData.substr(dataIndex, charsPerEmoji);
    result += emoji + chunk;
    dataIndex += charsPerEmoji;
  });

  return result;
};

/**
 * Decodes a message with optional AES decryption
 */
export const extractMessage = (encoded, password = '') => {
  // 1. Extract only our specific hidden characters
  const hiddenData = encoded
    .split('')
    .filter(char => char === BIT_1 || char === BIT_0)
    .join('');

  if (!hiddenData) return { success: false, error: 'NO_HIDDEN_DATA' };

  // 2. Convert back to bits -> binary -> string
  const binary = hiddenData
    .split('')
    .map(char => (char === BIT_1 ? '1' : '0'))
    .join('');

  const bytes = binary.match(/.{1,8}/g) || [];
  
  // Ensure we only process full bytes
  if (binary.length % 8 !== 0) {
    console.warn('Incomplete binary stream detected');
  }

  let payload = '';
  try {
    payload = bytes.map(byte => {
      if (byte.length < 8) return ''; // Ignore trailing bits
      return String.fromCharCode(parseInt(byte, 2));
    }).join('');
  } catch (e) {
    return { success: false, error: 'DECODING_FAILED' };
  }

  // 3. Optional AES Decryption
  if (password) {
    try {
      const bytes = CryptoJS.AES.decrypt(payload, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error();
      return { success: true, data: decrypted, encrypted: true };
    } catch (e) {
      return { success: false, error: 'WRONG_PASSWORD' };
    }
  }

  // Check if it looks like encrypted data but no password was provided
  if (payload.startsWith('U2FsdGVkX1')) {
    return { success: false, error: 'PASSWORD_REQUIRED' };
  }

  return { success: true, data: payload, encrypted: false };
};

export const EMOJI_PACKS = {
  cyberpunk: ['🕵️', '📦', '💾', '💿', '🔌', '💻', '📡', '🔋', '🦾', '🦿', '🥽', '🏙️', '🌃', '⚡', '🌌'],
  clandestine: ['🔒', '🔑', '🕵️', '🕵️‍♀️', '🕴️', '👁️', '🌑', '🕯️', '🧥', '💼', '🤫', '😶', '🎭', '🔦', '🚪'],
  nature: ['🌿', '🍀', '🌲', '🌳', '🍂', '🍁', '🍄', '🌍', '🌋', '🗻', '🏜️', '🌊', '🌬️', '☀️', '🌙'],
  space: ['🚀', '🛸', '🪐', '☄️', '🌌', '👽', '👾', '👨‍🚀', '👩‍🚀', '🛰️', '🔭', '🛰️', '🌑', '☀️', '✨'],
  danger: ['💀', '☠️', '☣️', '☢️', '⚠️', '🔥', '🧨', '💣', '🩸', '💊', '💉', '⛓️', '🩸', '🔪', '🧨']
};

export const getRandomEmojis = (pack = 'cyberpunk', count = 5) => {
  const emojis = EMOJI_PACKS[pack] || EMOJI_PACKS.cyberpunk;
  let result = '';
  for (let i = 0; i < count; i++) {
    result += emojis[Math.floor(Math.random() * emojis.length)];
  }
  return result;
};

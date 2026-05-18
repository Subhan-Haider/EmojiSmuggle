import CryptoJS from 'crypto-js';

const ZW0  = '\u200B';
const ZW1  = '\u200C';
const ZWS  = '\u200D';
const ZWMK = '\uFEFF';

const SIGNATURE = ZWMK + ZW0 + ZW1 + ZW0 + ZW1 + ZWMK;
const SIGNATURE_END = ZWMK + ZW1 + ZW0 + ZW1 + ZW0 + ZWMK;
const SIGNATURE_END_TRIMMED = ZWMK + ZW1 + ZW0 + ZW1 + ZW0;

function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes) {
  return new TextDecoder().decode(bytes);
}

function bytesToBits(bytes) {
  let bits = '';
  for (let i = 0; i < bytes.length; i++) {
    bits += bytes[i].toString(2).padStart(8, '0');
  }
  return bits;
}

function bitsToBytes(bits) {
  const padded = bits.padEnd(Math.ceil(bits.length / 8) * 8, '0');
  const out = new Uint8Array(padded.length / 8);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(padded.slice(i * 8, i * 8 + 8), 2);
  }
  return out;
}

function bitsToZW(bits) {
  let zw = '';
  for (let i = 0; i < bits.length; i++) {
    zw += bits[i] === '1' ? ZW1 : ZW0;
    if ((i + 1) % 64 === 0) zw += ZWS;
  }
  return zw;
}

function zwToBits(zw) {
  let bits = '';
  for (const ch of zw) {
    if (ch === ZW1) bits += '1';
    else if (ch === ZW0) bits += '0';
  }
  return bits;
}

export const smuggleMessage = (text, password = '', emojiTemplate = '📦') => {
  let processText = text;
  if (password && typeof CryptoJS !== 'undefined') {
    processText = CryptoJS.AES.encrypt(text, password).toString();
  }

  const bytes = stringToBytes(processText);
  const bits = bytesToBits(bytes);
  const zwData = bitsToZW(bits);
  
  const fullZWPayload = SIGNATURE + zwData + SIGNATURE_END;
  
  const emojiArray = Array.from(emojiTemplate);
  let result = '';
  const charsPerEmoji = Math.ceil(fullZWPayload.length / emojiArray.length);
  let idx = 0;

  emojiArray.forEach((emoji) => {
    result += emoji + fullZWPayload.slice(idx, idx + charsPerEmoji);
    idx += charsPerEmoji;
  });

  return result;
};

export const extractMessage = (encoded, password = '') => {
  const startIdx = encoded.indexOf(SIGNATURE);
  let endIdx = encoded.lastIndexOf(SIGNATURE_END);
  if (endIdx === -1) {
    endIdx = encoded.lastIndexOf(SIGNATURE_END_TRIMMED);
  }
  
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    return { success: false, error: 'NO_HIDDEN_DATA' };
  }

  const rawZw = encoded.substring(startIdx + SIGNATURE.length, endIdx);
  let cleanZw = '';
  for (const char of rawZw) {
    if (char === ZW0 || char === ZW1) cleanZw += char;
  }

  const bits = zwToBits(cleanZw);
  if (!bits.length) return { success: false, error: 'NO_HIDDEN_DATA' };
  
  let bytes = bitsToBytes(bits);
  
  let decodedText = '';
  try {
    decodedText = bytesToString(bytes);
  } catch(e) {
    return { success: false, error: 'DECODING_FAILED' };
  }

  if (password && typeof CryptoJS !== 'undefined') {
    try {
      const decrypted = CryptoJS.AES.decrypt(decodedText, password);
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plaintext) throw new Error();
      return { success: true, data: plaintext, encrypted: true };
    } catch (e) {
      return { success: false, error: 'WRONG_PASSWORD' };
    }
  }

  if (decodedText.startsWith('U2FsdGVkX1')) {
    return { success: false, error: 'PASSWORD_REQUIRED' };
  }

  return { success: true, data: decodedText, encrypted: false };
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

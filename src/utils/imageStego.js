import { deflate, inflate } from 'pako';
import CryptoJS from 'crypto-js';

// Zero-Width Unicode characters used as binary carriers
const ZW0  = '\u200B'; // Zero Width Space        → bit 0
const ZW1  = '\u200C'; // Zero Width Non-Joiner   → bit 1
const ZWS  = '\u200D'; // Zero Width Joiner       → separator
const ZWMK = '\uFEFF'; // BOM                     → magic marker

// Unique header/footer signature to detect hidden image data
const HDR = ZWMK + ZW0 + ZW1 + ZW0 + ZW1 + ZWMK;
const FTR = ZWMK + ZW1 + ZW0 + ZW1 + ZW0 + ZWMK;
const FTR_TRIMMED = ZWMK + ZW1 + ZW0 + ZW1 + ZW0;

export const IMAGE_EMOJI_PACKS = {
  cyberpunk: ['🕵️','📦','💾','💿','🔌','💻','📡','🔋','⚡','🌃','🔒','👁️','🤫','👾','🦾'],
  ghost:     ['👻','🌑','🔮','💀','☠️','🕯️','🌫️','🕴️','🎭','😶','🧿','🌀','🔦','🪬','👀'],
  space:     ['🚀','🛸','🪐','☄️','🌌','👽','🛰️','🔭','✨','💫','⭐','🌠','🌙','🪨','🌑'],
  nature:    ['🌿','🍀','🌲','🌳','🍂','🍁','🍄','🌍','🌋','🌊','☀️','🌙','🌬️','🍃','🌺'],
  fire:      ['🔥','💥','⚡','✨','💫','🌟','⭐','🌈','💢','❗','🎆','🎇','🌠','🔆','☀️'],
  random:    ['😂','🔥','🎉','😎','⚡','🎮','💯','🤖','🎲','🌈','🦄','🎸','🚀','💎','🌊'],
};

// --- Compression helpers ---
function compress(bytes) { return deflate(bytes, { level: 9 }); }
function decompress(bytes) { return inflate(bytes); }

// --- Bit conversion ---
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

// --- ZW encoding ---
function bitsToZW(bits) {
  let zw = '';
  for (let i = 0; i < bits.length; i++) {
    zw += bits[i] === '1' ? ZW1 : ZW0;
    if ((i + 1) % 64 === 0) zw += ZWS; // chunk separator every 64 bits
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

function num32ToZW(n) {
  return bitsToZW(n.toString(2).padStart(32, '0'));
}

// --- Spread ZW data across emojis ---
function injectIntoEmojis(zwData, emojiArray) {
  if (!emojiArray.length) return zwData;
  const chunkSize = Math.ceil(zwData.length / emojiArray.length);
  let result = '';
  let idx = 0;
  for (const emoji of emojiArray) {
    result += emoji + zwData.slice(idx, idx + chunkSize);
    idx += chunkSize;
  }
  return result;
}

// --- Public API ---

/** Resize + JPEG-compress an image File → { compressed, dataUrl, w, h, originalSize } */
export async function compressImage(file, maxDim = 120, quality = 0.45) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w >= h) { h = Math.round((h / w) * maxDim); w = maxDim; }
        else        { w = Math.round((w / h) * maxDim); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          const b64 = dataUrl.split(',')[1];
          const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
          const compressed = compress(raw);
          resolve({ compressed, dataUrl, w, h, originalSize: file.size, compressedSize: compressed.length });
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Encode compressed bytes into an emoji string with hidden ZW data */
export function encodeImageToEmoji(compressed, emojiSequence, password = '') {
  let bytes = compressed;
  let encrypted = false;

  if (password) {
    const wa = CryptoJS.lib.WordArray.create(bytes);
    const enc = CryptoJS.AES.encrypt(wa, password).toString();
    bytes = new TextEncoder().encode(enc);
    encrypted = true;
  }

  const bits = bytesToBits(bytes);
  const zwData = bitsToZW(bits);
  // Layout: HDR + length(32b) + encFlag(1b) + data + FTR
  const encFlag = encrypted ? ZW1 : ZW0;
  const fullZW = HDR + num32ToZW(bytes.length) + encFlag + zwData + FTR;
  const emojiArr = [...emojiSequence]; // handles multi-codepoint emoji
  return injectIntoEmojis(fullZW, emojiArr);
}

/** Decode hidden image from emoji string → { success, dataUrl, byteLength, isEncrypted } */
export function decodeImageFromEmoji(emojiString, password = '') {
  // Extract only ZW chars
  let zw = '';
  for (const ch of emojiString) {
    if (ch === ZW0 || ch === ZW1 || ch === ZWS || ch === ZWMK) zw += ch;
  }

  const hi = zw.indexOf(HDR);
  let fi = zw.lastIndexOf(FTR);
  if (fi === -1) {
    fi = zw.lastIndexOf(FTR_TRIMMED);
  }
  if (hi === -1 || fi === -1 || fi <= hi) {
    return { success: false, error: 'NO_IMAGE_PAYLOAD_DETECTED' };
  }

  const payload = zw.slice(hi + HDR.length, fi);
  const allBits = zwToBits(payload);
  if (allBits.length < 33) return { success: false, error: 'PAYLOAD_TOO_SHORT' };

  const byteLen = parseInt(allBits.slice(0, 32), 2);
  const isEncrypted = allBits[32] === '1';
  const availableBytes = Math.floor((allBits.length - 33) / 8);
  if (!Number.isFinite(byteLen) || byteLen <= 0 || byteLen > availableBytes) {
    return { success: false, error: 'NO_IMAGE_PAYLOAD_DETECTED' };
  }
  const dataBits = allBits.slice(33, 33 + byteLen * 8);
  if (dataBits.length < byteLen * 8) return { success: false, error: 'CORRUPTED_PAYLOAD' };

  let bytes = bitsToBytes(dataBits).slice(0, byteLen);

  if (isEncrypted) {
    if (!password) return { success: false, error: 'PASSWORD_REQUIRED' };
    try {
      const encStr = new TextDecoder().decode(bytes);
      const dec = CryptoJS.AES.decrypt(encStr, password);
      const hex = dec.toString(CryptoJS.enc.Hex);
      if (!hex) throw new Error();
      bytes = new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)));
    } catch {
      return { success: false, error: 'WRONG_PASSWORD' };
    }
  }

  try {
    const raw = decompress(bytes);
    let binary = '';
    for (let i = 0; i < raw.length; i++) binary += String.fromCharCode(raw[i]);
    const dataUrl = `data:image/jpeg;base64,${btoa(binary)}`;
    return { success: true, dataUrl, byteLength: raw.length, isEncrypted };
  } catch {
    return { success: false, error: 'DECOMPRESSION_FAILED' };
  }
}

/** Generate a random emoji sequence from a named pack */
export function generateEmojiSequence(packName = 'cyberpunk', count = 20) {
  const pack = IMAGE_EMOJI_PACKS[packName] || IMAGE_EMOJI_PACKS.cyberpunk;
  return Array.from({ length: count }, () => pack[Math.floor(Math.random() * pack.length)]).join('');
}

/** Count invisible ZW chars inside a string */
export function countHiddenChars(str) {
  let n = 0;
  for (const ch of str) {
    if ([ZW0, ZW1, ZWS, ZWMK].includes(ch)) n++;
  }
  return n;
}

/** Format bytes to human-readable */
export function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

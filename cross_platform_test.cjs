// Full cross-platform simulation test
// This mimics EXACTLY what Android StegoEngine.kt does vs what stego.js does

const ZW0  = '\u200B';
const ZW1  = '\u200C';
const ZWS  = '\u200D';
const ZWMK = '\uFEFF';
const SIGNATURE = ZWMK + ZW0 + ZW1 + ZW0 + ZW1 + ZWMK;     // 6 chars
const SIGNATURE_END = ZWMK + ZW1 + ZW0 + ZW1 + ZW0 + ZWMK; // 6 chars

// === JS Encoder (stego.js) ===
function jsEncode(text) {
  const bytes = new TextEncoder().encode(text);
  let bits = '';
  for (let i = 0; i < bytes.length; i++) bits += bytes[i].toString(2).padStart(8, '0');

  let zw = '';
  for (let i = 0; i < bits.length; i++) {
    zw += bits[i] === '1' ? ZW1 : ZW0;
    if ((i + 1) % 64 === 0) zw += ZWS;
  }
  return '🕵️' + SIGNATURE + zw + SIGNATURE_END;
}

// === JS Decoder (stego.js) ===
function jsDecode(encoded) {
  const startIdx = encoded.indexOf(SIGNATURE);
  const endIdx = encoded.indexOf(SIGNATURE_END);
  console.log(`  JS: startIdx=${startIdx}, endIdx=${endIdx}, SIG_LEN=${SIGNATURE.length}`);
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return 'ERROR: NO_HIDDEN_DATA';

  const rawZw = encoded.substring(startIdx + SIGNATURE.length, endIdx);
  let cleanZw = '';
  for (const ch of rawZw) {
    if (ch === ZW0 || ch === ZW1) cleanZw += ch;
  }
  let bits = '';
  for (const ch of cleanZw) bits += ch === ZW1 ? '1' : '0';

  const padded = bits.padEnd(Math.ceil(bits.length / 8) * 8, '0');
  const out = new Uint8Array(padded.length / 8);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(padded.slice(i*8, i*8+8), 2);
  return new TextDecoder().decode(out);
}

// === Android Decoder simulation (Kotlin logic in JS) ===
function androidDecode(encoded) {
  const startIdx = encoded.indexOf(SIGNATURE);
  const endIdx = encoded.indexOf(SIGNATURE_END);
  console.log(`  Android: startIdx=${startIdx}, endIdx=${endIdx}, SIG_LEN=${SIGNATURE.length}`);
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return 'ERROR: No valid hidden message signature found.';

  // KEY DIFFERENCE: Kotlin's `indexOf` works on code units, not grapheme clusters
  // Kotlin string length counts surrogates separately
  // SIGNATURE.length in JS = 6 chars, but in Kotlin, \uFEFF etc are all BMP so same = 6
  const rawZw = encoded.substring(startIdx + SIGNATURE.length, endIdx);
  const zwList = [];
  for (let i = 0; i < rawZw.length; i++) {
    const c = rawZw[i];
    if (c === ZW0 || c === ZW1) zwList.push(c);
  }
  const byteLength = Math.floor(zwList.length / 8);
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    let byteVal = 0;
    for (let bit = 0; bit < 8; bit++) {
      const c = zwList[i * 8 + bit];
      const bitVal = c === ZW1 ? 1 : 0;
      byteVal = (byteVal << 1) | bitVal;
    }
    bytes[i] = byteVal;
  }
  return new TextDecoder().decode(bytes);
}

// --- TEST 1: JS encodes, JS decodes ---
console.log('\n=== TEST 1: JS encodes "hello", JS decodes ===');
const jsEncoded = jsEncode('hello');
console.log('Encoded chars:', [...jsEncoded].map(c => c.charCodeAt(0).toString(16)).join(' '));
const jsResult = jsDecode(jsEncoded);
console.log('Result:', jsResult);

// --- TEST 2: JS encodes, Android decodes ---
console.log('\n=== TEST 2: JS encodes "hello", Android decodes ===');
const androidResult = androidDecode(jsEncoded);
console.log('Result:', androidResult);

// --- TEST 3: Check SIGNATURE collision ---
console.log('\n=== TEST 3: SIGNATURE overlap check ===');
console.log('SIGNATURE:', [...SIGNATURE].map(c => c.charCodeAt(0).toString(16)).join(' '));
console.log('SIGNATURE_END:', [...SIGNATURE_END].map(c => c.charCodeAt(0).toString(16)).join(' '));

// Does SIGNATURE END start with chars from SIGNATURE?
const sigLast = SIGNATURE[SIGNATURE.length - 1]; // \uFEFF
const sigEndFirst = SIGNATURE_END[0]; // \uFEFF
console.log('Last char of SIG == First char of SIG_END:', sigLast === sigEndFirst, sigLast.charCodeAt(0).toString(16));

// Try to search for SIGNATURE_END from the END (like Kotlin's lastIndexOf)
console.log('\n=== TEST 4: Using lastIndexOf for SIGNATURE_END ===');
function fixedDecode(encoded) {
  const startIdx = encoded.indexOf(SIGNATURE);
  // Use lastIndexOf to find the LAST occurrence of SIGNATURE_END
  const endIdx = encoded.lastIndexOf(SIGNATURE_END);
  console.log(`  startIdx=${startIdx}, endIdx=${endIdx}`);
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return 'ERROR: NO_HIDDEN_DATA';

  const rawZw = encoded.substring(startIdx + SIGNATURE.length, endIdx);
  let cleanZw = '';
  for (const ch of rawZw) {
    if (ch === ZW0 || ch === ZW1) cleanZw += ch;
  }
  let bits = '';
  for (const ch of cleanZw) bits += ch === ZW1 ? '1' : '0';
  const padded = bits.padEnd(Math.ceil(bits.length / 8) * 8, '0');
  const out = new Uint8Array(padded.length / 8);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(padded.slice(i*8, i*8+8), 2);
  return new TextDecoder().decode(out);
}
console.log('Fixed decode result:', fixedDecode(jsEncode('hello')));

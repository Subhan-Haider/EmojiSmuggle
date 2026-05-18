// Simulate what Android StegoEngine.smuggle() produces for "hello"
// Then verify website extractMessage() can decode it

const ZW0  = '\u200B';
const ZW1  = '\u200C';
const ZWS  = '\u200D';
const ZWMK = '\uFEFF';

const SIGNATURE = ZWMK + ZW0 + ZW1 + ZW0 + ZW1 + ZWMK;
const SIGNATURE_END = ZWMK + ZW1 + ZW0 + ZW1 + ZW0 + ZWMK;

// === Simulate Android StegoEngine.smuggle() ===
function androidEncode(message) {
  const bytes = new TextEncoder().encode(message);
  
  // Build bits string (Kotlin: for bit in 7 downTo 0)
  let bits = '';
  for (const b of bytes) {
    const byteVal = b & 0xFF;
    for (let bit = 7; bit >= 0; bit--) {
      bits += ((byteVal >> bit) & 1) === 1 ? '1' : '0';
    }
  }
  
  // Build zw string (with ZWS every 64 bits)
  let zw = '';
  for (let i = 0; i < bits.length; i++) {
    zw += bits[i] === '1' ? ZW1 : ZW0;
    if ((i + 1) % 64 === 0) zw += ZWS;
  }
  
  const fullPayload = SIGNATURE + zw + SIGNATURE_END;
  
  // Inject into 2 carriers
  const carriers = ['🕵️', '💬'];
  const charsPerEmoji = Math.ceil(fullPayload.length / carriers.length);
  let result = '';
  let idx = 0;
  for (const emoji of carriers) {
    result += emoji + fullPayload.slice(idx, idx + charsPerEmoji);
    idx += charsPerEmoji;
  }
  return result;
}

// === Website extractMessage() ===
function websiteDecode(encoded, password = '') {
  const startIdx = encoded.indexOf(SIGNATURE);
  const endIdx = encoded.indexOf(SIGNATURE_END);
  
  console.log(`  startIdx=${startIdx}, endIdx=${endIdx}, SIGNATURE.length=${SIGNATURE.length}`);
  
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    return { success: false, error: 'NO_HIDDEN_DATA' };
  }

  const rawZw = encoded.substring(startIdx + SIGNATURE.length, endIdx);
  let cleanZw = '';
  for (const char of rawZw) {
    if (char === ZW0 || char === ZW1) cleanZw += char;
  }

  console.log(`  cleanZw length=${cleanZw.length}`);

  let bits = '';
  for (const ch of cleanZw) bits += ch === ZW1 ? '1' : '0';

  const padded = bits.padEnd(Math.ceil(bits.length / 8) * 8, '0');
  const out = new Uint8Array(padded.length / 8);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(padded.slice(i*8, i*8+8), 2);
  
  try {
    return { success: true, data: new TextDecoder().decode(out) };
  } catch(e) {
    return { success: false, error: 'DECODING_FAILED' };
  }
}

// === TEST ===
const message = 'hello from android';
console.log('=== Android → Website Test ===');
console.log('Input:', message);
const encoded = androidEncode(message);

console.log('\nEncoded char codes:');
[...encoded].forEach((c, i) => {
  const code = c.codePointAt(0).toString(16);
  if (parseInt(code, 16) < 0x2100 || parseInt(code, 16) > 0xFFFF) return; // show only control chars
  process.stdout.write(`[U+${code}]`);
});
console.log('\nTotal encoded length:', encoded.length);
console.log('Hidden bits count:', [...encoded].filter(c => c === ZW0 || c === ZW1).length);

console.log('\nDecoding...');
const result = websiteDecode(encoded);
console.log('Result:', result);
console.log('Match:', result.data === message);

// Also test with password
const CryptoJS = require('crypto-js');

function androidEncodeWithPassword(message, password) {
  const encrypted = CryptoJS.AES.encrypt(message, password).toString();
  return androidEncode(encrypted);
}

console.log('\n=== Android with password → Website Test ===');
const encodedPwd = androidEncodeWithPassword('secret msg', '1234');
const rawDecoded = websiteDecode(encodedPwd);
console.log('Raw decoded (should be AES string):', rawDecoded.data?.substring(0, 30));
if (rawDecoded.data?.startsWith('U2FsdGVkX1')) {
  console.log('Looks encrypted ✓ (starts with U2FsdGVkX1)');
  // Now try to decrypt with CryptoJS
  try {
    const decrypted = CryptoJS.AES.decrypt(rawDecoded.data, '1234').toString(CryptoJS.enc.Utf8);
    console.log('Decrypted:', decrypted);
  } catch(e) {
    console.log('Decrypt error:', e.message);
  }
}

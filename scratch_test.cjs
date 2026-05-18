const CryptoJS = require('crypto-js');

const ZW0  = '\u200B';
const ZW1  = '\u200C';
const ZWS  = '\u200D';
const ZWMK = '\uFEFF';

const SIGNATURE = ZWMK + ZW0 + ZW1 + ZW0 + ZW1 + ZWMK;
const SIGNATURE_END = ZWMK + ZW1 + ZW0 + ZW1 + ZW0 + ZWMK;

function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToBits(bytes) {
  let bits = '';
  for (let i = 0; i < bytes.length; i++) {
    bits += bytes[i].toString(2).padStart(8, '0');
  }
  return bits;
}

function bitsToZW(bits) {
  let zw = '';
  for (let i = 0; i < bits.length; i++) {
    zw += bits[i] === '1' ? ZW1 : ZW0;
    if ((i + 1) % 64 === 0) zw += ZWS;
  }
  return zw;
}

function smuggleMessage(text, password = '', emojiTemplate = '🕵️') {
  let processText = text;
  if (password) {
    processText = CryptoJS.AES.encrypt(text, password).toString();
  }

  const bytes = stringToBytes(processText);
  const bits = bytesToBits(bytes);
  const zwData = bitsToZW(bits);
  
  const fullZWPayload = SIGNATURE + zwData + SIGNATURE_END;
  
  return emojiTemplate + fullZWPayload;
}

const msg1 = smuggleMessage("hello", "");
console.log("No Password Encoded:", JSON.stringify(msg1));
console.log("No Password Length:", msg1.length);
for (let i = 0; i < msg1.length; i++) {
  console.log(`char[${i}]: ${msg1[i]} (code: ${msg1.charCodeAt(i).toString(16)})`);
}

const msg2 = smuggleMessage("hello", "1234");
console.log("Password Encoded:", JSON.stringify(msg2));

const BIT_1 = '\u200B'; // Zero Width Space
const BIT_0 = '\u2060'; // Word Joiner

const EMOJI_PACKS = {
  cyberpunk: ['🕵️', '📦', '💾', '💿', '🔌', '💻', '📡', '🔋', '🦾', '🦿', '🥽', '🏙️', '🌃', '⚡', '🌌'],
  clandestine: ['🔒', '🔑', '🕵️', '🕵️‍♀️', '🕴️', '👁️', '🌑', '🕯️', '🧥', '💼', '🤫', '😶', '🎭', '🔦', '🚪'],
  nature: ['🌿', '🍀', '🌲', '🌳', '🍂', '🍁', '🍄', '🌍', '🌋', '🗻', '🏜️', '🌊', '🌬️', '☀️', '🌙'],
  space: ['🚀', '🛸', '🪐', '☄️', '🌌', '👽', '👾', '👨‍🚀', '👩‍🚀', '🛰️', '🔭', '🛰️', '🌑', '☀️', '✨'],
  danger: ['💀', '☠️', '☣️', '☢️', '⚠️', '🔥', '🧨', '💣', '🩸', '💊', '💉', '⛓️', '🩸', '🔪', '🧨']
};

function getRandomEmojis(pack = 'cyberpunk', count = 5) {
  const emojis = EMOJI_PACKS[pack] || EMOJI_PACKS.cyberpunk;
  let result = '';
  for (let i = 0; i < count; i++) {
    result += emojis[Math.floor(Math.random() * emojis.length)];
  }
  return result;
}

function smuggleMessage(text, password = '', emojiTemplate = '🕵️📦💾💿🔌') {
  let payload = text;

  if (password && typeof CryptoJS !== 'undefined') {
    payload = CryptoJS.AES.encrypt(text, password).toString();
  }

  const binary = payload
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  const hiddenData = binary
    .split('')
    .map(bit => (bit === '1' ? BIT_1 : BIT_0))
    .join('');

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
}

function extractMessage(encoded, password = '') {
  const hiddenData = encoded
    .split('')
    .filter(char => char === BIT_1 || char === BIT_0)
    .join('');

  if (!hiddenData) return { success: false, error: 'NO_HIDDEN_DATA' };

  const binary = hiddenData
    .split('')
    .map(char => (char === BIT_1 ? '1' : '0'))
    .join('');

  const bytes = binary.match(/.{1,8}/g) || [];
  
  let payload = '';
  try {
    payload = bytes.map(byte => {
      if (byte.length < 8) return '';
      return String.fromCharCode(parseInt(byte, 2));
    }).join('');
  } catch (e) {
    return { success: false, error: 'DECODING_FAILED' };
  }

  if (password && typeof CryptoJS !== 'undefined') {
    try {
      const bytes = CryptoJS.AES.decrypt(payload, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error();
      return { success: true, data: decrypted, encrypted: true };
    } catch (e) {
      return { success: false, error: 'WRONG_PASSWORD' };
    }
  }

  if (payload.startsWith('U2FsdGVkX1')) {
    return { success: false, error: 'PASSWORD_REQUIRED' };
  }

  return { success: true, data: payload, encrypted: false };
}

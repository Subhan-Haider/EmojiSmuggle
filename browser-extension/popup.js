document.addEventListener('DOMContentLoaded', () => {
  const tabs = {
    encode: document.getElementById('tab-encode'),
    decode: document.getElementById('tab-decode')
  };
  
  const views = {
    encode: document.getElementById('view-encode'),
    decode: document.getElementById('view-decode')
  };

  const themeToggle = document.getElementById('theme-toggle');

  // Load theme
  chrome.storage.local.get(['theme'], (result) => {
    if (result.theme === 'light') {
      document.body.classList.add('light');
      themeToggle.textContent = '🌙';
    }
  });

  // Theme toggle logic
  themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    themeToggle.textContent = isLight ? '🌙' : '🌞';
    chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
  });

  // Tab switching
  tabs.encode.addEventListener('click', () => switchTab('encode'));
  tabs.decode.addEventListener('click', () => switchTab('decode'));

  function switchTab(tab) {
    Object.keys(tabs).forEach(k => {
      tabs[k].classList.toggle('active', k === tab);
      views[k].classList.toggle('hidden', k !== tab);
    });
  }

  // Encode logic
  const btnEncode = document.getElementById('btn-encode');
  const inputMsg = document.getElementById('msg-input');
  const inputPass = document.getElementById('msg-pass');
  const outputMsg = document.getElementById('msg-output');

  btnEncode.addEventListener('click', () => {
    const text = inputMsg.value.trim();
    if (!text) return;

    const pass = inputPass.value;
    const carrier = getRandomEmojis('cyberpunk', 5);
    const result = smuggleMessage(text, pass, carrier);
    
    outputMsg.textContent = result;
  });

  // Copy/Paste Helpers
  const copyToClipboard = (element) => {
    const text = element.textContent || element.value;
    if (text && text !== 'No carrier generated' && text !== 'Waiting for input...') {
      navigator.clipboard.writeText(text);
      const original = element.textContent;
      element.textContent = 'Copied!';
      setTimeout(() => element.textContent = original, 1000);
    }
  };

  document.getElementById('btn-copy-encode').addEventListener('click', () => copyToClipboard(outputMsg));
  document.getElementById('btn-copy-decode').addEventListener('click', () => copyToClipboard(outputDecode));
  
  document.getElementById('btn-paste-decode').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputDecode.value = text;
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  });

  // Password Visibility Toggle
  const setupToggle = (btnId, inputId) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    btn.addEventListener('click', () => {
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? 'Hide' : 'Show';
    });
  };

  setupToggle('toggle-pass-encode', 'msg-pass');
  setupToggle('toggle-pass-decode', 'decode-pass');

  outputMsg.addEventListener('click', () => copyToClipboard(outputMsg));

  // Decode logic
  const btnDecode = document.getElementById('btn-decode');
  const inputDecode = document.getElementById('decode-input');
  const inputDecodePass = document.getElementById('decode-pass');
  const outputDecode = document.getElementById('decode-output');

  btnDecode.addEventListener('click', () => {
    const text = inputDecode.value;
    if (!text) return;

    const pass = inputDecodePass.value;
    const result = extractMessage(text, pass);

    outputDecode.classList.remove('error', 'success');

    if (result.success) {
      outputDecode.textContent = result.data;
      outputDecode.classList.add('success');
    } else {
      const errorMap = {
        'PASSWORD_REQUIRED': 'Password required for this message',
        'WRONG_PASSWORD': 'Incorrect password',
        'NO_HIDDEN_DATA': 'No hidden message found',
        'DECODING_FAILED': 'Failed to decode message'
      };
      outputDecode.textContent = errorMap[result.error] || `Error: ${result.error}`;
      outputDecode.classList.add('error');
    }
  });
});

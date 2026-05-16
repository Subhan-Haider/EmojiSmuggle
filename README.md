<div align="center">

<img src="https://raw.githubusercontent.com/Subhan-Haider/EmojiSmuggle/main/public/logo.svg" width="120" alt="Emoji Smuggle Logo" />

# 🕵️ Emoji Smuggle
### **Stealthy Unicode Steganography & Invisible Payload Platform**

*Hide secret text, encrypted messages, and compressed images inside innocent emoji strings.*

[![NPM Version](https://img.shields.io/npm/v/emoji-smuggle?color=00FF41&style=flat-square)](https://www.npmjs.com/package/emoji-smuggle)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-00D1FF.svg?style=flat-square)](https://github.com/Subhan-Haider/EmojiSmuggle/pulls)
[![Live Demo](https://img.shields.io/badge/Live-Demo-white?style=flat-square&logo=vercel)](https://emoji.subhan.tech)

[**Explore the App**](https://emoji.subhan.tech) • [**Read the SDK Docs**](./emoji-smuggle/README.md) • [**API Reference**](https://emoji.subhan.tech/developers)

</div>

---

## ⚡ Why Emoji Smuggle?

Standard encryption is easy to spot. **Emoji Smuggle** uses advanced Unicode steganography to hide data in plain sight. To anyone watching, it's just a string of emojis. To you, it's a secure, compressed, and encrypted communication channel.

### 🚀 Key Features

- **🛡️ Steganography:** 100% invisible payloads using Zero-Width Unicode characters.
- **🖼️ Image Smuggling:** Ultra-efficient JPEG compression allows you to hide small images inside emojis.
- **🔐 AES-256 Security:** Optional high-grade encryption for maximum privacy.
- **💎 Client-Side Logic:** No data ever touches our servers. Privacy by architecture.
- **🎨 Custom Packs:** Use themed emoji carriers: *Cyberpunk, Space, Nature, or Ghost.*
- **📦 Dev-First SDK:** A production-ready [npm package](./emoji-smuggle) for seamless integration.

---

## 💻 Quick Start with SDK

Integrate steganography into your own project in seconds:

```bash
npm install emoji-smuggle
```

```javascript
import { encodeMessage, decodeMessage } from 'emoji-smuggle';

// Encode a secret
const msg = encodeMessage("Target Acquired 🎯", { carrier: 'cyberpunk' });
console.log(msg); // 🕵️​‌‌​‌​​​‌​‌​​‌​​‌​‌​​‌‌​‌​​‌‌​​‌📦

// Decode back
const original = decodeMessage(msg);
```

---

## 🛠️ Built With

| Tech | Purpose |
| :--- | :--- |
| **React + Vite** | High-performance Frontend |
| **Tailwind CSS** | Premium Cyberpunk UI |
| **Framer Motion** | Fluid Orchestration & Animations |
| **Pako** | Zlib/Deflate Compression |
| **CryptoJS** | AES-256 Encryption |

---

## 📡 Open API

Our API is fully open and registration-free. Use it to build your own privacy tools without any barriers.

```bash
curl -X POST https://api.emoji.subhan.tech/v1/encode \
  -H "Content-Type: application/json" \
  -d '{"payload": "Secret Data", "carrier": "random"}'
```

---

<div align="center">

### Built with ⚡ by [Subhan Haider](https://github.com/Subhan-Haider)

*Transforming innocent emojis into secure carriers.*

</div>
## 🚀 Deployment

To host Emoji Smuggle on your own Linux server, follow these steps:

### 1. Build the Production Bundle
Generate the optimized static assets:
```bash
npm run build
```

### 2. Configure Nginx
Create a new site configuration in `/etc/nginx/sites-available/emoji-smuggle`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/emoji-smuggle;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Deploy
Upload the contents of the `dist/` folder to `/var/www/emoji-smuggle` and restart Nginx:
```bash
sudo systemctl restart nginx
```

---

Built with ❤️ by [EmojiSmuggle Labs](https://emoji.subhan.tech)

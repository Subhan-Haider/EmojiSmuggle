<div align="center">
  <img src="https://raw.githubusercontent.com/EmojiSmuggle/emoji-smuggle/main/assets/logo.png" width="120" alt="Emoji Smuggle Logo" />
  <h1>emoji-smuggle</h1>
  <p><strong>Hide private data inside innocent-looking emoji strings using Unicode steganography.</strong></p>
  
  <p>
    <a href="https://www.npmjs.com/package/emoji-smuggle"><img src="https://img.shields.io/npm/v/emoji-smuggle" alt="NPM Version" /></a>
    <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square" alt="License: Apache 2.0" /></a>
    <a href="https://bundlephobia.com/package/emoji-smuggle"><img src="https://img.shields.io/bundlephobia/minzip/emoji-smuggle" alt="Bundle Size" /></a>
  </p>
</div>

---

## What is this?
**emoji-smuggle** is a lightweight, zero-dependency (well, almost!) JavaScript SDK for hiding secret text messages inside completely normal-looking strings of emojis. 

It works by taking your text, compressing it, converting it to binary, and then representing that binary as invisible Zero-Width Unicode characters. These invisible characters are then safely tucked in between random (or chosen) emojis.

To the naked eye, the output is just a string of emojis (`😂🔥🎉😎⚡`). But to the SDK, it contains a highly-compressed, optionally AES-encrypted, secret payload.

## Features
- **Steganography:** 100% invisible payload hiding using ZWJ/ZWNJ characters.
- **Auto-Compression:** Built-in `pako` deflation shrinks your data footprint.
- **AES Encryption:** Built-in support for password-protected payloads.
- **Universal:** Works flawlessly in Node.js, browsers, and edge environments.
- **Type-Safe:** Ships with complete TypeScript definitions.

## Installation

```bash
npm install emoji-smuggle
```
or using Yarn / pnpm:
```bash
yarn add emoji-smuggle
pnpm add emoji-smuggle
```

---

## Quick Start

### Basic Encoding & Decoding

```javascript
import { encodeMessage, decodeMessage } from 'emoji-smuggle';

// 1. Encode your secret message
const secretPayload = "Meet me at the secure location at midnight.";
const encodedEmojiString = encodeMessage(secretPayload);

console.log(encodedEmojiString);
// Output: "😂[invisible data]🔥[invisible data]🎉[invisible data]😎"

// 2. Decode the payload
const decodedText = decodeMessage(encodedEmojiString);

console.log(decodedText);
// Output: "Meet me at the secure location at midnight."
```

### Password Protection (AES Encryption)

You can encrypt your message with AES-256 before hiding it in emojis:

```javascript
import { encodeWithPassword, decodeWithPassword } from 'emoji-smuggle';

const secret = "Top Secret Intel";
const password = "super_strong_password_123";

// Encode with a password
const encoded = encodeWithPassword(secret, password);

// Decode requiring the exact password
try {
  const result = decodeWithPassword(encoded, password);
  console.log(result); // "Top Secret Intel"
} catch (error) {
  console.error("Failed to decode: Invalid password or corrupted data");
}
```

### Custom Emoji Carriers

By default, the SDK uses a random preset of popular emojis. You can specify a different preset, or provide your own array of emojis to act as the "carrier":

```javascript
import { encodeMessage } from 'emoji-smuggle';

// Use a built-in preset ('cyberpunk', 'ghost', 'nature', 'random')
const cyberEncode = encodeMessage("Wake up, Samurai", { carrier: 'cyberpunk' });

// Or provide your own custom emoji carriers!
const myEmojis = ['🍎', '🍌', '🍉', '🍇'];
const fruitEncode = encodeMessage("Healthy secrets", { carrier: myEmojis });
```

---

## API Reference

### `encodeMessage(text: string, options?: EncodeOptions): string`
Takes a string and returns an emoji string containing the hidden data.

**Options:**
- `password` *(string)*: Optional password to encrypt the payload via AES before hiding.
- `carrier` *(string | string[])*: Name of a built-in preset (`'cyberpunk'`, `'ghost'`, `'nature'`, `'random'`) or a custom array of emojis. Default is `'random'`.
- `compress` *(boolean)*: Whether to compress the data using zlib/deflate. Default is `true`.

### `decodeMessage(encoded: string, options?: DecodeOptions): string`
Extracts the hidden payload from an emoji string.

**Options:**
- `password` *(string)*: The password used during encoding (required if encrypted).
- `compressed` *(boolean)*: Whether the payload was compressed. Default is `true`.

### `detectHiddenMessage(input: string): boolean`
Quickly checks if a given string contains the `emoji-smuggle` invisible signature, allowing you to identify if a string is carrying a payload before attempting to decode it.

---

## How it Works (Emoji Steganography)
The magic relies on Unicode Zero-Width characters. These are valid text characters that instruct the text-rendering engine about formatting but have **no visual width** themselves. 

1. Your text is turned into a binary string (`01101000...`).
2. Every `0` is mapped to a Zero-Width Space (`U+200B`).
3. Every `1` is mapped to a Zero-Width Non-Joiner (`U+200C`).
4. We wrap the payload in a specific invisible signature so our SDK can find it later.
5. The invisible payload is chopped up and interleaved between the visual emojis you selected.

When the string is rendered in Discord, WhatsApp, Twitter, or a browser, the text engine completely ignores the invisible characters, showing only the emojis.

## Security Notes
- **Steganography is not Encryption:** By default, anyone using this SDK can decode an `encodeMessage` output. If your data is sensitive, you **must** pass a `password` option to utilize the built-in AES encryption.
- **Platform Stripping:** Some aggressive platforms (like Instagram or certain SMS gateways) may sanitize and strip Zero-Width characters from messages. We recommend testing on your target platform. Discord, WhatsApp, Telegram, and standard web inputs generally support them flawlessly.

## Performance Notes
- Hiding data in Unicode characters is extremely robust but inflates the byte-size of your message. One byte of ASCII text takes 8 bits -> 8 Zero-Width characters -> roughly 24 bytes of UTF-8 data. 
- Because of this 24x size inflation, `emoji-smuggle` automatically runs `pako` deflate compression on your payload before hiding it, significantly mitigating the size cost. 
- For massive payloads (e.g., trying to hide megabytes of data), browser memory limits on string manipulation may become a bottleneck.

## License
MIT © EmojiSmuggle

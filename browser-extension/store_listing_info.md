# 🛒 Chrome Web Store - Store Listing & Privacy Disclosures
This file contains the complete, pre-formatted, and optimized copy-pasteable metadata needed to publish the **Emoji Smuggle** extension to the Google Chrome Web Store Developer Console.

---

## 📝 1. PRODUCT DETAILS

### Title
```text
Emoji Smuggle
```

### Summary (16,000 char max, but keep it brief and catchy)
```text
Hide secret messages inside innocent emojis using invisible steganography.
```

### Description
```text
🕵️ HIDE SECRETS IN PLAIN SIGHT WITH EMOJI STEGANOGRAPHY

Standard encrypted messages raise instant suspicion. Emoji Smuggle changes the game by using advanced Unicode steganography to embed hidden messages, compressed data, and encrypted secrets inside ordinary emojis! 

To anyone watching, it’s just a normal string of emojis. To your recipient, it is a highly secure, private channel of communication.

🚀 KEY FEATURES:
• 100% Invisible Payloads: Uses zero-width Unicode characters (ZWJ/ZWNJ) to slide secrets between emojis completely invisibly.
• Zero Server Footprint: All encoding and decoding happen 100% locally in your browser. Complete privacy by design.
• Powerful Auto-Compression: Integrates advanced deflate compression to keep hidden payloads compact.
• Optional AES-256 Encryption: Lock sensitive data with a password so only people with the key can decode it.
• Instant Right-Click Integration: Simply select any text on any website, right-click, and steganographize it in one click!

🎮 HOW TO USE:
1. Highlight any text you want to hide on a webpage.
2. Right-click and choose "Encode with Emoji Smuggle".
3. Copy the innocent-looking emojis generated!
4. To decode, highlight the emojis, right-click, and select "Decode with Emoji Smuggle".

Perfect for secure note-taking, privacy enthusiasts, and safe communication across Discord, WhatsApp, Telegram, forums, and standard emails. Transform innocent emojis into secure carriers today!
```

---

## 🎛️ 2. CATEGORIES, LANGUAGE, & ADDITIONAL FIELDS

* **Category:** `Productivity` or `Social & Communication`
* **Language:** `English`
* **Official URL:** `https://emoji.subhan.tech`
* **Homepage URL:** `https://emoji.subhan.tech`
* **Support URL:** `https://github.com/Subhan-Haider/EmojiSmuggle/issues`
* **Mature Content:** `No`
* **Visibility:** `Public`

---

## 🔒 3. PRIVACY & DATA DISCLOSURES
Use these exact justifications to ensure smooth approval under Chrome Web Store policies.

### Single Purpose Description (1,000 char max)
```text
The single purpose of the Emoji Smuggle extension is to allow users to encode and decode short, private text messages inside ordinary-looking strings of emojis directly from their browser, using locally-processed Unicode steganography.
```

### Permission Justifications
Provide these reasons when prompted for why each manifest permission is required:

* **`contextMenus`:**
  ```text
  Required to add convenient "Encode with Emoji Smuggle" and "Decode with Emoji Smuggle" actions to the user's right-click context menu when selecting text, allowing them to encode or decode stego messages instantly on any webpage.
  ```
* **`storage`:**
  ```text
  Required to store and load user configuration preferences (such as preferred default emoji carrier presets and stego configuration settings) locally within the browser’s extension sandbox.
  ```
* **`clipboardWrite`:**
  ```text
  Required to copy newly encoded emoji strings or extracted plain-text messages directly to the user's clipboard upon completion, providing a fluid user experience.
  ```
* **`clipboardRead`:**
  ```text
  Required to allow the user to instantly paste stego payloads from their clipboard into the extension’s decode console with a single tap, reducing manual copy-paste steps.
  ```

### Remote Code Usage
* **Are you using remote code?** Select **`No, I am not using Remote code`**.
* **Justification:**
  ```text
  Not applicable. All steganographic logic, assets, and compression algorithms (such as the standard client-side deflate libraries) are bundled 100% locally inside the extension package. No external scripts are loaded.
  ```

### Data Usage Collection (Checkboxes)
* **Categories Collected:** **Do NOT check any boxes.** Leave all categories (Personally identifiable, Health, Financial, Personal communications, Location, etc.) completely **UNCHECKED**.
* **Certifications:** Check **ALL THREE** checkboxes to certify your compliance:
  1. `[✓] I do not sell or transfer user data to third parties, outside of the approved use cases`
  2. `[✓] I do not use or transfer user data for purposes that are unrelated to my item's single purpose`
  3. `[✓] I do not use or transfer user data to determine creditworthiness or for lending purposes`

### Privacy Policy URL
```text
https://emoji.subhan.tech/privacy
```

---

## 🎨 4. GRAPHIC ASSETS
These graphic files are pre-generated and located directly inside your extension directory:

* **Store Icon (128x128):** `browser-extension/app_icon.png` (or any other `icon-128.png` asset).
* **Small Promo Tile (440x280):** `browser-extension/small_promo_tile.png`
* **Marquee Promo Tile (1400x560):** `browser-extension/marquee_promo_tile.png`

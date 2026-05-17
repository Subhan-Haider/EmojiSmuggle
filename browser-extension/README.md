# 🌐 Emoji Smuggle - Browser Extension (Manifest V3)

An elegant, low-footprint, local-first browser extension for Google Chrome, Brave, Edge, and other Chromium browsers that integrates zero-width Unicode steganography directly into your web browsing experience.

---

## 🚀 Key Features

* **Quick-Access Popup Interface:** Click the extension icon in your browser toolbar to instantly open a premium, cyberpunk-styled dashboard to encode and decode secret messages on the fly.
* **Smart Context Menu Integration:** Highlight any text or emoji string on any website, right-click, and instantly select:
  * 🔒 **"Encode with Emoji Smuggle"** to inject a hidden secret.
  * 🔓 **"Decode with Emoji Smuggle"** to extract hidden messages without leaving your current webpage.
* **100% Client-Side Processing:** Runs entirely locally inside your browser sandbox. All encryption and processing occur in-memory without contacting external servers.
* **Seamless Clipboard Sync:** Auto-detects and processes steganographic emoji payloads from your active browser clipboard with one click.

---

## 🛠️ Technical Specifications

* **Manifest Version:** **V3** (Fully compatible with modern Google Chrome Web Store policies)
* **Core APIs Utilized:**
  * `chrome.contextMenus`: Registers instant right-click text actions.
  * `chrome.storage.local`: Safely stores user theme configurations locally.
  * `chrome.tabs`: Facilitates secure communication and stego script injection into web tabs.
* **Assets Provided:** Pre-generated, non-alpha compliant 24-bit assets ready for Chrome Web Store listing approval:
  * 📍 **Small Promo Tile (440x280):** `browser-extension/small_promo_tile.png`
  * 📍 **Marquee Promo Tile (1400x560):** `browser-extension/marquee_promo_tile.png`

---

## 🏗️ Developer Installation (Load Unpacked)

To test or develop the extension locally in your Chromium-based browser:

1. Open your browser and navigate to **`chrome://extensions/`**.
2. Toggle the **"Developer mode"** switch in the top right corner to **ON**.
3. Click the **"Load unpacked"** button in the top left corner.
4. Select the **`browser-extension`** directory from your project folder:
   `C:\Users\setup\Videos\WEBSITES FOR CHANGES\emog\browser-extension\`
5. The extension will mount instantly, and the Emoji Smuggle icon will appear in your toolbar!

---

## 📝 Chrome Web Store Listing Details
For a complete copy-pasteable listing description, single purpose declarations, and permission justifications, refer to:
📍 **[`browser-extension/store_listing_info.md`](file:///c:/Users/setup/Videos/WEBSITES%20FOR%20CHANGES/emog/browser-extension/store_listing_info.md)**

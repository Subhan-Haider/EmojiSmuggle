# 📱 Emoji Smuggle - Android Steganography App

A premium, high-fidelity, local-first Android utility that hides secure, compressed, and optionally encrypted messages completely invisibly within ordinary strings of emojis using zero-width Unicode steganography.

---

## 🚀 Key Features

* **System-wide `PROCESS_TEXT` Integration:** Highlight any text in **any external application** (e.g. WhatsApp, Discord, Telegram, or Notes) and instantly select "Encode with Emoji Smuggle" or "Decode with Emoji Smuggle" from the system selection popover to transform your secrets in-place!
* **Draggable Floating Action Bubble:** A persistent, high-performance overlay window that allows you to easily encode and decode messages on top of any active chat screen.
* **Smart Clipboard Detector:** Scans your system clipboard automatically upon app startup and prompts you if a hidden steganographic payload is detected.
* **Native Android Share Sheet Hook:** Share text directly from other apps into Emoji Smuggle to auto-populate the stego encoder.
* **100% Offline Security:** Zero internet permissions required. All encoding, decoding, and optional AES-256 password protection occur entirely in-memory on your physical device.

---

## 🛠️ Technical Stack & Architecture

* **Language:** 100% Modern Kotlin
* **UI Framework:** Jetpack Compose (Material 3 with custom premium cyberpunk glassmorphic style)
* **Camera & ML Kit:** Integrates Google's ML Kit Barcode scanning and Androidx CameraX for scanning stego codes.
* **Encryption Core:** Local AES-256 GCM authenticated encryption.
* **SDK Compatibility:** 
  * `minSdk`: **24** (Android 7.0+)
  * `targetSdk`: **35** (Android 15+ / fully compliant with modern Google Play requirements)

---

## 🏗️ Developer Build & Compilation

### Prerequisites
* **Java JDK:** JDK 17+ (A local copy is configured at `temp_jdk/jdk-17.0.19+10`)
* **Android SDK:** API Level 35

### Building from Source (Local Compilation)

To compile the application using your configured local environment, execute the following PowerShell scripts in your root directory:

#### 1. Compile signed Android App Bundle (`.aab` for Google Play Store upload)
```powershell
$jdkPath = "temp_jdk\jdk-17.0.19+10"
$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;" + $env:PATH
cd android
.\gradlew.bat bundleRelease
```
*Output File Location:* `android/app/build/outputs/bundle/release/app-release.aab`

#### 2. Compile signed Release Android Package (`.apk` for direct installation)
```powershell
$jdkPath = "temp_jdk\jdk-17.0.19+10"
$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;" + $env:PATH
cd android
.\gradlew.bat assembleRelease
```
*Output File Location:* `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔑 App Signing Details
The production build is signed using a secure local keystore located at [`android/app/release-key.jks`](file:///c:/Users/setup/Videos/WEBSITES%20FOR%20CHANGES/emog/android/app/release-key.jks).

* **Key Alias:** `emojismuggle`
* **Keystore Password:** `password123`
* **Key Password:** `password123`
* **SHA-256 Fingerprint:** `8F:DF:3D:BE:D4:E9:6A:14:2B:5B:61:26:71:09:F9:ED:14:69:84:03:A3:EF:AD:B9:C3:99:66:2B:84:49:0D:C6`

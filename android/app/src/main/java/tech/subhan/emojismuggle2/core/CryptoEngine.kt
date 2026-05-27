package tech.subhan.emojismuggle2.core

import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

object CryptoEngine {
    private const val BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

    private fun base64Encode(bytes: ByteArray): String {
        val sb = StringBuilder()
        var i = 0
        while (i < bytes.size) {
            val b0 = bytes[i++].toInt() and 0xFF
            if (i < bytes.size) {
                val b1 = bytes[i++].toInt() and 0xFF
                if (i < bytes.size) {
                    val b2 = bytes[i++].toInt() and 0xFF
                    sb.append(BASE64_CHARS[b0 shr 2])
                    sb.append(BASE64_CHARS[((b0 and 3) shl 4) or (b1 shr 4)])
                    sb.append(BASE64_CHARS[((b1 and 0xF) shl 2) or (b2 shr 6)])
                    sb.append(BASE64_CHARS[b2 and 0x3F])
                } else {
                    sb.append(BASE64_CHARS[b0 shr 2])
                    sb.append(BASE64_CHARS[((b0 and 3) shl 4) or (b1 shr 4)])
                    sb.append(BASE64_CHARS[(b1 and 0xF) shl 2])
                    sb.append('=')
                }
            } else {
                sb.append(BASE64_CHARS[b0 shr 2])
                sb.append(BASE64_CHARS[(b0 and 3) shl 4])
                sb.append("==")
            }
        }
        return sb.toString()
    }

    private fun base64Decode(base64: String): ByteArray {
        val clean = base64.replace(Regex("[^A-Za-z0-9+/=]"), "")
        val len = clean.length
        if (len == 0) return ByteArray(0)
        
        var padding = 0
        if (clean.endsWith("==")) padding = 2
        else if (clean.endsWith("=")) padding = 1
        
        val outLen = (len / 4) * 3 - padding
        val out = ByteArray(outLen)
        
        var i = 0
        var j = 0
        while (i < len) {
            val c0 = BASE64_CHARS.indexOf(clean[i++])
            val c1 = BASE64_CHARS.indexOf(clean[i++])
            val c2 = if (clean[i] == '=') 0 else BASE64_CHARS.indexOf(clean[i])
            i++
            val c3 = if (clean[i] == '=') 0 else BASE64_CHARS.indexOf(clean[i])
            i++
            
            val triple = (c0 shl 18) or (c1 shl 12) or (c2 shl 6) or c3
            
            if (j < outLen) out[j++] = ((triple shr 16) and 0xFF).toByte()
            if (j < outLen) out[j++] = ((triple shr 8) and 0xFF).toByte()
            if (j < outLen) out[j++] = (triple and 0xFF).toByte()
        }
        return out
    }

    fun encrypt(data: String, password: String?): String {
        if (password.isNullOrEmpty()) return data
        
        val salt = ByteArray(8)
        SecureRandom().nextBytes(salt)
        
        val (key, iv) = evpKDF(password.toByteArray(Charsets.UTF_8), salt)
        
        val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "AES"), IvParameterSpec(iv))
        
        val encrypted = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
        
        val saltedPrefix = "Salted__".toByteArray(Charsets.US_ASCII)
        val combined = ByteArray(saltedPrefix.size + salt.size + encrypted.size)
        System.arraycopy(saltedPrefix, 0, combined, 0, saltedPrefix.size)
        System.arraycopy(salt, 0, combined, saltedPrefix.size, salt.size)
        System.arraycopy(encrypted, 0, combined, saltedPrefix.size + salt.size, encrypted.size)
        
        return base64Encode(combined)
    }

    fun decrypt(data: String, password: String?): String {
        if (password.isNullOrEmpty()) {
            if (data.startsWith("U2FsdGVkX1")) {
                return "ERROR: Password required for this encrypted payload."
            }
            return data
        }
        
        try {
            val combined = base64Decode(data)
            val saltedPrefix = "Salted__".toByteArray(Charsets.US_ASCII)
            
            if (combined.size < 16 || !combined.copyOfRange(0, 8).contentEquals(saltedPrefix)) {
                return "ERROR: Invalid encrypted payload format."
            }
            
            val salt = combined.copyOfRange(8, 16)
            val encrypted = combined.copyOfRange(16, combined.size)
            
            val (key, iv) = evpKDF(password.toByteArray(Charsets.UTF_8), salt)
            
            val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
            cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "AES"), IvParameterSpec(iv))
            
            val decrypted = cipher.doFinal(encrypted)
            return String(decrypted, Charsets.UTF_8)
        } catch (e: Exception) {
            e.printStackTrace()
            return "ERROR: Incorrect Password or Corrupted Payload. Details: ${e.message}"
        }
    }

    private fun evpKDF(password: ByteArray, salt: ByteArray): Pair<ByteArray, ByteArray> {
        val digest = MessageDigest.getInstance("MD5")
        var current = ByteArray(0)
        val key = ByteArray(32) // 256 bits
        val iv = ByteArray(16)  // 128 bits
        
        var keyIdx = 0
        var ivIdx = 0
        
        while (keyIdx < 32 || ivIdx < 16) {
            digest.reset()
            digest.update(current)
            digest.update(password)
            digest.update(salt)
            current = digest.digest()
            
            var i = 0
            while (i < current.size && keyIdx < 32) {
                key[keyIdx++] = current[i++]
            }
            while (i < current.size && ivIdx < 16) {
                iv[ivIdx++] = current[i++]
            }
        }
        return Pair(key, iv)
    }
}

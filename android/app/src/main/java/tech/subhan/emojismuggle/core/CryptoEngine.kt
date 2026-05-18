package tech.subhan.emojismuggle.core

import android.util.Base64
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

object CryptoEngine {
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
        
        return Base64.encodeToString(combined, Base64.NO_WRAP)
    }

    fun decrypt(data: String, password: String?): String {
        if (password.isNullOrEmpty()) {
            if (data.startsWith("U2FsdGVkX1")) {
                return "ERROR: Password required for this encrypted payload."
            }
            return data
        }
        
        try {
            val combined = Base64.decode(data, Base64.DEFAULT)
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
            return "ERROR: Incorrect Password or Corrupted Payload."
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

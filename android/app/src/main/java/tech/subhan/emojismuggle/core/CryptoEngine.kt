package tech.subhan.emojismuggle.core

import android.util.Base64
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

object CryptoEngine {
    private fun generateKey(password: String): SecretKeySpec {
        val digest = MessageDigest.getInstance("SHA-256")
        val bytes = password.toByteArray(Charsets.UTF_8)
        digest.update(bytes, 0, bytes.size)
        val key = digest.digest()
        return SecretKeySpec(key, "AES")
    }

    fun encrypt(data: String, password: String?): String {
        if (password.isNullOrEmpty()) return data
        val secretKey = generateKey(password)
        val cipher = Cipher.getInstance("AES/ECB/PKCS5Padding")
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        val encrypted = cipher.doFinal(data.toByteArray(Charsets.UTF_8))
        return "ENC:" + Base64.encodeToString(encrypted, Base64.NO_WRAP)
    }

    fun decrypt(data: String, password: String?): String {
        if (!data.startsWith("ENC:")) return data
        if (password.isNullOrEmpty()) return "ERROR: Password required for this encrypted payload."
        try {
            val actualData = data.substring(4)
            val secretKey = generateKey(password)
            val cipher = Cipher.getInstance("AES/ECB/PKCS5Padding")
            cipher.init(Cipher.DECRYPT_MODE, secretKey)
            val decrypted = cipher.doFinal(Base64.decode(actualData, Base64.NO_WRAP))
            return String(decrypted, Charsets.UTF_8)
        } catch (e: Exception) {
            return "ERROR: Incorrect Password or Corrupted Payload."
        }
    }
}

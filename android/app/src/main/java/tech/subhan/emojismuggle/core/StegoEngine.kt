package tech.subhan.emojismuggle.core

object StegoEngine {
    private const val BIT_1 = '\u200D' // ZWJ
    private const val BIT_0 = '\u200C' // ZWNJ

    fun smuggle(message: String, password: String? = null): String {
        val payload = CryptoEngine.encrypt(message, password)
        val bytes = payload.toByteArray(Charsets.UTF_8)
        
        val binaryChars = CharArray(bytes.size * 8)
        var charIdx = 0
        for (b in bytes) {
            val byteVal = b.toInt() and 0xFF
            for (bit in 7 downTo 0) {
                binaryChars[charIdx++] = if (((byteVal shr bit) and 1) == 1) '1' else '0'
            }
        }
        
        val hidden = String(binaryChars)
        val carrier = listOf("🕵️", "📦", "💾", "🔌", "💻", "⚡", "🏙️", "🦾", "🥽", "🌃").shuffled().take(3)
        
        val result = StringBuilder()
        val chunkSize = Math.ceil(hidden.length.toDouble() / carrier.size).toInt()
        
        var currentIdx = 0
        for (emoji in carrier) {
            result.append(emoji)
            val end = Math.min(currentIdx + chunkSize, hidden.length)
            if (currentIdx < hidden.length) {
                result.append(hidden.substring(currentIdx, end))
            }
            currentIdx += chunkSize
        }
        
        return result.toString()
    }

    fun extract(encoded: String, password: String? = null): String {
        val hiddenChars = CharArray(encoded.length)
        var hiddenLen = 0
        for (i in 0 until encoded.length) {
            val c = encoded[i]
            if (c == BIT_1 || c == BIT_0) {
                hiddenChars[hiddenLen++] = c
            }
        }
        
        if (hiddenLen == 0) return "ERROR: No hidden payload detected."
        
        val byteLength = hiddenLen / 8
        if (byteLength == 0) return "ERROR: Payload too short."
        
        val bytes = ByteArray(byteLength)
        for (i in 0 until byteLength) {
            var byteVal = 0
            for (bit in 0..7) {
                val c = hiddenChars[i * 8 + bit]
                val bitVal = if (c == BIT_1) 1 else 0
                byteVal = (byteVal shl 1) or bitVal
            }
            bytes[i] = byteVal.toByte()
        }
        
        val rawData = String(bytes, Charsets.UTF_8)
        return try {
            CryptoEngine.decrypt(rawData, password)
        } catch (e: Exception) {
            "ERROR: Decoding failed."
        }
    }
}

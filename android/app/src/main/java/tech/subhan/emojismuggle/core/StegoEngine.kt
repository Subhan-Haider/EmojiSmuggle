package tech.subhan.emojismuggle.core

object StegoEngine {
    private const val BIT_1 = '\u200D' // ZWJ
    private const val BIT_0 = '\u200C' // ZWNJ

    fun smuggle(message: String, password: String? = null): String {
        val payload = CryptoEngine.encrypt(message, password)
        val binary = payload.toByteArray().joinToString("") { 
            it.toInt().and(0xFF).toString(2).padStart(8, '0') 
        }
        val hidden = binary.map { if (it == '1') BIT_1 else BIT_0 }.joinToString("")
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
        val hidden = encoded.filter { it == BIT_1 || it == BIT_0 }
        if (hidden.isEmpty()) return "ERROR: No hidden payload detected."
        
        val binary = hidden.map { if (it == BIT_1) '1' else '0' }.joinToString("")
        val chunks = binary.chunked(8)
        
        val bytes = mutableListOf<Byte>()
        for (chunk in chunks) {
            if (chunk.length == 8) {
                bytes.add(chunk.toInt(2).toByte())
            }
        }
        
        val rawData = String(bytes.toByteArray())
        return try {
            CryptoEngine.decrypt(rawData, password)
        } catch (e: Exception) {
            "ERROR: Decoding failed."
        }
    }
}

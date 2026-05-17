package tech.subhan.emojismuggle.core

object StegoEngine {
    private val HEX_TO_EMOJI = listOf(
        "😀", "😎", "🤖", "👾", "👻", "🦄", "🐼", "🦊", 
        "⚡", "🔥", "⭐", "🍀", "🍕", "🎮", "🚀", "🎈"
    )

    fun smuggle(message: String, password: String? = null): String {
        val payload = CryptoEngine.encrypt(message, password)
        val bytes = payload.toByteArray(Charsets.UTF_8)
        
        val sb = StringBuilder()
        for (b in bytes) {
            val byteVal = b.toInt() and 0xFF
            val highNibble = (byteVal shr 4) and 0x0F
            val lowNibble = byteVal and 0x0F
            sb.append(HEX_TO_EMOJI[highNibble])
            sb.append(HEX_TO_EMOJI[lowNibble])
        }
        return sb.toString()
    }

    fun extract(encoded: String, password: String? = null): String {
        val emojiToHex = HashMap<String, Int>()
        for (i in 0 until HEX_TO_EMOJI.size) {
            emojiToHex[HEX_TO_EMOJI[i]] = i
        }
        
        val parsedNibbles = mutableListOf<Int>()
        var i = 0
        while (i < encoded.length) {
            val codePoint = encoded.codePointAt(i)
            val emoji = String(Character.toChars(codePoint))
            val hexVal = emojiToHex[emoji]
            if (hexVal != null) {
                parsedNibbles.add(hexVal)
            }
            i += Character.charCount(codePoint)
        }
        
        if (parsedNibbles.isEmpty()) return "ERROR: No hidden payload detected."
        if (parsedNibbles.size % 2 != 0) return "ERROR: Corrupted payload."
        
        val byteLength = parsedNibbles.size / 2
        val bytes = ByteArray(byteLength)
        for (idx in 0 until byteLength) {
            val high = parsedNibbles[idx * 2]
            val low = parsedNibbles[idx * 2 + 1]
            bytes[idx] = ((high shl 4) or low).toByte()
        }
        
        val rawData = String(bytes, Charsets.UTF_8)
        return try {
            CryptoEngine.decrypt(rawData, password)
        } catch (e: Exception) {
            "ERROR: Decoding failed."
        }
    }
}

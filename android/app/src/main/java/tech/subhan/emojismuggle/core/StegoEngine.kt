package tech.subhan.emojismuggle.core

object StegoEngine {
    private const val ZW0 = '\u200B'
    private const val ZW1 = '\u200C'
    private const val ZWS = '\u200D'
    private const val ZWMK = '\uFEFF'

    private val SIGNATURE = "$ZWMK$ZW0$ZW1$ZW0$ZW1$ZWMK"
    private val SIGNATURE_END = "$ZWMK$ZW1$ZW0$ZW1$ZW0$ZWMK"
    private val SIGNATURE_END_TRIMMED = "$ZWMK$ZW1$ZW0$ZW1$ZW0"

    private val CARRIER_POOL = listOf(
        "🕵️", "💬", "🔒", "⚡", "📦", "💾", "💻", "🔑", "🛡️", "🔮", "🖼️", "🔌", "🦾", "🥽", "🌃",
        "😀", "😎", "👾", "👻", "🦄", "🐼", "🦊", "🍕", "🎮", "🚀", "🎈", "🎉", "🔥", "🌈", "☀️",
        "🌊", "⭐", "🍀", "🚗", "🛸", "🌍", "🪐", "🌟", "✨", "💎", "🎯", "🎨", "🎤", "🎧", "🎬",
        "🧩", "🧪", "🧬", "📡", "🔋", "💡", "🧠", "🦖", "🐉", "🐾", "🦂", "🦁", "🐯", "🐱", "🐶",
        "🐻", "🐨", "🐸", "🐙", "🦑", "🦐", "🐠", "🐬", "🐳", "🐊", "🦍", "🐘", "🦅", "🦉",
        "🧁", "🍩", "🍪", "🍫", "🍯", "🍔", "🍟", "🌮", "🍣", "🍜", "🍞", "🧀", "🍦", "🍎", "🍓",
        "🍒", "🍍", "🥑", "🌶️", "🍄", "🌴", "🌵", "🍁", "🌸", "🧿", "⚙️", "🧭", "🌋",
        "🏕️", "🏜️", "🏝️", "🎡", "🎢", "🛫", "🤖", "🎭", "🎪", "🎫", "🏆", "🏅", "🎲"
    )

    fun smuggle(message: String, password: String? = null, carrierCount: Int? = null): String {
        val payload = CryptoEngine.encrypt(message, password)
        val bytes = payload.toByteArray(Charsets.UTF_8)
        
        val bits = StringBuilder()
        for (b in bytes) {
            val byteVal = b.toInt() and 0xFF
            for (bit in 7 downTo 0) {
                val bitVal = (byteVal shr bit) and 1
                bits.append(if (bitVal == 1) "1" else "0")
            }
        }
        
        val zwBuilder = StringBuilder()
        for (i in 0 until bits.length) {
            zwBuilder.append(if (bits[i] == '1') ZW1 else ZW0)
            if ((i + 1) % 64 == 0) zwBuilder.append(ZWS)
        }
        
        val fullPayload = "$SIGNATURE${zwBuilder.toString()}$SIGNATURE_END"
        
        val isImage = message.startsWith("IMAGE_STAMP:")
        val count = carrierCount ?: if (isImage) (3..5).random() else (2..4).random()
        val carriers = CARRIER_POOL.shuffled().take(count.coerceIn(2, CARRIER_POOL.size))
        
        val charsPerEmoji = Math.ceil(fullPayload.length.toDouble() / carriers.size).toInt()
        
        val result = StringBuilder()
        var idx = 0
        for (emoji in carriers) {
            val chunkLength = Math.min(charsPerEmoji, fullPayload.length - idx)
            result.append(emoji)
            if (chunkLength > 0) {
                result.append(fullPayload.substring(idx, idx + chunkLength))
                idx += chunkLength
            }
        }
        return result.toString()
    }

    fun extract(encoded: String, password: String? = null): String {
        val startIdx = encoded.indexOf(SIGNATURE)
        var endIdx = encoded.lastIndexOf(SIGNATURE_END)
        if (endIdx == -1) {
            endIdx = encoded.lastIndexOf(SIGNATURE_END_TRIMMED)
        }
        
        if (startIdx == -1 || endIdx == -1 || startIdx >= endIdx) {
            return "ERROR: No valid hidden message signature found."
        }
        
        val rawZw = encoded.substring(startIdx + SIGNATURE.length, endIdx)
        val zwList = mutableListOf<Char>()
        for (i in 0 until rawZw.length) {
            val c = rawZw[i]
            if (c == ZW0 || c == ZW1) {
                zwList.add(c)
            }
        }
        
        if (zwList.isEmpty()) return "ERROR: No hidden payload detected."
        
        val byteLength = zwList.size / 8
        if (byteLength == 0) return "ERROR: Payload too short."
        
        val bytes = ByteArray(byteLength)
        for (i in 0 until byteLength) {
            var byteVal = 0
            for (bit in 0..7) {
                val c = zwList[i * 8 + bit]
                val bitVal = if (c == ZW1) 1 else 0
                byteVal = (byteVal shl 1) or bitVal
            }
            bytes[i] = byteVal.toByte()
        }
        
        val rawData = String(bytes, Charsets.UTF_8)
        
        if (rawData.startsWith("U2FsdGVkX1") && password.isNullOrEmpty()) {
            return "ERROR: Message appears to be encrypted. Please provide a password."
        }

        return try {
            CryptoEngine.decrypt(rawData, password)
        } catch (e: Exception) {
            "ERROR: Decoding failed."
        }
    }

    fun containsStego(encoded: String): Boolean {
        return encoded.contains(SIGNATURE) &&
            (encoded.contains(SIGNATURE_END) || encoded.contains(SIGNATURE_END_TRIMMED))
    }
}

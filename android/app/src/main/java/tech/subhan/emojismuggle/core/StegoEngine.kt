package tech.subhan.emojismuggle.core

object StegoEngine {
    private const val BIT_1 = '\u200D' // ZWJ
    private const val BIT_0 = '\u200C' // ZWNJ

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
        
        val zwBuilder = StringBuilder()
        for (b in bytes) {
            val byteVal = b.toInt() and 0xFF
            for (bit in 7 downTo 0) {
                val bitVal = (byteVal shr bit) and 1
                if (bitVal == 1) {
                    zwBuilder.append(BIT_1)
                } else {
                    zwBuilder.append(BIT_0)
                }
            }
        }
        val invisiblePayload = zwBuilder.toString()
        
        val isImage = message.startsWith("IMAGE_STAMP:")
        val count = carrierCount ?: if (isImage) (3..5).random() else (2..4).random()
        val carriers = CARRIER_POOL.shuffled().take(count.coerceIn(2, CARRIER_POOL.size))
        
        val result = StringBuilder()
        result.append(carriers[0])
        result.append(invisiblePayload)
        for (idx in 1 until carriers.size) {
            result.append(carriers[idx])
        }
        return result.toString()
    }

    fun extract(encoded: String, password: String? = null): String {
        val zwList = mutableListOf<Char>()
        for (i in 0 until encoded.length) {
            val c = encoded[i]
            if (c == BIT_0 || c == BIT_1) {
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

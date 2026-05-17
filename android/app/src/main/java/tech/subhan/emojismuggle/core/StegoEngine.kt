package tech.subhan.emojismuggle.core

object StegoEngine {
    private val EMOJI_VOCAB = listOf(
        "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
        "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳",
        "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤",
        "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤫", "🫠",
        "✍️", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨",
        "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐒", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🦆", "🦅", "🦉",
        "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐜", "🐢", "🐍", "🦎", "🐙", "🦑", "🦐",
        "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🐘", "🦏",
        "🦛", "🐫", "🐪", "🦒", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🐐", "🦌", "🐕", "🐈", "🐓",
        "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦡", "🦦", "🦥", "🐿️", "🦔", "🐾", "🐉", "🦖",
        "🦕", "🌵", "🎄", "🌲", "🌳", "🌴", "🌱", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🌰", "🐚", "🕸️",
        "🕷️", "🦂", "🦟", "🪰", "🪲", "🪳", "⚡", "🔥", "🌈", "☀️", "🌤️", "⛅", "🌥️", "☁️", "🌧️", "⛈️",
        "🌩️", "❄️", "☃️", "⛄", "🌬️", "💨", "🌪️", "🌫️", "🌊", "💧", "🍕", "🍔", "🍟", "🌭", "🍿", "🍳",
        "🧇", "🥞", "🍞", "🥐", "🥨", "🥯", "🥖", "🧀", "🥗", "🥙", "🥪", "🌮", "🌯", "🍖", "🍗", "🥩",
        "🥓", "🍣", "🍤", "🍙", "🍘", "🍛", "🍜", "🍝", "🍢", "🍲", "🥘", "🍧", "🍨", "🍦", "🥧", "🍰",
        "🎂", "🧁", "🍮", "🍭", "🍬", "🍫", "🍩", "🍪", "🍯", "🧂", "🧈", "🚗", "🚀", "🛸", "🎈", "🎉"
    )

    fun smuggle(message: String, password: String? = null): String {
        val payload = CryptoEngine.encrypt(message, password)
        val bytes = payload.toByteArray(Charsets.UTF_8)
        
        val sb = StringBuilder()
        for (b in bytes) {
            val byteVal = b.toInt() and 0xFF
            sb.append(EMOJI_VOCAB[byteVal])
        }
        return sb.toString()
    }

    fun extract(encoded: String, password: String? = null): String {
        val emojiToByte = HashMap<String, Byte>()
        for (i in 0 until EMOJI_VOCAB.size) {
            emojiToByte[EMOJI_VOCAB[i]] = i.toByte()
        }
        
        val bytesList = mutableListOf<Byte>()
        var i = 0
        while (i < encoded.length) {
            val codePoint = encoded.codePointAt(i)
            val emoji = String(Character.toChars(codePoint))
            val byteVal = emojiToByte[emoji]
            if (byteVal != null) {
                bytesList.add(byteVal)
            }
            i += Character.charCount(codePoint)
        }
        
        if (bytesList.isEmpty()) return "ERROR: No hidden payload detected."
        
        val bytes = bytesList.toByteArray()
        val rawData = String(bytes, Charsets.UTF_8)
        return try {
            CryptoEngine.decrypt(rawData, password)
        } catch (e: Exception) {
            "ERROR: Decoding failed."
        }
    }
}

package tech.subhan.emojismuggle

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import tech.subhan.emojismuggle.core.CryptoEngine
import tech.subhan.emojismuggle.core.StegoEngine

class StegoTest {

    @Test
    fun testSelfSmuggleAndExtract() {
        val original = "hello world"
        val smuggled = StegoEngine.smuggle(original)
        assertTrue(StegoEngine.containsStego(smuggled))
        val extracted = StegoEngine.extract(smuggled)
        assertEquals(original, extracted)
    }

    @Test
    fun testSelfSmuggleAndExtractWithPassword() {
        val original = "secret message"
        val password = "my_password"
        val smuggled = StegoEngine.smuggle(original, password)
        assertTrue(StegoEngine.containsStego(smuggled))
        val extracted = StegoEngine.extract(smuggled, password)
        println("Original: '$original', Extracted: '$extracted'")
        assertEquals(original, extracted)
    }

    @Test
    fun testDecodeJSNoPassword() {
        // Output from scratch_test.cjs for "hello"
        val jsEncoded = "🕵️\uFEFF\u200B\u200C\u200B\u200C\uFEFF\u200B\u200C\u200C\u200B\u200C\u200B\u200B\u200B\u200B\u200C\u200C\u200B\u200B\u200C\u200B\u200C\u200B\u200C\u200C\u200B\u200C\u200C\u200B\u200B\u200B\u200C\u200C\u200B\u200C\u200C\u200B\u200B\u200B\u200C\u200C\u200B\u200C\u200C\u200C\u200C\uFEFF\u200C\u200B\u200C\u200B\uFEFF"
        
        assertTrue(StegoEngine.containsStego(jsEncoded))
        val extracted = StegoEngine.extract(jsEncoded)
        assertEquals("hello", extracted)
    }

    @Test
    fun testDecodePayloadWithTrimmedTrailingMarker() {
        val original = "message copied through a trimming surface"
        val smuggled = StegoEngine.smuggle(original)
        val trimmedByClipboardSurface = smuggled.trim()

        assertTrue(StegoEngine.containsStego(trimmedByClipboardSurface))
        assertEquals(original, StegoEngine.extract(trimmedByClipboardSurface))
    }
}

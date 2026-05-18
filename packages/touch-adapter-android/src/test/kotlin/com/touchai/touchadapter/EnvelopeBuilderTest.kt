package com.touchai.touchadapter

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class EnvelopeBuilderTest {
    @Test
    fun makeEnvelope_setsSpecVersionAndFields() {
        val env =
            makeEnvelope(
                MakeEnvelopeInput(
                    sessionId = "s1",
                    gesture =
                        GestureToken(
                            kind = "tap",
                            center = Point2D(0.5, 0.5),
                            pointerCount = 1,
                            durationMs = 40.0,
                        ),
                    intent = TouchIntent(intentId = "ack", confidence = 1.0),
                ),
            )
        assertEquals(TOUCHLANG_SPEC_VERSION, env.specVersion)
        assertEquals("s1", env.sessionId)
        assertEquals("tap", env.gesture?.kind)
    }

    @Test
    fun makeEnvelope_omitsEmptyStream() {
        val env = makeEnvelope(MakeEnvelopeInput(sessionId = "s1", stream = emptyList()))
        assertNull(env.stream)
    }

    @Test
    fun nextSessionId_isUnique() {
        val a = nextSessionId("test")
        val b = nextSessionId("test")
        assertNotEquals(a, b)
        assertTrue(a.startsWith("test-"))
    }

    @Test
    fun envelopeToJsonlLine_roundTripsCoreFields() {
        val env = makeEnvelope(MakeEnvelopeInput(sessionId = nextSessionId()))
        val line = envelopeToJsonlLine(env)
        assertTrue(line.endsWith("\n"))
        val json = envelopeToJson(env)
        assertEquals(TOUCHLANG_SPEC_VERSION, json.getString("specVersion"))
        assertEquals(env.sessionId, json.getString("sessionId"))
    }
}

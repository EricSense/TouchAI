package com.touchai.touchadapter

import android.content.Context
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject

private var sessionCounter = 0

/** Build a versioned `TouchEventEnvelope` (mirrors `@touchai/touch-dataset` `makeEnvelope`). */
fun makeEnvelope(input: MakeEnvelopeInput): TouchEventEnvelope {
    return TouchEventEnvelope(
        sessionId = input.sessionId,
        deviceProfile = input.deviceProfile,
        sessionProfile = input.sessionProfile,
        stream = input.stream?.takeIf { it.isNotEmpty() },
        gesture = input.gesture,
        intent = input.intent,
        haptic = input.haptic,
    )
}

fun nextSessionId(prefix: String = "android"): String {
    sessionCounter += 1
    val stamp = System.currentTimeMillis().toString(36)
    return "$prefix-$stamp-$sessionCounter"
}

fun detectDeviceProfile(context: Context): DeviceProfile {
    return DeviceProfile(
        vendor = Build.MANUFACTURER.takeIf { it.isNotBlank() },
        model = Build.MODEL.takeIf { it.isNotBlank() },
        os = "Android ${Build.VERSION.RELEASE}",
        maxPointers = 10,
    )
}

/** One JSON object per line for NDJSON / JSONL pipelines. */
fun envelopeToJsonlLine(envelope: TouchEventEnvelope): String {
    return envelopeToJson(envelope).toString() + "\n"
}

fun envelopeToJson(envelope: TouchEventEnvelope): JSONObject {
    val json = JSONObject()
    json.put("specVersion", envelope.specVersion)
    json.put("sessionId", envelope.sessionId)
    envelope.deviceProfile?.let { json.put("deviceProfile", deviceProfileToJson(it)) }
    envelope.sessionProfile?.let { json.put("sessionProfile", sessionProfileToJson(it)) }
    envelope.stream?.let { stream ->
        json.put("stream", JSONArray().apply { stream.forEach { put(touchSampleToJson(it)) } })
    }
    envelope.gesture?.let { json.put("gesture", gestureTokenToJson(it)) }
    envelope.intent?.let { json.put("intent", touchIntentToJson(it)) }
    envelope.haptic?.let { json.put("haptic", hapticSemanticToJson(it)) }
    return json
}

private fun deviceProfileToJson(profile: DeviceProfile): JSONObject {
    return JSONObject().apply {
        putOptional("vendor", profile.vendor)
        putOptional("model", profile.model)
        putOptional("os", profile.os)
        profile.maxPointers?.let { put("maxPointers", it) }
    }
}

private fun sessionProfileToJson(profile: SessionProfile): JSONObject {
    return JSONObject().apply {
        put("sampleCount", profile.sampleCount)
        put("velocityBaseline", profile.velocityBaseline)
        put("pressureBaseline", profile.pressureBaseline)
    }
}

private fun touchSampleToJson(sample: TouchSample): JSONObject {
    return JSONObject().apply {
        put("tMs", sample.tMs)
        put("phase", sample.phase.name)
        put("pointerId", sample.pointerId)
        put("x", sample.x)
        put("y", sample.y)
        sample.pressure?.let { put("pressure", it) }
    }
}

private fun gestureTokenToJson(token: GestureToken): JSONObject {
    return JSONObject().apply {
        put("kind", token.kind)
        token.center?.let { put("center", pointToJson(it)) }
        token.origin?.let { put("origin", pointToJson(it)) }
        token.vector?.let { put("vector", vectorToJson(it)) }
        token.delta?.let { put("delta", vectorToJson(it)) }
        token.pointerCount?.let { put("pointerCount", it) }
        token.durationMs?.let { put("durationMs", it) }
        token.velocity?.let { put("velocity", it) }
        token.scale?.let { put("scale", it) }
    }
}

private fun touchIntentToJson(intent: TouchIntent): JSONObject {
    return JSONObject().apply {
        put("intentId", intent.intentId)
        put("confidence", intent.confidence)
        intent.slots?.let { slots ->
            put("slots", JSONObject().apply { slots.forEach { (key, value) -> put(key, value) } })
        }
    }
}

private fun hapticSemanticToJson(semantic: HapticSemantic): JSONObject {
    return JSONObject().apply {
        put("kind", semantic.kind)
        semantic.program?.let { put("program", hapticProgramToJson(it)) }
    }
}

private fun hapticProgramToJson(program: HapticProgram): JSONObject {
    return JSONObject().apply {
        put("id", program.id)
        put(
            "pulses",
            JSONArray().apply {
                program.pulses.forEach { pulse ->
                    put(
                        JSONObject().apply {
                            put("delayMs", pulse.delayMs)
                            put("intensity", pulse.intensity)
                            put("sharpness", pulse.sharpness)
                            put("durationMs", pulse.durationMs)
                        },
                    )
                }
            },
        )
    }
}

private fun pointToJson(point: Point2D): JSONObject {
    return JSONObject().apply {
        put("x", point.x)
        put("y", point.y)
    }
}

private fun vectorToJson(vector: Vector2D): JSONObject {
    return JSONObject().apply {
        put("dx", vector.dx)
        put("dy", vector.dy)
    }
}

private fun JSONObject.putOptional(key: String, value: String?) {
    if (value != null) put(key, value)
}

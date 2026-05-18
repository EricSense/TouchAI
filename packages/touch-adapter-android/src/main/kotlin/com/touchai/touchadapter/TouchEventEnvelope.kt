package com.touchai.touchadapter

/** Touch Language spec version (mirrors `@touchai/touch-spec`). */
const val TOUCHLANG_SPEC_VERSION = "0.2.0"

data class DeviceProfile(
    val vendor: String? = null,
    val model: String? = null,
    val os: String? = null,
    val maxPointers: Int? = null,
)

data class SessionProfile(
    val sampleCount: Int,
    val velocityBaseline: Double,
    val pressureBaseline: Double,
)

data class Point2D(val x: Double, val y: Double)

data class Vector2D(val dx: Double, val dy: Double)

/** Mirrors `@touchai/touch-spec` `GestureToken` JSON (discriminated by `kind`). */
data class GestureToken(
    val kind: String,
    val center: Point2D? = null,
    val origin: Point2D? = null,
    val vector: Vector2D? = null,
    val delta: Vector2D? = null,
    val pointerCount: Int? = null,
    val durationMs: Double? = null,
    val velocity: Double? = null,
    val scale: Double? = null,
)

data class TouchIntent(
    val intentId: String,
    val confidence: Double,
    val slots: Map<String, Any>? = null,
)

/** Mirrors `@touchai/touch-spec` `HapticSemantic` JSON (discriminated by `kind`). */
data class HapticSemantic(
    val kind: String,
    val program: HapticProgram? = null,
)

/** Versioned wire envelope for logging, sync, and dataset export. */
data class TouchEventEnvelope(
    val specVersion: String = TOUCHLANG_SPEC_VERSION,
    val sessionId: String,
    val deviceProfile: DeviceProfile? = null,
    val sessionProfile: SessionProfile? = null,
    val stream: List<TouchSample>? = null,
    val gesture: GestureToken? = null,
    val intent: TouchIntent? = null,
    val haptic: HapticSemantic? = null,
)

data class MakeEnvelopeInput(
    val sessionId: String,
    val stream: List<TouchSample>? = null,
    val gesture: GestureToken? = null,
    val intent: TouchIntent? = null,
    val haptic: HapticSemantic? = null,
    val deviceProfile: DeviceProfile? = null,
    val sessionProfile: SessionProfile? = null,
)

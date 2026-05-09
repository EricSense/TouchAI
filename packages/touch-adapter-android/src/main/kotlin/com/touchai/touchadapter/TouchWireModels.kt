package com.touchai.touchadapter

/** Mirrors `@touchai/touch-spec` `TouchSample` JSON. */
data class TouchSample(
    val tMs: Double,
    val phase: TouchPhase,
    val pointerId: Int,
    val x: Double,
    val y: Double,
    val pressure: Double? = null,
)

enum class TouchPhase {
    began,
    moved,
    ended,
    cancelled,
}

data class HapticPulse(
    val delayMs: Double,
    val intensity: Double,
    val sharpness: Double,
    val durationMs: Double,
)

data class HapticProgram(
    val id: String,
    val pulses: List<HapticPulse>,
)

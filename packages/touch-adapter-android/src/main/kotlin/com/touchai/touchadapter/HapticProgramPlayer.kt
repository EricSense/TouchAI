package com.touchai.touchadapter

import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import kotlin.math.max
import kotlin.math.roundToInt

/**
 * Plays [HapticProgram] using amplitude-capable one-shots (API 26+).
 * Delays follow Touch Language: each [HapticPulse.delayMs] is from the previous pulse **start**.
 */
class HapticProgramPlayer(
    private val vibrator: Vibrator,
    private val handler: Handler = Handler(Looper.getMainLooper()),
) {
    fun play(program: HapticProgram, onComplete: Runnable? = null) {
        if (program.pulses.isEmpty()) {
            onComplete?.run()
            return
        }

        val startUptime = android.os.SystemClock.uptimeMillis()
        var cumulativeMs = 0.0
        var lastStartMs = 0.0
        var lastDurationMs = 0.0

        for (pulse in program.pulses) {
            cumulativeMs += pulse.delayMs
            lastStartMs = cumulativeMs
            lastDurationMs = pulse.durationMs

            val atUptime = startUptime + cumulativeMs.roundToLong()
            handler.postAtTime(
                { playOneShot(pulse) },
                atUptime,
            )
        }

        val doneUptime = startUptime + (lastStartMs + lastDurationMs).roundToLong()
        if (onComplete != null) {
            handler.postAtTime(onComplete, doneUptime)
        }
    }

    private fun playOneShot(pulse: HapticPulse) {
        val duration = max(1L, pulse.durationMs.roundToLong())
        val amplitude = (pulse.intensity * 255.0).roundToInt().coerceIn(1, 255)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(duration, amplitude)
            vibrator.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(duration)
        }
    }
}

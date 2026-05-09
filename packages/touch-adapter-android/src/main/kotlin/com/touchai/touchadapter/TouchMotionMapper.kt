package com.touchai.touchadapter

import android.view.MotionEvent
import android.view.View
import kotlin.math.max

/**
 * Maps [MotionEvent] samples into normalized [TouchSample] values (0–1 in the view).
 *
 * @param sessionStartUptimeMs [android.os.SystemClock.uptimeMillis] captured when the touch session began.
 */
object TouchMotionMapper {
    fun sample(
        event: MotionEvent,
        pointerIndex: Int,
        view: View,
        sessionStartUptimeMs: Long,
    ): TouchSample {
        val w = max(view.width, 1).toFloat()
        val h = max(view.height, 1).toFloat()
        val x = (event.getX(pointerIndex) / w).toDouble().coerceIn(0.0, 1.0)
        val y = (event.getY(pointerIndex) / h).toDouble().coerceIn(0.0, 1.0)

        val phase = when (event.actionMasked) {
            MotionEvent.ACTION_DOWN,
            MotionEvent.ACTION_POINTER_DOWN,
            -> if (pointerIndex == event.actionIndex) TouchPhase.began else TouchPhase.moved

            MotionEvent.ACTION_MOVE -> TouchPhase.moved
            MotionEvent.ACTION_UP,
            MotionEvent.ACTION_POINTER_UP,
            -> if (pointerIndex == event.actionIndex) TouchPhase.ended else TouchPhase.moved

            MotionEvent.ACTION_CANCEL -> TouchPhase.cancelled
            else -> TouchPhase.moved
        }

        val tMs = (event.eventTime - sessionStartUptimeMs).toDouble().coerceAtLeast(0.0)
        val pointerId = event.getPointerId(pointerIndex)

        val rawPressure = event.getPressure(pointerIndex).toDouble()
        val pressure = if (rawPressure > 0.01) rawPressure.coerceIn(0.0, 1.0) else null

        return TouchSample(
            tMs = tMs,
            phase = phase,
            pointerId = pointerId,
            x = x,
            y = y,
            pressure = pressure,
        )
    }
}

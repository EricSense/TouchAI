import Foundation

/// Mirrors `@touchai/touch-spec` `TouchSample` JSON for device ↔ runtime interchange.
public struct TouchSample: Codable, Equatable, Sendable {
    public var tMs: Double
    public var phase: TouchPhase
    public var pointerId: Int
    public var x: Double
    public var y: Double
    public var pressure: Double?

    public init(tMs: Double, phase: TouchPhase, pointerId: Int, x: Double, y: Double, pressure: Double? = nil) {
        self.tMs = tMs
        self.phase = phase
        self.pointerId = pointerId
        self.x = x
        self.y = y
        self.pressure = pressure
    }
}

public enum TouchPhase: String, Codable, Sendable {
    case began
    case moved
    case ended
    case cancelled
}

public struct HapticPulse: Codable, Equatable, Sendable {
    public var delayMs: Double
    public var intensity: Double
    public var sharpness: Double
    public var durationMs: Double

    public init(delayMs: Double, intensity: Double, sharpness: Double, durationMs: Double) {
        self.delayMs = delayMs
        self.intensity = intensity
        self.sharpness = sharpness
        self.durationMs = durationMs
    }
}

public struct HapticProgram: Codable, Equatable, Sendable {
    public var id: String
    public var pulses: [HapticPulse]

    public init(id: String, pulses: [HapticPulse]) {
        self.id = id
        self.pulses = pulses
    }
}

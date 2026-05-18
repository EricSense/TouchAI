import Foundation

public let touchLangSpecVersion = "0.2.0"

public struct DeviceProfile: Codable, Equatable, Sendable {
    public var vendor: String?
    public var model: String?
    public var os: String?
    public var maxPointers: Int?

    public init(vendor: String? = nil, model: String? = nil, os: String? = nil, maxPointers: Int? = nil) {
        self.vendor = vendor
        self.model = model
        self.os = os
        self.maxPointers = maxPointers
    }
}

public struct SessionProfile: Codable, Equatable, Sendable {
    public var sampleCount: Int
    public var velocityBaseline: Double
    public var pressureBaseline: Double

    public init(sampleCount: Int, velocityBaseline: Double, pressureBaseline: Double) {
        self.sampleCount = sampleCount
        self.velocityBaseline = velocityBaseline
        self.pressureBaseline = pressureBaseline
    }
}

public struct Point2D: Codable, Equatable, Sendable {
    public var x: Double
    public var y: Double

    public init(x: Double, y: Double) {
        self.x = x
        self.y = y
    }
}

public struct Vector2D: Codable, Equatable, Sendable {
    public var dx: Double
    public var dy: Double

    public init(dx: Double, dy: Double) {
        self.dx = dx
        self.dy = dy
    }
}

/// Mirrors `@touchai/touch-spec` `GestureToken` JSON (discriminated by `kind`).
public struct GestureToken: Codable, Equatable, Sendable {
    public var kind: String
    public var center: Point2D?
    public var origin: Point2D?
    public var vector: Vector2D?
    public var delta: Vector2D?
    public var pointerCount: Int?
    public var durationMs: Double?
    public var velocity: Double?
    public var scale: Double?

    public init(
        kind: String,
        center: Point2D? = nil,
        origin: Point2D? = nil,
        vector: Vector2D? = nil,
        delta: Vector2D? = nil,
        pointerCount: Int? = nil,
        durationMs: Double? = nil,
        velocity: Double? = nil,
        scale: Double? = nil
    ) {
        self.kind = kind
        self.center = center
        self.origin = origin
        self.vector = vector
        self.delta = delta
        self.pointerCount = pointerCount
        self.durationMs = durationMs
        self.velocity = velocity
        self.scale = scale
    }
}

public struct TouchIntent: Codable, Equatable, Sendable {
    public var intentId: String
    public var confidence: Double
    public var slots: [String: JSONValue]?

    public init(intentId: String, confidence: Double, slots: [String: JSONValue]? = nil) {
        self.intentId = intentId
        self.confidence = confidence
        self.slots = slots
    }
}

/// Mirrors `@touchai/touch-spec` `HapticSemantic` JSON (discriminated by `kind`).
public struct HapticSemantic: Codable, Equatable, Sendable {
    public var kind: String
    public var program: HapticProgram?

    public init(kind: String, program: HapticProgram? = nil) {
        self.kind = kind
        self.program = program
    }
}

/// Versioned wire envelope for logging, sync, and dataset export.
public struct TouchEventEnvelope: Codable, Equatable, Sendable {
    public var specVersion: String
    public var sessionId: String
    public var deviceProfile: DeviceProfile?
    public var sessionProfile: SessionProfile?
    public var stream: [TouchSample]?
    public var gesture: GestureToken?
    public var intent: TouchIntent?
    public var haptic: HapticSemantic?

    public init(
        specVersion: String = touchLangSpecVersion,
        sessionId: String,
        deviceProfile: DeviceProfile? = nil,
        sessionProfile: SessionProfile? = nil,
        stream: [TouchSample]? = nil,
        gesture: GestureToken? = nil,
        intent: TouchIntent? = nil,
        haptic: HapticSemantic? = nil
    ) {
        self.specVersion = specVersion
        self.sessionId = sessionId
        self.deviceProfile = deviceProfile
        self.sessionProfile = sessionProfile
        self.stream = stream
        self.gesture = gesture
        self.intent = intent
        self.haptic = haptic
    }
}

/// JSON-serializable slot values for `TouchIntent.slots`.
public enum JSONValue: Codable, Equatable, Sendable {
    case string(String)
    case number(Double)
    case bool(Bool)
    case null

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Double.self) {
            self = .number(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unsupported JSONValue")
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value): try container.encode(value)
        case .number(let value): try container.encode(value)
        case .bool(let value): try container.encode(value)
        case .null: try container.encodeNil()
        }
    }
}

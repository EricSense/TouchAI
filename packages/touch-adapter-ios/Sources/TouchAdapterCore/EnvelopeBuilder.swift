import Foundation

public struct MakeEnvelopeInput: Sendable {
    public var sessionId: String
    public var stream: [TouchSample]?
    public var gesture: GestureToken?
    public var intent: TouchIntent?
    public var haptic: HapticSemantic?
    public var deviceProfile: DeviceProfile?
    public var sessionProfile: SessionProfile?

    public init(
        sessionId: String,
        stream: [TouchSample]? = nil,
        gesture: GestureToken? = nil,
        intent: TouchIntent? = nil,
        haptic: HapticSemantic? = nil,
        deviceProfile: DeviceProfile? = nil,
        sessionProfile: SessionProfile? = nil
    ) {
        self.sessionId = sessionId
        self.stream = stream
        self.gesture = gesture
        self.intent = intent
        self.haptic = haptic
        self.deviceProfile = deviceProfile
        self.sessionProfile = sessionProfile
    }
}

private var sessionCounter = 0
private let sessionCounterLock = NSLock()

/// Build a versioned `TouchEventEnvelope` (mirrors `@touchai/touch-dataset` `makeEnvelope`).
public func makeEnvelope(_ input: MakeEnvelopeInput) -> TouchEventEnvelope {
    var envelope = TouchEventEnvelope(sessionId: input.sessionId)
    if let deviceProfile = input.deviceProfile { envelope.deviceProfile = deviceProfile }
    if let sessionProfile = input.sessionProfile { envelope.sessionProfile = sessionProfile }
    if let stream = input.stream, !stream.isEmpty { envelope.stream = stream }
    if let gesture = input.gesture { envelope.gesture = gesture }
    if let intent = input.intent { envelope.intent = intent }
    if let haptic = input.haptic { envelope.haptic = haptic }
    return envelope
}

public func nextSessionId(prefix: String = "ios") -> String {
    sessionCounterLock.lock()
    defer { sessionCounterLock.unlock() }
    sessionCounter += 1
    let stamp = String(Int(Date().timeIntervalSince1970 * 1000), radix: 36)
    return "\(prefix)-\(stamp)-\(sessionCounter)"
}

private let envelopeEncoder: JSONEncoder = {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]
    return encoder
}()

/// One JSON object per line for NDJSON / JSONL pipelines.
public func envelopeToJsonlLine(_ envelope: TouchEventEnvelope) throws -> String {
    let data = try envelopeEncoder.encode(envelope)
    guard let json = String(data: data, encoding: .utf8) else {
        throw EnvelopeEncodingError.invalidUTF8
    }
    return json + "\n"
}

public enum EnvelopeEncodingError: Error {
    case invalidUTF8
}

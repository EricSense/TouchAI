import XCTest
@testable import TouchAdapterCore

final class EnvelopeBuilderTests: XCTestCase {
    func testMakeEnvelopeSetsSpecVersionAndFields() {
        let env = makeEnvelope(
            MakeEnvelopeInput(
                sessionId: "s1",
                gesture: GestureToken(
                    kind: "tap",
                    center: Point2D(x: 0.5, y: 0.5),
                    pointerCount: 1,
                    durationMs: 40
                ),
                intent: TouchIntent(intentId: "ack", confidence: 1)
            )
        )
        XCTAssertEqual(env.specVersion, touchLangSpecVersion)
        XCTAssertEqual(env.sessionId, "s1")
        XCTAssertEqual(env.gesture?.kind, "tap")
    }

    func testMakeEnvelopeOmitsEmptyStream() {
        let env = makeEnvelope(MakeEnvelopeInput(sessionId: "s1", stream: []))
        XCTAssertNil(env.stream)
    }

    func testNextSessionIdIsUnique() {
        let a = nextSessionId(prefix: "test")
        let b = nextSessionId(prefix: "test")
        XCTAssertNotEqual(a, b)
        XCTAssertTrue(a.hasPrefix("test-"))
    }

    func testEnvelopeToJsonlLineRoundTrip() throws {
        let env = makeEnvelope(MakeEnvelopeInput(sessionId: nextSessionId()))
        let line = try envelopeToJsonlLine(env)
        XCTAssertTrue(line.hasSuffix("\n"))
        let data = line.trimmingCharacters(in: .newlines).data(using: .utf8)!
        let decoded = try JSONDecoder().decode(TouchEventEnvelope.self, from: data)
        XCTAssertEqual(decoded.specVersion, touchLangSpecVersion)
        XCTAssertEqual(decoded.sessionId, env.sessionId)
    }
}

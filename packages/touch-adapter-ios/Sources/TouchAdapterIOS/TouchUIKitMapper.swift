import UIKit
import TouchAdapterCore

/// Maps `UITouch` streams into normalized `TouchSample` values (0–1 in the given view).
public enum TouchUIKitMapper {
    /// - Parameters:
    ///   - sessionStart: Anchor for `tMs` (wall-clock).
    ///   - pointerId: Stable id for this path (e.g. touch hash or index).
    public static func sample(
        from touch: UITouch,
        in view: UIView,
        sessionStart: Date,
        pointerId: Int
    ) -> TouchSample {
        let loc = touch.location(in: view)
        let w = max(view.bounds.width, 1)
        let h = max(view.bounds.height, 1)
        let x = Double(loc.x / w).clamped(to: 0...1)
        let y = Double(loc.y / h).clamped(to: 0...1)

        let phase: TouchPhase
        switch touch.phase {
        case .began: phase = .began
        case .moved, .stationary: phase = .moved
        case .ended: phase = .ended
        case .cancelled: phase = .cancelled
        case .regionEntered, .regionMoved, .regionExited: phase = .moved
        @unknown default: phase = .moved
        }

        let tMs = Date().timeIntervalSince(sessionStart) * 1000
        var pressure: Double?
        if touch.force > 0, touch.maximumPossibleForce > 0 {
            pressure = Double(touch.force / touch.maximumPossibleForce).clamped(to: 0...1)
        }

        return TouchSample(tMs: max(0, tMs), phase: phase, pointerId: pointerId, x: x, y: y, pressure: pressure)
    }
}

private extension Comparable {
    func clamped(to range: ClosedRange<Self>) -> Self {
        min(max(self, range.lowerBound), range.upperBound)
    }
}

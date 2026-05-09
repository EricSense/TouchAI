import UIKit

/// Plays neutral `HapticProgram` pulses using `UIImpactFeedbackGenerator` (mapped from intensity/sharpness).
public final class HapticProgramPlayer {
    public init() {}

    /// Schedules pulses on the main queue. Each `delayMs` is relative to the **start** of the previous pulse (or program start for the first).
    public func play(program: HapticProgram, completion: (() -> Void)? = nil) {
        DispatchQueue.main.async { [weak self] in
            guard let self else {
                completion?()
                return
            }
            guard !program.pulses.isEmpty else {
                completion?()
                return
            }

            let start = DispatchTime.now()
            var cumulativeMs: Double = 0
            var lastStartMs: Double = 0
            var lastDurationMs: Double = 0

            for pulse in program.pulses {
                cumulativeMs += pulse.delayMs
                lastStartMs = cumulativeMs
                lastDurationMs = pulse.durationMs
                let deadline = start + .milliseconds(Int(cumulativeMs.rounded()))
                DispatchQueue.main.asyncAfter(deadline: deadline) {
                    self.playPulse(pulse)
                }
            }

            if let completion {
                let doneMs = lastStartMs + lastDurationMs
                let done = start + .milliseconds(Int(doneMs.rounded()))
                DispatchQueue.main.asyncAfter(deadline: done, execute: completion)
            }
        }
    }

    private func playPulse(_ pulse: HapticPulse) {
        let style: UIImpactFeedbackGenerator.FeedbackStyle
        if pulse.sharpness < 0.34 {
            style = .light
        } else if pulse.sharpness < 0.67 {
            style = .medium
        } else {
            style = .heavy
        }
        let gen = UIImpactFeedbackGenerator(style: style)
        gen.prepare()
        if #available(iOS 17.0, *) {
            gen.impactOccurred(intensity: CGFloat(pulse.intensity.clamped(to: 0...1)))
        } else {
            gen.impactOccurred()
        }
    }
}

private extension Double {
    func clamped(to range: ClosedRange<Double>) -> Double {
        min(max(self, range.lowerBound), range.upperBound)
    }
}

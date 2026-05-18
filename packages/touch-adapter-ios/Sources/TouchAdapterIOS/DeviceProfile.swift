import UIKit
import TouchAdapterCore

public func detectDeviceProfile() -> DeviceProfile {
    let device = UIDevice.current
    return DeviceProfile(
        vendor: "Apple",
        model: device.model,
        os: "\(device.systemName) \(device.systemVersion)",
        maxPointers: 10
    )
}

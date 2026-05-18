// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TouchAdapterIOS",
    platforms: [
        .iOS(.v15),
    ],
    products: [
        .library(name: "TouchAdapterIOS", targets: ["TouchAdapterIOS"]),
        .library(name: "TouchAdapterCore", targets: ["TouchAdapterCore"]),
    ],
    targets: [
        .target(
            name: "TouchAdapterCore",
            path: "Sources/TouchAdapterCore"
        ),
        .target(
            name: "TouchAdapterIOS",
            dependencies: ["TouchAdapterCore"],
            path: "Sources/TouchAdapterIOS"
        ),
        .testTarget(
            name: "TouchAdapterCoreTests",
            dependencies: ["TouchAdapterCore"],
            path: "Tests/TouchAdapterCoreTests"
        ),
    ]
)

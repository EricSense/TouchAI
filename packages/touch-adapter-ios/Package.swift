// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TouchAdapterIOS",
    platforms: [
        .iOS(.v15),
    ],
    products: [
        .library(name: "TouchAdapterIOS", targets: ["TouchAdapterIOS"]),
    ],
    targets: [
        .target(
            name: "TouchAdapterIOS",
            path: "Sources/TouchAdapterIOS"
        ),
    ]
)

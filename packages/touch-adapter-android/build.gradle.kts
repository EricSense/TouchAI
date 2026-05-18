plugins {
    id("com.android.library") version "8.7.2"
    id("org.jetbrains.kotlin.android") version "2.0.21"
}

android {
    namespace = "com.touchai.touchadapter"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        consumerProguardFiles("consumer-rules.pro")
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}

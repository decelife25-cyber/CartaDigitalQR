plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val supabaseUrl = providers.environmentVariable("VITE_SUPABASE_URL").orElse("").get()
// Keep the same Supabase client key used by the last confirmed functional Android base.
val supabasePublishableKey = providers.environmentVariable("VITE_SUPABASE_PUBLISHABLE_KEY")
    .orElse("sb_publishable_pxNsIH4abNe9YNdAkoqlkA_uBMuhS8i")
    .get()
val releaseKeystoreFile = System.getenv("KEYSTORE_FILE")
val releaseStorePassword = System.getenv("KEYSTORE_PASSWORD")
val releaseKeyAlias = System.getenv("KEY_ALIAS")
val releaseKeyPassword = System.getenv("KEY_PASSWORD")
val hasReleaseSigning = listOf(releaseKeystoreFile, releaseStorePassword, releaseKeyAlias, releaseKeyPassword).all { !it.isNullOrBlank() }
fun quoteBuildConfig(value: String) = "\"${value.replace("\\", "\\\\").replace("\"", "\\\"")}\""

val appVersionName = "1.0.103"
val appVersionParts = appVersionName.split(".").map { it.toInt() }
require(appVersionParts.size == 3) { "appVersionName must use MAJOR.MINOR.PATCH" }
val appVersionCode = appVersionParts[0] * 1_000_000 + appVersionParts[1] * 1_000 + appVersionParts[2]
val githubBuildNumber = System.getenv("GITHUB_RUN_NUMBER") ?: "local"

android {
    namespace = "com.decelife.cartadigitalqr"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.decelife.cartadigitalqr"
        minSdk = 24
        targetSdk = 34
        versionCode = appVersionCode
        versionName = appVersionName
        buildConfigField("String", "SUPABASE_URL", quoteBuildConfig(supabaseUrl))
        buildConfigField("String", "SUPABASE_ANON_KEY", quoteBuildConfig(supabasePublishableKey))
        buildConfigField("String", "GITHUB_BUILD_NUMBER", quoteBuildConfig(githubBuildNumber))
        vectorDrawables { useSupportLibrary = true }
    }
    signingConfigs {
        if (hasReleaseSigning) create("release") {
            storeFile = file(releaseKeystoreFile!!)
            storePassword = releaseStorePassword
            keyAlias = releaseKeyAlias
            keyPassword = releaseKeyPassword
        }
    }
    buildTypes {
        release {
            if (hasReleaseSigning) signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true; buildConfig = true }
    composeOptions { kotlinCompilerExtensionVersion = "1.5.10" }
    sourceSets["main"].assets.srcDir(rootProject.projectDir.parentFile.resolve("public/icons/alergenos"))
    packaging { resources { excludes += "/META-INF/{AL2.0,LGPL2.1}" } }
}

if (gradle.startParameter.taskNames.any { it.contains("Release", ignoreCase = true) } && !hasReleaseSigning) {
    error("Release build requires KEYSTORE_FILE, KEYSTORE_PASSWORD, KEY_ALIAS and KEY_PASSWORD.")
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("io.coil-kt:coil-compose:2.6.0")
    implementation("io.coil-kt:coil-svg:2.6.0")
}

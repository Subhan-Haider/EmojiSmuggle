# Emoji Smuggle - Portable Build Script
$ErrorActionPreference = "Continue"

# 1. Setup Portable Java 17
$jdkPath = "c:\Users\setup\Videos\WEBSITES FOR CHANGES\emog\temp_jdk\jdk-17.0.19+10"
$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;" + $env:PATH

Write-Host "✅ Using Portable Java: $($jdkPath)" -ForegroundColor Green
java -version

# 2. Check for Android SDK
if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
    Write-Host "⚠️ Warning: ANDROID_HOME is not set. Looking for SDK..." -ForegroundColor Yellow
}

# 3. Enter Android Directory
Set-Location "android"

# 4. Attempt to Build
Write-Host "🏗️  Starting Gradle Build (assembleDebug)..." -ForegroundColor Cyan

if (Test-Path "gradlew.bat") {
    .\gradlew.bat assembleDebug
} else {
    Write-Host "❌ Error: gradlew.bat not found." -ForegroundColor Red
    return
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 SUCCESS! Your APK is ready." -ForegroundColor Green
} else {
    Write-Host "❌ Build Failed." -ForegroundColor Red
}
cd ..

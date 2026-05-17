# Emoji Smuggle - Release Build Script
$jdkPath = "c:\Users\setup\Videos\WEBSITES FOR CHANGES\emog\temp_jdk\jdk-17.0.19+10"
$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;" + $env:PATH
cd android
Write-Host "Starting Release Build..."
.\gradlew.bat assembleRelease
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build Successful!"
} else {
    Write-Host "Build Failed."
}
cd ..

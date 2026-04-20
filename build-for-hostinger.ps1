Write-Host "Starting production build and packaging for Hostinger..." -ForegroundColor Cyan

$deployDir = "coptogram-deploy"
$zipFile = "hostinger-deploy.zip"

# Ensure clean state
if (Test-Path $deployDir) {
    Remove-Item -Path $deployDir -Recurse -Force
}
if (Test-Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}

# Run Next.js build
Write-Host "Running 'npm run build'..." -ForegroundColor Yellow
# Run npm via process to ensure it waits and captures exit code correctly
$npmProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run build" -Wait -NoNewWindow -PassThru
if ($npmProcess.ExitCode -ne 0) {
    Write-Host "Build failed! Please fix the errors before packaging." -ForegroundColor Red
    exit 1
}

# Create deploy directory structure
Write-Host "Preparing deployment folder..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $deployDir | Out-Null

$standalonePath = Join-Path ".next" "standalone"
$staticSource = Join-Path ".next" "static"
$deployNextDir = Join-Path $deployDir ".next"
$deployStaticDest = Join-Path $deployNextDir "static"
$deployPublicDest = Join-Path $deployDir "public"

# Copy standalone output
Write-Host "Copying standalone Next.js server..." -ForegroundColor Yellow
Copy-Item -Path "$standalonePath\*" -Destination $deployDir -Recurse -Force

# Next.js standalone doesn't include the static or public folders, we must copy them
Write-Host "Copying static assets (.next/static)..." -ForegroundColor Yellow
if (!(Test-Path $deployNextDir)) {
    New-Item -ItemType Directory -Path $deployNextDir | Out-Null
}
Copy-Item -Path $staticSource -Destination $deployNextDir -Recurse -Force

if (Test-Path "public") {
    Write-Host "Copying public folder..." -ForegroundColor Yellow
    Copy-Item -Path "public" -Destination $deployPublicDest -Recurse -Force
}

# Compress everything into a ZIP file without including a root directory
Write-Host "Compressing to $zipFile..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem

$absoluteDeployDir = (Resolve-Path $deployDir).Path
$absoluteZipFile = Join-Path (Get-Location).Path $zipFile

[System.IO.Compression.ZipFile]::CreateFromDirectory($absoluteDeployDir, $absoluteZipFile)

Write-Host "Done! The application is packaged successfully." -ForegroundColor Green
Write-Host "-> Upload '$zipFile' to your Hostinger File Manager" -ForegroundColor Green
Write-Host "-> Extract the file and follow the directions to point the Node.js app to server.js" -ForegroundColor Green

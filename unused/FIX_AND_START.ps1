# Fix missing modules and start the project
# Run this in PowerShell AS ADMINISTRATOR

Write-Host "=== Fixing HeavenMatch Contact Page ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
Set-Location "C:\Users\System6\Desktop\contact"

# Step 1: Remove corrupted node_modules
Write-Host "Step 1: Removing corrupted node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "✓ Removed node_modules" -ForegroundColor Green
}

# Step 2: Remove package-lock.json
Write-Host "Step 2: Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "✓ Removed package-lock.json" -ForegroundColor Green
}

Write-Host ""

# Step 3: Clean npm cache
Write-Host "Step 3: Cleaning npm cache..." -ForegroundColor Yellow
npm.cmd cache clean --force
Write-Host "✓ Cache cleaned" -ForegroundColor Green
Write-Host ""

# Step 4: Install dependencies
Write-Host "Step 4: Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
npm.cmd install
Write-Host ""

# Step 5: Start the server
Write-Host "Step 5: Starting development server..." -ForegroundColor Yellow
Write-Host "The app will open at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm.cmd start


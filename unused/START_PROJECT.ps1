# HeavenMatch Contact Page - Start Script
# Run this script in PowerShell

Write-Host "=== HeavenMatch Contact Page ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\System6\Desktop\contact"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (Test-Path "node_modules\react") {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm.cmd install
    Write-Host ""
}

Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "The app will open at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm.cmd start


# Script to start the project with admin privileges
# Right-click this file and select "Run with PowerShell"

Write-Host "=== Starting HeavenMatch Contact Page ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script requires Administrator privileges." -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Cyan
    Write-Host "1. Right-click PowerShell in Start Menu" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Navigate to: cd C:\Users\System6\Desktop\contact" -ForegroundColor White
    Write-Host "4. Run: npm.cmd start" -ForegroundColor White
    pause
    exit
}

# Navigate to project
Set-Location "C:\Users\System6\Desktop\contact"

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host ""

# Start the server
npm.cmd start


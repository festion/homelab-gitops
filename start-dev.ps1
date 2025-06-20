# GitOps Auditor Development Startup Script
# Coordinates API and Dashboard servers properly

Write-Host "🚀 Starting GitOps Auditor Development Environment..." -ForegroundColor Cyan

# Ensure we're in the right directory
Set-Location "C:\GIT\homelab-gitops-auditor"

# Start API server
Write-Host "📡 Starting API server on port 3070..." -ForegroundColor Green
Start-Process PowerShell -ArgumentList "-Command", "cd 'C:\GIT\homelab-gitops-auditor'; node api/server.js" -WindowStyle Minimized

# Wait a moment for API to start
Start-Sleep -Seconds 3

# Start Dashboard dev server  
Write-Host "🎨 Starting Dashboard dev server on port 5173..." -ForegroundColor Green
Set-Location "dashboard"
Start-Process PowerShell -ArgumentList "-Command", "cd 'C:\GIT\homelab-gitops-auditor\dashboard'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host "📊 Dashboard: http://localhost:5173" -ForegroundColor Yellow
Write-Host "📡 API: http://localhost:3070" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to stop servers..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Kill the servers
Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.StartTime -gt (Get-Date).AddMinutes(-5)} | Stop-Process -Force
Write-Host "🛑 Servers stopped." -ForegroundColor Red

# start-all.ps1 - Launch Complete SPECTER Full-Stack Command Center
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       🚀 LAUNCHING FULL SPECTER STACK & COMMAND UI        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Mock Exchange Compliance Portal on Port 3000
Write-Host "[1/4] Starting Mock Exchange Compliance Portal (Port 3000)..." -ForegroundColor Yellow
$portalProcess = Start-Process -FilePath "node" -ArgumentList "crates/specter-agent/portal_server.js" -PassThru

# 2. Start Agent Browser Actor Bridge on Port 3001
Write-Host "[2/4] Starting Playwright Browser Actor Bridge (Port 3001)..." -ForegroundColor Yellow
$agentProcess = Start-Process -FilePath "node" -ArgumentList "crates/specter-agent/browser_actor.js" -PassThru

# 3. Start Rust Axum Engine on Port 8080
Write-Host "[3/4] Starting SPECTER Rust Axum Engine (Port 8080)..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath "cargo" -ArgumentList "run", "-p", "specter-server" -PassThru

# 4. Start React Frontend on Port 5173
Write-Host "[4/4] Starting Vite React Frontend (Port 5173)..." -ForegroundColor Cyan
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev", "--prefix", "frontend" -PassThru

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "       🎉 ALL SPECTER SERVICES ARE ONLINE                 " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   • Web Command Center:  http://localhost:5173" -ForegroundColor White
Write-Host "   • Axum REST Engine:    http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "   • Engine Health Check: http://localhost:8080/api/v1/health" -ForegroundColor White
Write-Host "   • Exchange Portal:     http://localhost:3000/exchange/compliance-portal" -ForegroundColor White
Write-Host "   • Browser Actor Bridge:http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to shut down all processes." -ForegroundColor Gray

try {
    Wait-Process -Id $serverProcess.Id, $portalProcess.Id, $agentProcess.Id, $frontendProcess.Id
} finally {
    Write-Host "Shutting down all SPECTER processes..." -ForegroundColor Red
    Stop-Process -Id $portalProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $agentProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
}

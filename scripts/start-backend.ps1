# start-backend.ps1 - Launch SPECTER Backend Services
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       🚀 LAUNCHING SPECTER BACKEND CORE SERVICES         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Exchange Compliance Portal on Port 3000
Write-Host "[1/2] Starting Mock Exchange Compliance Portal on port 3000..." -ForegroundColor Yellow
$portalProcess = Start-Process -FilePath "node" -ArgumentList "crates/specter-agent/portal_server.js" -PassThru

# 2. Start Rust Axum API Engine on Port 8080
Write-Host "[2/2] Starting SPECTER Rust Axum Engine on port 8080..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath "cargo" -ArgumentList "run", "-p", "specter-server" -PassThru

Write-Host ""
Write-Host "✅ Backend Services Running:" -ForegroundColor Green
Write-Host "   • Axum REST API:       http://localhost:8080/api/v1" -ForegroundColor White
Write-Host "   • Health Check:        http://localhost:8080/api/v1/health" -ForegroundColor White
Write-Host "   • Compliance Portal:   http://localhost:3000/exchange/compliance-portal" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both processes." -ForegroundColor Gray

try {
    Wait-Process -Id $serverProcess.Id, $portalProcess.Id
} finally {
    Write-Host "Shutting down backend processes..." -ForegroundColor Red
    Stop-Process -Id $portalProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
}

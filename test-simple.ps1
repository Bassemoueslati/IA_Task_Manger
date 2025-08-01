# Script de test simple
Write-Host "=== Test de l'installation Task Manager ===" -ForegroundColor Green
Write-Host ""

# Test Node.js
Write-Host "1. Test Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   OK - Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - Node.js non installe" -ForegroundColor Red
}

# Test NPM
Write-Host "2. Test NPM..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "   OK - NPM: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - NPM non disponible" -ForegroundColor Red
}

# Test MongoDB
Write-Host "3. Test MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "   OK - MongoDB accessible" -ForegroundColor Green
    } else {
        Write-Host "   ATTENTION - MongoDB non accessible" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ATTENTION - Impossible de tester MongoDB" -ForegroundColor Yellow
}

# Test Ollama
Write-Host "4. Test Ollama..." -ForegroundColor Yellow
try {
    $ollamaResponse = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 3
    Write-Host "   OK - Ollama fonctionne" -ForegroundColor Green
} catch {
    Write-Host "   ATTENTION - Ollama non disponible" -ForegroundColor Yellow
}

# Test dependances backend
Write-Host "5. Test dependances backend..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "   OK - Dependances backend installees" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - Dependances backend manquantes" -ForegroundColor Red
}

# Test dependances frontend
Write-Host "6. Test dependances frontend..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    Write-Host "   OK - Dependances frontend installees" -ForegroundColor Green
} else {
    Write-Host "   ERREUR - Dependances frontend manquantes" -ForegroundColor Red
}

# Test configuration
Write-Host "7. Test configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "   OK - Fichier .env present" -ForegroundColor Green
} else {
    Write-Host "   ATTENTION - Fichier .env manquant" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test termine ===" -ForegroundColor Green
Write-Host "Pour demarrer l'application: .\start.ps1" -ForegroundColor Cyan
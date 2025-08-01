# Script de test pour verifier l'installation complete
Write-Host "Test de l'installation Task Manager..." -ForegroundColor Green
Write-Host ""

$allGood = $true

# Test 1: Node.js
Write-Host "1. Test Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   OK Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ERREUR Node.js non installe" -ForegroundColor Red
    $allGood = $false
}

# Test 2: NPM
Write-Host "2️⃣ Test NPM..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "   ✅ NPM: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ NPM non disponible" -ForegroundColor Red
    $allGood = $false
}

# Test 3: MongoDB
Write-Host "3️⃣ Test MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "   ✅ MongoDB accessible sur port 27017" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MongoDB non accessible (peut être normal si pas encore démarré)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Impossible de tester MongoDB" -ForegroundColor Yellow
}

# Test 4: Ollama
Write-Host "4️⃣ Test Ollama..." -ForegroundColor Yellow
try {
    $ollamaResponse = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 3
    Write-Host "   ✅ Ollama fonctionne" -ForegroundColor Green
    
    # Vérifier les modèles installés
    if ($ollamaResponse.models -and $ollamaResponse.models.Count -gt 0) {
        Write-Host "   📦 Modèles installés:" -ForegroundColor Cyan
        foreach ($model in $ollamaResponse.models) {
            Write-Host "      • $($model.name)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ⚠️  Aucun modèle installé" -ForegroundColor Yellow
        Write-Host "      💡 Exécutez: ollama pull llama3.2:3b" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Ollama non disponible" -ForegroundColor Yellow
    Write-Host "      💡 Installez avec: .\install-ollama.ps1" -ForegroundColor Yellow
}

# Test 5: Dépendances Backend
Write-Host "5️⃣ Test dépendances backend..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "   ✅ Dépendances backend installées" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dépendances backend manquantes" -ForegroundColor Red
    Write-Host "      💡 Exécutez: cd backend && npm install" -ForegroundColor Yellow
    $allGood = $false
}

# Test 6: Dépendances Frontend
Write-Host "6️⃣ Test dépendances frontend..." -ForegroundColor Yellow
if (Test-Path "frontend\node_modules") {
    Write-Host "   ✅ Dépendances frontend installées" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dépendances frontend manquantes" -ForegroundColor Red
    Write-Host "      💡 Exécutez: cd frontend && npm install" -ForegroundColor Yellow
    $allGood = $false
}

# Test 7: Configuration
Write-Host "7️⃣ Test configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "   ✅ Fichier .env présent" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Fichier .env manquant" -ForegroundColor Yellow
    Write-Host "      💡 Copiez backend\.env.example vers backend\.env" -ForegroundColor Yellow
}

# Test 8: Structure des fichiers
Write-Host "8️⃣ Test structure des fichiers..." -ForegroundColor Yellow
$requiredFiles = @(
    "backend\server.js",
    "backend\package.json",
    "frontend\package.json",
    "frontend\src\App.js",
    "README.md"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "   ✅ Tous les fichiers requis sont présents" -ForegroundColor Green
} else {
    Write-Host "   ❌ Fichiers manquants:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "      • $file" -ForegroundColor Red
    }
    $allGood = $false
}

# Résumé
Write-Host ""
Write-Host "📊 Résumé du test:" -ForegroundColor White
if ($allGood) {
    Write-Host "🎉 Tous les tests critiques sont passés!" -ForegroundColor Green
    Write-Host "🚀 Vous pouvez démarrer l'application avec: .\start.ps1" -ForegroundColor Green
} else {
    Write-Host "⚠️  Certains problèmes ont été détectés" -ForegroundColor Yellow
    Write-Host "🔧 Corrigez les erreurs ci-dessus avant de démarrer" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📖 Pour plus d'aide, consultez le README.md" -ForegroundColor Cyan
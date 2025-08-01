# Script de démarrage complet pour l'application Task Manager
Write-Host "🚀 Démarrage de l'application Task Manager..." -ForegroundColor Green

# Vérifier si Node.js est installé
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "💡 Téléchargez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green

# Vérifier si MongoDB est accessible
Write-Host "🔍 Vérification de MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongoTest.TcpTestSucceeded) {
        Write-Host "✅ MongoDB est accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB n'est pas accessible sur le port 27017" -ForegroundColor Yellow
        Write-Host "💡 Assurez-vous que MongoDB est démarré ou utilisez Docker:" -ForegroundColor Yellow
        Write-Host "   docker run -d -p 27017:27017 --name mongodb mongo" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Impossible de vérifier MongoDB" -ForegroundColor Yellow
}

# Vérifier si Ollama est disponible
Write-Host "🤖 Vérification d'Ollama..." -ForegroundColor Yellow
try {
    $ollamaTest = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 3
    Write-Host "✅ Ollama est disponible et fonctionne" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ollama n'est pas disponible" -ForegroundColor Yellow
    Write-Host "💡 Pour installer Ollama, exécutez: .\install-ollama.ps1" -ForegroundColor Yellow
    Write-Host "💡 Ou démarrez-le manuellement: ollama serve" -ForegroundColor Yellow
}

# Créer le fichier .env s'il n'existe pas
$envPath = "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" $envPath
    Write-Host "✅ Fichier .env créé depuis .env.example" -ForegroundColor Green
    Write-Host "💡 Modifiez backend\.env si nécessaire" -ForegroundColor Yellow
}

# Installer les dépendances si nécessaire
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Installation des dépendances backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✅ Dépendances backend installées" -ForegroundColor Green
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installation des dépendances frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "✅ Dépendances frontend installées" -ForegroundColor Green
}

# Fonction pour démarrer les services
function Start-Services {
    Write-Host "🎯 Démarrage des services..." -ForegroundColor Green
    
    # Démarrer le backend
    Write-Host "🔧 Démarrage du backend..." -ForegroundColor Yellow
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location backend
        npm run dev
    }
    
    # Attendre un peu pour que le backend démarre
    Start-Sleep -Seconds 3
    
    # Démarrer le frontend
    Write-Host "🎨 Démarrage du frontend..." -ForegroundColor Yellow
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        Set-Location frontend
        npm start
    }
    
    Write-Host ""
    Write-Host "🎉 Application démarrée!" -ForegroundColor Green
    Write-Host "📋 Services actifs:" -ForegroundColor White
    Write-Host "   • Backend: http://localhost:5000" -ForegroundColor White
    Write-Host "   • Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   • MongoDB: mongodb://localhost:27017" -ForegroundColor White
    Write-Host "   • Ollama: http://localhost:11434" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Ouvrez votre navigateur sur: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏹️  Pour arrêter l'application, fermez cette fenêtre ou appuyez sur Ctrl+C" -ForegroundColor Yellow
    
    # Attendre que les jobs se terminent
    try {
        Wait-Job $backendJob, $frontendJob
    } catch {
        Write-Host "🛑 Arrêt des services..." -ForegroundColor Yellow
    } finally {
        Remove-Job $backendJob, $frontendJob -Force
    }
}

# Demander confirmation pour démarrer
$response = Read-Host "Voulez-vous démarrer l'application maintenant? (o/n)"
if ($response -eq 'o' -or $response -eq 'O' -or $response -eq 'oui' -or $response -eq '') {
    Start-Services
} else {
    Write-Host "👋 Pour démarrer plus tard, exécutez: .\start.ps1" -ForegroundColor Yellow
    Write-Host "📖 Consultez le README.md pour plus d'informations" -ForegroundColor Yellow
}
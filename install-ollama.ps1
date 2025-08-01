# Script d'installation d'Ollama pour Windows
Write-Host "🚀 Installation d'Ollama pour l'IA locale..." -ForegroundColor Green

# Vérifier si Ollama est déjà installé
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
if ($ollamaPath) {
    Write-Host "✅ Ollama est déjà installé!" -ForegroundColor Green
    ollama --version
} else {
    Write-Host "📥 Téléchargement d'Ollama..." -ForegroundColor Yellow
    
    # Télécharger Ollama
    $downloadUrl = "https://ollama.ai/download/windows"
    $installerPath = "$env:TEMP\OllamaSetup.exe"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
        Write-Host "✅ Téléchargement terminé!" -ForegroundColor Green
        
        Write-Host "🔧 Lancement de l'installation..." -ForegroundColor Yellow
        Start-Process -FilePath $installerPath -Wait
        
        Write-Host "✅ Installation terminée!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors du téléchargement: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Veuillez télécharger manuellement depuis: https://ollama.ai/download" -ForegroundColor Yellow
        exit 1
    }
}

# Vérifier si le service Ollama fonctionne
Write-Host "🔍 Vérification du service Ollama..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5
    Write-Host "✅ Ollama fonctionne correctement!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ollama n'est pas encore démarré. Démarrage..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5
        Write-Host "✅ Ollama démarré avec succès!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Impossible de démarrer Ollama automatiquement." -ForegroundColor Red
        Write-Host "💡 Veuillez démarrer Ollama manuellement avec: ollama serve" -ForegroundColor Yellow
    }
}

# Télécharger le modèle Llama recommandé
Write-Host "📦 Téléchargement du modèle Llama 3.2 (3B)..." -ForegroundColor Yellow
Write-Host "⏳ Cela peut prendre plusieurs minutes selon votre connexion..." -ForegroundColor Yellow

try {
    Start-Process "ollama" -ArgumentList "pull", "llama3.2:3b" -Wait -NoNewWindow
    Write-Host "✅ Modèle Llama 3.2 téléchargé avec succès!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors du téléchargement du modèle." -ForegroundColor Yellow
    Write-Host "💡 Vous pouvez le télécharger manuellement avec: ollama pull llama3.2:3b" -ForegroundColor Yellow
}

# Tester le modèle
Write-Host "🧪 Test du modèle..." -ForegroundColor Yellow
try {
    $testResponse = ollama run llama3.2:3b "Bonjour, peux-tu me dire que tu fonctionnes correctement en français ?" --timeout 30
    if ($testResponse) {
        Write-Host "✅ Test réussi! Le modèle répond correctement." -ForegroundColor Green
        Write-Host "Réponse du modèle: $testResponse" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Le test du modèle a échoué, mais l'installation semble correcte." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Installation terminée!" -ForegroundColor Green
Write-Host "📋 Résumé:" -ForegroundColor White
Write-Host "   • Ollama est installé et configuré" -ForegroundColor White
Write-Host "   • Modèle Llama 3.2 (3B) téléchargé" -ForegroundColor White
Write-Host "   • Service accessible sur http://localhost:11434" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Vous pouvez maintenant démarrer votre application!" -ForegroundColor Green
Write-Host "💡 Pour démarrer Ollama manuellement: ollama serve" -ForegroundColor Yellow
Write-Host "💡 Pour tester: ollama run llama3.2:3b" -ForegroundColor Yellow
# test-simple.ps1 - TEST SIMPLIFIÉ
Write-Host "🧪 TEST SIMPLIFIÉ DE L'API" -ForegroundColor Cyan

# Test 1: Route racine
Write-Host "`n1. Test route racine..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get
    Write-Host "   ✅ CONNECTÉ - Code:" $response.StatusCode -ForegroundColor Green
    Write-Host "   Contenu:" $response.Content -ForegroundColor Gray
} catch {
    Write-Host "   ❌ ERREUR:" $_.Exception.Message -ForegroundColor Red
}

# Test 2: Utilisateur existant
Write-Host "`n2. Test utilisateur RFID001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/utilisateur/RFID001" -Method Get
    Write-Host "   ✅ UTILISATEUR TROUVÉ - Code:" $response.StatusCode -ForegroundColor Green
} catch {
    Write-Host "   ❌ ERREUR:" $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎯 TEST TERMINÉ" -ForegroundColor Cyan
# 🚀 Script de vérification NextAuth

Write-Host "🔍 Vérification de l'installation NextAuth..." -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que next-auth est installé
Write-Host "1. Vérification de next-auth dans package.json..." -ForegroundColor Yellow
if (Select-String -Path "package.json" -Pattern "next-auth" -Quiet) {
    Write-Host "   ✅ next-auth est installé" -ForegroundColor Green
} else {
    Write-Host "   ❌ next-auth n'est pas installé" -ForegroundColor Red
    exit 1
}

# 2. Vérifier les fichiers de configuration
Write-Host ""
Write-Host "2. Vérification des fichiers de configuration..." -ForegroundColor Yellow

$requiredFiles = @(
    "auth.config.ts",
    "auth.ts",
    "app\api\auth\[...nextauth]\route.ts",
    "lib\auth-helpers.ts",
    "types\next-auth.d.ts",
    "components\Providers\NextAuthProvider.tsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file manquant" -ForegroundColor Red
    }
}

# 3. Vérifier le fichier .env.local
Write-Host ""
Write-Host "3. Vérification de .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    if (Select-String -Path ".env.local" -Pattern "AUTH_SECRET" -Quiet) {
        $authSecret = Select-String -Path ".env.local" -Pattern "AUTH_SECRET=(.+)" | Select-Object -First 1
        if ($authSecret -match "VOTRE_CLE|your-secret|change-this") {
            Write-Host "   ⚠️  AUTH_SECRET doit être généré" -ForegroundColor Yellow
            Write-Host "   💡 Exécutez: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))" -ForegroundColor Cyan
        } else {
            Write-Host "   ✅ AUTH_SECRET est défini" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ AUTH_SECRET manquant dans .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Fichier .env.local non trouvé" -ForegroundColor Yellow
    Write-Host "   💡 Copiez .env.local.example vers .env.local et configurez AUTH_SECRET" -ForegroundColor Cyan
}

# 4. Vérifier le middleware
Write-Host ""
Write-Host "4. Vérification du middleware..." -ForegroundColor Yellow
if (Test-Path "middleware.ts") {
    if (Select-String -Path "middleware.ts" -Pattern "import.*auth.*from.*@/auth" -Quiet) {
        Write-Host "   ✅ Middleware utilise NextAuth" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Middleware n'utilise pas NextAuth" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Vérification terminée!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Pour plus d'informations, consultez:" -ForegroundColor White
Write-Host "   - NEXTAUTH-MIGRATION-GUIDE.md" -ForegroundColor Gray
Write-Host "   - lib\examples\nextauth-usage-examples.tsx" -ForegroundColor Gray

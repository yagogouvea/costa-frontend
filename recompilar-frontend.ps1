# Script para recompilar o Frontend do Cliente Costa
Write-Host "🔄 Recompilando Frontend do Cliente Costa..." -ForegroundColor Cyan
Write-Host ""

Write-Host "📁 Diretório atual: $PWD" -ForegroundColor Yellow
Write-Host ""

Write-Host "🧹 Limpando cache e arquivos antigos..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Write-Host "  - Removendo pasta dist..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "dist"
    Write-Host "  ✅ Pasta dist removida" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Write-Host "  - Removendo cache do node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "  ✅ Cache removido" -ForegroundColor Green
}

Write-Host ""

Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Erro ao instalar dependências"
    }
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências: $_" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

Write-Host "🔨 Compilando para produção..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Erro na compilação"
    }
    Write-Host "✅ Frontend compilado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na compilação: $_" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""

Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Yellow
Write-Host "  - Pressione Ctrl+C para parar" -ForegroundColor Gray
Write-Host "  - O frontend estará disponível em: http://localhost:5174" -ForegroundColor Gray
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "❌ Erro ao iniciar servidor: $_" -ForegroundColor Red
}

Read-Host "Pressione Enter para sair"

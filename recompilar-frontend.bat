@echo off
echo 🔄 Recompilando Frontend do Cliente Costa...
echo.

echo 📁 Diretório atual: %CD%
echo.

echo 🧹 Limpando cache e arquivos antigos...
if exist "dist" (
    echo   - Removendo pasta dist...
    rmdir /s /q "dist"
    echo   ✅ Pasta dist removida
)

if exist "node_modules/.cache" (
    echo   - Removendo cache do node_modules...
    rmdir /s /q "node_modules\.cache"
    echo   ✅ Cache removido
)

echo.

echo 📦 Instalando dependências...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)
echo ✅ Dependências instaladas

echo.

echo 🔨 Compilando para produção...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro na compilação
    pause
    exit /b 1
)
echo ✅ Frontend compilado com sucesso!

echo.

echo 🚀 Iniciando servidor de desenvolvimento...
echo   - Pressione Ctrl+C para parar
echo   - O frontend estará disponível em: http://localhost:5174
echo.

call npm run dev

pause

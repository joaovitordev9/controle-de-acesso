@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===========================================================
echo   1/3  Compilando o backend (gerando o arquivo .jar)
echo ===========================================================
call mvnw.cmd clean package -DskipTests
if errorlevel 1 goto erro

echo.
echo ===========================================================
echo   2/3  Compilando a tela (frontend React)
echo ===========================================================
pushd front-end\controle-acesso
call npm install
if errorlevel 1 goto erro
call npm run build
if errorlevel 1 goto erro
popd

echo.
echo ===========================================================
echo   3/3  Gerando o aplicativo desktop (.exe instalador)
echo ===========================================================
pushd desktop
call npm install
if errorlevel 1 goto erro
call npm run dist
if errorlevel 1 goto erro
popd

echo.
echo ===========================================================
echo   CONCLUIDO!
echo   - Servidor (jar): target\controle-acesso-0.0.1-SNAPSHOT.jar
echo   - Instalador do app: desktop\dist\  (arquivo .exe de instalacao)
echo ===========================================================
pause
exit /b 0

:erro
echo.
echo *** Ocorreu um erro acima. Leia a mensagem em vermelho/texto acima. ***
pause
exit /b 1

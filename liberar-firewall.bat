@echo off
chcp 65001 >nul
echo ===========================================================
echo   Liberando a porta 8485 no Firewall do Windows
echo   (Rode APENAS no PC SERVIDOR, como Administrador)
echo ===========================================================
net session >nul 2>&1
if errorlevel 1 (
  echo.
  echo *** Clique com o botao direito neste arquivo e escolha
  echo     "Executar como administrador". ***
  echo.
  pause
  exit /b 1
)
netsh advfirewall firewall delete rule name="Controle de Acesso 8080" >nul 2>&1
netsh advfirewall firewall delete rule name="Controle de Acesso 8485" >nul 2>&1
netsh advfirewall firewall add rule name="Controle de Acesso 8485" dir=in action=allow protocol=TCP localport=8485
echo.
echo Pronto. A porta 8485 agora aceita conexoes dos outros PCs da rede.
pause

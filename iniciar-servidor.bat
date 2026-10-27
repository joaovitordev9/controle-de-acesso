@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Servidor - Controle de Acesso  (NAO FECHE esta janela)
echo ===========================================================
echo   SERVIDOR DO CONTROLE DE ACESSO
echo ===========================================================
echo   Aguarde a mensagem:  "Started ControleAcessoApplication"
echo   Deixe esta janela aberta enquanto o sistema estiver em uso.
echo   (Este .bat so precisa rodar no PC servidor.)
echo ===========================================================
echo.
java -jar target\controle-acesso-0.0.1-SNAPSHOT.jar
echo.
echo *** O servidor foi encerrado. Se nao era esperado, leia as mensagens acima. ***
pause

' Inicia o servidor do Controle de Acesso SEM abrir janela.
' Use este arquivo na Inicializacao do Windows (pasta Startup) do PC SERVIDOR,
' assim o servidor sobe sozinho quando o PC liga, sem janela preta.
' Para ver erros/log, use o iniciar-servidor.bat (com janela) em vez deste.
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh  = CreateObject("WScript.Shell")
sh.CurrentDirectory = fso.GetParentFolderName(WScript.ScriptFullName)
sh.Run "javaw -jar target\controle-acesso-0.0.1-SNAPSHOT.jar", 0, False

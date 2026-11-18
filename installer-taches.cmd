@echo off
REM Lance la file toutes les 10 minutes et le relais Discord chaque minute.
REM A lancer UNE fois, apres avoir configure le bot Discord (voir LISEZ-MOI.md).
set PY=%LOCALAPPDATA%\Programs\Python\Python312\pythonw.exe
set DIR=%USERPROFILE%\Projets\file-videos
schtasks /Create /F /SC MINUTE /MO 10 /TN "file-videos" /TR "\"%PY%\" \"%DIR%\file.py\""
schtasks /Create /F /SC MINUTE /MO 1 /TN "file-videos-relais" /TR "\"%PY%\" \"%DIR%\relais_discord.py\""
echo.
echo C'est fait. Pour arreter : desinstaller-taches.cmd
pause

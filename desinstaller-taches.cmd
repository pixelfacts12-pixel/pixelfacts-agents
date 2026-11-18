@echo off
schtasks /Delete /F /TN "file-videos"
schtasks /Delete /F /TN "file-videos-relais"
pause

@echo off
title Campus Bites — University Canteen Pre-Ordering System
cd /d "%~dp0"
echo Starting Campus Bites Local Server on port 8088...
start "" http://localhost:8088/index.html
python -m http.server 8088
pause

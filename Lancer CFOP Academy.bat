@echo off
title CFOP Academy
cd /d "%~dp0"
where node 1>NUL 2>NUL
if errorlevel 1 (
  echo Node.js est introuvable. Installez-le depuis https://nodejs.org puis relancez ce fichier.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installation des dependances, patientez...
  call npm install
)
echo Demarrage de CFOP Academy sur http://localhost:5173 ...
start "" http://localhost:5173
call npm run dev

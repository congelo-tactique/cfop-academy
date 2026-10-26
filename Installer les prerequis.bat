@echo off
setlocal
title CFOP Academy - Installation des prerequis
cd /d "%~dp0"

echo ============================================
echo   CFOP Academy - Installation des prerequis
echo ============================================
echo.

rem --- 1. Node.js (version 20 ou plus) ---
set "NODE_OK="
where node 1>NUL 2>NUL
if not errorlevel 1 (
  for /f "tokens=1 delims=." %%v in ('node -v') do set "NODE_MAJOR=%%v"
)
if defined NODE_MAJOR set "NODE_MAJOR=%NODE_MAJOR:v=%"
if defined NODE_MAJOR if %NODE_MAJOR% GEQ 20 set "NODE_OK=1"

if defined NODE_OK (
  for /f %%v in ('node -v') do echo [OK] Node.js %%v est deja installe.
  goto deps
)

if defined NODE_MAJOR (
  echo Node.js v%NODE_MAJOR% est trop ancien : la version 20 ou plus est requise.
) else (
  echo Node.js n'est pas installe.
)

where winget 1>NUL 2>NUL
if errorlevel 1 goto manual

echo Installation de Node.js LTS avec winget...
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
if errorlevel 1 goto manual

rem Le PATH de cette fenetre n'est pas mis a jour automatiquement.
set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node 1>NUL 2>NUL
if errorlevel 1 (
  echo.
  echo Node.js est installe mais pas encore visible dans cette fenetre.
  echo Fermez cette fenetre puis relancez ce fichier.
  pause
  exit /b 1
)
for /f %%v in ('node -v') do echo [OK] Node.js %%v installe.
goto deps

:manual
echo.
echo Impossible d'installer Node.js automatiquement.
echo La page de telechargement va s'ouvrir : installez la version LTS,
echo puis relancez ce fichier.
start "" https://nodejs.org/fr/download
pause
exit /b 1

rem --- 2. Dependances du projet ---
:deps
echo.
echo Installation des dependances du projet (npm install)...
call npm install
if errorlevel 1 (
  echo.
  echo [ERREUR] npm install a echoue. Verifiez votre connexion internet puis relancez ce fichier.
  pause
  exit /b 1
)

echo.
echo Preparation de cubing.js...
call node scripts/vendor-cubing.mjs
if errorlevel 1 (
  echo [ERREUR] La preparation de cubing.js a echoue.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   Tout est pret !
echo   Lancez "Lancer CFOP Academy.bat" pour demarrer.
echo ============================================
pause

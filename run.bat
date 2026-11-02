@echo off
chcp 65001 >nul
title Website Bán Hàng Tạp Hóa - Java Web Server

echo ==============================================================
echo        WEBSITE BÁN HÀNG TẠP HÓA (BÁCH HÓA ONLINE)
echo        Ngôn ngữ: Java 17 + SQL Server / Script + HTML/CSS/JS
echo ==============================================================
echo.

cd /d "%~dp0"

echo [1/2] Dang bien dich ma nguon Java...
if not exist "bin" mkdir "bin"
javac -encoding UTF-8 -d bin src/models/*.java src/database/*.java src/WebServer.java

if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Bien dich that bai! Vui long kiem tra JDK 17 da duoc cai dat.
    pause
    exit /b
)

echo [2/2] Khoi dong May Chu Web tai http://localhost:8080 ...
echo.
echo ==============================================================
echo   May chu dang hoat dong!
echo   * Trang mua sam:  http://localhost:8080/
echo   * Trang quan ly:  http://localhost:8080/admin.html
echo   * Nhan Ctrl + C de dung may chu.
echo ==============================================================
echo.

start http://localhost:8080/

java -cp bin WebServer

pause

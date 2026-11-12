@echo off
chcp 65001 >nul
title Website Bán Hàng Tạp Hóa - Java Web Server

echo ==============================================================
echo        WEBSITE BÁN HÀNG TẠP HÓA - ĐỒ ÁN NHẬP MÔN MẠNG
echo        Ngôn ngữ: Java 17 + CSDL SQL + HTML/CSS/JS (REST API)
echo ==============================================================
echo.

cd /d "%~dp0"

echo [1/3] Dang kiem tra dia chi mang LAN cua may tinh...
for /f "tokens=*" %%i in ('powershell -Command "$w=(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*' -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notmatch '^169\.254' } | Select-Object -First 1).IPAddress; $e=(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Ethernet*' -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notmatch '^169\.254' } | Select-Object -First 1).IPAddress; if ($w) { $w } elseif ($e) { $e } else { '127.0.0.1' }"') do set SERVER_IP=%%i

:: Kiem tra xem da cai dat ten mien taphoa.local chua
set LAUNCH_URL=http://%SERVER_IP%:8080/
findstr /i "taphoa.local" "%windir%\system32\drivers\etc\hosts" >nul 2>&1
if %errorlevel% equ 0 (
    set LAUNCH_URL=http://taphoa.local:8080/
)

echo [2/3] Dang bien dich ma nguon Java...
if not exist "bin" mkdir "bin"
javac -encoding UTF-8 -d bin src/models/*.java src/database/*.java src/WebServer.java

if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Bien dich that bai! Vui long kiem tra JDK 17 da duoc cai dat.
    pause
    exit /b
)

echo [3/3] Khoi dong May Chu Web tai %LAUNCH_URL% ...
echo.
echo ==============================================================
echo   MAY CHU DANG HOAT DONG SAN SANG PHUC VU:
echo.
echo   [1] Dia chi IP mang LAN thuc te (Cho thay giao & may khac):
echo       -> http://%SERVER_IP%:8080/
echo       * Quan tri Admin: http://%SERVER_IP%:8080/admin.html
echo.
echo   [2] Ten mien rieng DNS (Khong con chu localhost):
echo       -> http://taphoa.local:8080/
echo       (Chay file 'cai_dat_ten_mien.bat' neu chua cai dat)
echo.
echo   [3] Mo mang Online toan cau: Chay file 'mo_mang_online.bat'
echo   * Nhan Ctrl + C de dung may chu.
echo ==============================================================
echo.

start %LAUNCH_URL%

java -cp bin WebServer

pause

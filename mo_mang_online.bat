@echo off
chcp 65001 >nul
title Mở Đường Link Online Cho Website Tiệm Tạp Hóa - Cloudflare Tunnel

echo =================================================================
echo        MỞ ĐƯỜNG LINK ONLINE TOÀN CẦU (HTTPS) CHO WEBSITE
echo =================================================================
echo.
echo [*] Lưu ý: Hãy đảm bảo file 'run.bat' đang chạy ở một cửa sổ khác.
echo.
echo [*] Đang khởi tạo đường link Online bảo mật HTTPS...
echo.

cd /d "%~dp0"

if not exist "cloudflared.exe" (
    echo [*] Dang tu dong tai cong cu Cloudflare Tunnel ve may...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
)

echo =================================================================
echo   ĐƯỜNG LINK ONLINE ĐANG ĐƯỢC KẾT NỐI...
echo   (Hãy sao chép đường link dạng https://...trycloudflare.com
echo    và gửi cho bạn bè hoặc thầy giáo trên Zalo / Facebook)
echo.
echo   * Nhấn Ctrl + C để dừng chia sẻ online.
echo =================================================================
echo.

cloudflared.exe tunnel --url http://localhost:8080

pause

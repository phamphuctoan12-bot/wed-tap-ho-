@echo off
chcp 65001 >nul
title Cài Đặt Tên Miền Riêng Cho Tiệm Tạp Hóa (DNS Mapping)

:: Kiểm tra quyền Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [THÔNG BÁO] Đang yêu cầu quyền Quản trị viên (Administrator)...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo Đang cấu hình tên miền vào hệ thống DNS nội bộ (file hosts)...
findstr /i "taphoa.local" "%windir%\system32\drivers\etc\hosts" >nul
if %errorlevel% equ 0 (
    echo [OK] Tên miền taphoa.local đã tồn tại trong file hosts!
) else (
    echo. >> "%windir%\system32\drivers\etc\hosts"
    echo # Tên miền Tiệm Tạp Hóa - Đồ án Nhập Môn Mạng >> "%windir%\system32\drivers\etc\hosts"
    echo 127.0.0.1  taphoa.local >> "%windir%\system32\drivers\etc\hosts"
    echo 127.0.0.1  tiemtaphoa.vn >> "%windir%\system32\drivers\etc\hosts"
    echo [THÀNH CÔNG] Đã cấu hình tên miền taphoa.local và tiemtaphoa.vn!
)

echo.
echo =================================================================
echo   CẤU HÌNH TÊN MIỀN THÀNH CÔNG!
echo   Bây giờ thanh địa chỉ sẽ không hiện chữ "localhost" nữa mà hiện:
echo   * Khách mua hàng: http://taphoa.local:8080/
echo   * Quản trị Admin: http://taphoa.local:8080/admin.html
echo =================================================================
echo.
pause

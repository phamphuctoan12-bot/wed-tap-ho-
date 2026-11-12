@echo off
chcp 65001 >nul
title Dang Nhap va Day Code Len GitHub - phamtoan12

echo ==============================================================
echo        DANG NHAP VA DAY CODE LEN GITHUB CHINH THUC
echo        Repo: https://github.com/phamphuctoan12-bot/wed-tap-ho-
echo ==============================================================
echo.

echo [BUOC 1/2] Dang nhap tai khoan GitHub...
echo Cua so se hien ra 1 ma so gom 8 ky tu.
echo Trinh duyet se tu mo trang: https://github.com/login/device
echo Ban chi can nhap 8 ky tu do vao va bam Continue la xong!
echo.

"C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com -p https --web

echo.
echo [BUOC 2/2] Dang day toan bo code len repo wed-tap-ho-...
echo.

cd /d "%~dp0"
"C:\Program Files\GitHub CLI\gh.exe" auth setup-git
git branch -M main
git remote set-url origin https://github.com/phamphuctoan12-bot/wed-tap-ho-.git
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ==============================================================
    echo  [THANH CONG RUC RO!]
    echo  Toan bo code web da duoc day len GitHub thanh cong:
    echo  Link xem: https://github.com/phamphuctoan12-bot/wed-tap-ho-
    echo ==============================================================
) else (
    echo ==============================================================
    echo  Co loi xay ra, vui long kiem tra lai.
    echo ==============================================================
)

echo.
pause

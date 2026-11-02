@echo off
chcp 65001 >nul
title Tao Link Online Cho Website Ban Tap Hoa

echo ================================================================
echo        TAO DUONG LINK ONLINE RA NGOAI INTERNET CHO WEBSITE
echo ================================================================
echo.
echo Luu y: Ban can phai chay file run.bat truoc de may chu hoat dong!
echo.
echo Dang ket noi tao link HTTPS cong khai...
echo.

ssh -o StrictHostKeyChecking=no -p 443 -R0:localhost:8080 qr@a.pinggy.io

pause

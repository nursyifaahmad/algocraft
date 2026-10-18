@echo off
echo ==========================================================
echo 🚀 Menyinkronkan perubahan AlgoCraft ke GitHub...
echo ==========================================================
git add .
set /p commit_msg="Masukkan pesan commit (tekan Enter untuk default 'update: algocraft'): "
if "%commit_msg%"=="" set commit_msg=update: algocraft pembaruan otomatis
git commit -m "%commit_msg%"
git push origin main
echo ==========================================================
echo ✅ Selesai! Perubahan telah terunggah ke repositori GitHub.
echo ==========================================================
pause

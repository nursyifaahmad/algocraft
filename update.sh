#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 [1/4] Menarik pembaruan kode terbaru dari GitHub..."
echo "=========================================================="
git pull origin main

echo ""
echo "=========================================================="
echo "📦 [2/4] Membangun ulang dan me-restart container AlgoCraft..."
echo "=========================================================="
docker compose up -d --build

echo ""
echo "=========================================================="
echo "🧹 [3/4] Membersihkan cache Docker image yang tidak terpakai..."
echo "=========================================================="
docker image prune -f

echo ""
echo "=========================================================="
echo "✨ [4/4] SUKSES! AlgoCraft berhasil diperbarui!"
echo "🌐 URL: https://algocraft.ahmadnursyifa.my.id (Port 3060)"
echo "=========================================================="

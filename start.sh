#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo
echo "正在检查必需环境..."
if ! command -v mvn >/dev/null 2>&1; then
  echo "未找到 Maven 命令，請先安裝 Maven 並配置環境變量。"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "未找到 Node.js，請先安裝 Node.js 並配置環境變量。"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "未找到 npm，請確認 Node.js 安裝完整。"
  exit 1
fi

echo
echo "正在检查前端依賴..."
if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "未檢測到 node_modules，正在為前端安裝依賴，請稍候..."
  cd "$ROOT_DIR/frontend"
  npm install
  cd "$ROOT_DIR"
fi

echo
echo "[1/2] 啟動後端服務..."
cd "$ROOT_DIR/backend"
mvn spring-boot:run &
BACKEND_PID=$!

trap 'kill $BACKEND_PID 2>/dev/null || true' EXIT

echo
echo "[2/2] 啟動前端服務..."
cd "$ROOT_DIR/frontend"
npm run dev

echo
echo "服務已結束。"


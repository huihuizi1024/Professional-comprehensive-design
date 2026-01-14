#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo
echo "正在检查必需环境..."
if ! command -v mvn >/dev/null 2>&1; then
  echo "未找到 Maven 命令，请先安装 Maven 并配置环境变量。"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "未找到 Node.js，请先安装 Node.js 并配置环境变量。"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "未找到 npm，请确认 Node.js 安装完整。"
  exit 1
fi

echo
echo "正在检查前端依赖..."
if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "未检测到 node_modules，正在为前端安装依赖，请稍候..."
  cd "$ROOT_DIR/frontend"
  npm install
  cd "$ROOT_DIR"
fi

echo
echo "[1/2] 启动后端服务..."
cd "$ROOT_DIR/backend"
mvn spring-boot:run &
BACKEND_PID=$!

trap 'kill $BACKEND_PID 2>/dev/null || true' EXIT

echo
echo "[2/2] 启动前端服务..."
cd "$ROOT_DIR/frontend"
npm run dev

echo
echo "服务已结束。"

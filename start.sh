#!/bin/bash

# AI Agent Platform 一键启动脚本
# 适用于 macOS/Linux

set -e

echo "🚀 AI Agent Platform 启动中..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. 检查 Node.js
echo -e "${BLUE}步骤 1/5: 检查环境${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  未检测到 Node.js，请先安装 Node.js 18+${NC}"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
echo ""

# 2. 检查依赖
echo -e "${BLUE}步骤 2/5: 检查依赖${NC}"
if [ ! -d "node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install --silent
fi
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend && npm install --silent && cd ..
fi
echo -e "${GREEN}✓ 依赖已就绪${NC}"
echo ""

# 3. 构建前端
echo -e "${BLUE}步骤 3/5: 构建前端${NC}"
if [ ! -d "frontend/dist" ]; then
    echo "🔨 构建中..."
    cd frontend && npm run build --silent && cd ..
fi
echo -e "${GREEN}✓ 前端已构建${NC}"
echo ""

# 4. 停止旧进程
echo -e "${BLUE}步骤 4/5: 清理旧进程${NC}"
pkill -f "node.*simple-server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1
echo -e "${GREEN}✓ 清理完成${NC}"
echo ""

# 5. 启动服务
echo -e "${BLUE}步骤 5/5: 启动服务${NC}"
echo ""

# 启动后端（后台）
nohup node simple-server.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# 检查后端是否启动
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✓ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  后端启动失败，请查看 logs/backend.log${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 启动成功！${NC}"
echo ""
echo -e "🌐 访问地址:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "📖 API 端点:"
echo "   健康检查: GET  http://localhost:3000/health"
echo "   Skills:    GET  http://localhost:3000/api/skills"
echo "   Adapters:  GET  http://localhost:3000/api/adapters"
echo ""
echo -e "💡 提示:"
echo "   - 这是简化版，无需数据库"
echo "   - 数据保存在内存中"
echo "   - 停止服务: pkill -f 'node.*simple-server'"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
echo ""

# 等待用户中断
wait $BACKEND_PID

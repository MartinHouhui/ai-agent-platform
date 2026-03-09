#!/bin/bash

# AI Agent Platform 一键启动脚本

echo "🚀 AI Agent Platform 启动脚本"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装 Node.js 18+"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "📝 创建 .env 文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，填入你的配置"
    echo ""
fi

# 检查编译
if [ ! -d "dist" ]; then
    echo "🔨 编译项目..."
    npm run build
    echo ""
fi

# 启动服务
echo "🌐 启动服务..."
echo ""

# 选择启动方式
if [ "$1" == "docker" ]; then
    echo "使用 Docker 启动..."
    docker-compose up -d
    echo ""
    echo "✅ 服务已启动！"
    echo ""
    echo "📖 访问地址："
    echo "  - API: http://localhost:3000"
    echo "  - 健康检查: http://localhost:3000/health"
    echo ""
    echo "📝 查看日志: docker-compose logs -f app"
else
    echo "使用本地模式启动..."
    echo ""
    npm run dev
fi

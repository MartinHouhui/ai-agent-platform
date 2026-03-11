#!/bin/bash

# AI Agent Platform 停止脚本

echo "🛑 停止 AI Agent Platform..."
echo ""

# 停止所有相关进程
pkill -f "node.*simple-server" 2>/dev/null && echo "✓ 后端已停止" || echo "ℹ️  后端未运行"
pkill -f "vite" 2>/dev/null && echo "✓ 前端已停止" || echo "ℹ️  前端未运行"

echo ""
echo "✅ 所有服务已停止"

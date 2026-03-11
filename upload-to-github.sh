#!/bin/bash
# 上传 AI Agent Platform 到 GitHub

set -e

echo "🚀 准备上传 AI Agent Platform 到 GitHub..."

cd ~/clawd/ai-agent-platform

# 检查 git 状态
if [ ! -d .git ]; then
    echo "📦 初始化 Git 仓库..."
    git init
    git add .
    git commit -m "Initial commit: AI Agent Platform MVP

- ✅ 完整的前端（React + TypeScript + Ant Design）
- ✅ 完整的后端（Node.js + Express + MySQL）
- ✅ 5 个前端页面
- ✅ 18 个 API 端点
- ✅ Agent 核心引擎
- ✅ Skill 管理系统
- ✅ 适配器系统
- ✅ 7 步向导流程
- ✅ 智能体进化机制
- ✅ 完整文档（50,000+ 字）
- ✅ 一键启动脚本
- ✅ 新手引导组件"
fi

# 检查 gh 认证状态
if ! gh auth status &> /dev/null; then
    echo ""
    echo "⚠️  GitHub CLI 未登录"
    echo ""
    echo "请先运行以下命令登录："
    echo "  gh auth login"
    echo ""
    echo "登录后重新运行此脚本"
    exit 1
fi

# 创建 GitHub 仓库
echo ""
echo "📦 创建 GitHub 仓库..."
gh repo create ai-agent-platform \
  --public \
  --description "🤖 可自主进化的 AI Agent 平台 - 对接业务系统的智能体系统" \
  --source=. \
  --remote=origin \
  --push

echo ""
echo "✅ 成功上传到 GitHub！"
echo ""
echo "📍 仓库地址: https://github.com/$(gh api user --jq '.login')/ai-agent-platform"
echo ""

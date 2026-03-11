#!/bin/bash

# GitHub 推送脚本

echo "🚀 AI Agent Platform - GitHub 推送向导"
echo "========================================"
echo ""

# 检查是否有 gh 命令
if command -v gh &> /dev/null; then
    echo "✅ 检测到 GitHub CLI"
    echo ""
    echo "可以使用以下命令创建仓库："
    echo ""
    echo "  gh repo create ai-agent-platform --public --description='🤖 AI Agent Platform - 可自主进化的业务系统对接平台' --source=. --remote=origin"
    echo ""
    echo "或者私有仓库："
    echo ""
    echo "  gh repo create ai-agent-platform --private --description='🤖 AI Agent Platform - 可自主进化的业务系统对接平台' --source=. --remote=origin"
    echo ""
    read -p "是否使用 GitHub CLI 创建仓库？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "公开仓库还是私有仓库？(public/private) " repo_type
        if [ "$repo_type" = "private" ]; then
            gh repo create ai-agent-platform --private --description='🤖 AI Agent Platform - 可自主进化的业务系统对接平台' --source=. --remote=origin
        else
            gh repo create ai-agent-platform --public --description='🤖 AI Agent Platform - 可自主进化的业务系统对接平台' --source=. --remote=origin
        fi
        echo ""
        echo "✅ 仓库创建成功！"
        echo ""
        echo "推送代码..."
        git push -u origin main
        echo ""
        echo "🎉 推送完成！"
        exit 0
    fi
fi

echo "📝 手动推送步骤："
echo ""
echo "1️⃣  在 GitHub 创建仓库："
echo "   访问: https://github.com/new"
echo "   仓库名: ai-agent-platform"
echo "   描述: 🤖 AI Agent Platform - 可自主进化的业务系统对接平台"
echo "   ⚠️  不要勾选 'Initialize with README'"
echo ""

read -p "2️⃣  已创建仓库？输入你的 GitHub 用户名: " username

if [ -z "$username" ]; then
    echo "❌ 用户名不能为空"
    exit 1
fi

echo ""
echo "3️⃣  添加远程仓库..."
git remote add origin https://github.com/$username/ai-agent-platform.git

echo ""
echo "4️⃣  推送代码..."
git branch -M main
git push -u origin main

echo ""
echo "🎉 推送完成！"
echo ""
echo "📦 仓库地址: https://github.com/$username/ai-agent-platform"
echo ""
echo "✅ 后续推送只需运行:"
echo "   git add ."
echo "   git commit -m 'your message'"
echo "   git push"

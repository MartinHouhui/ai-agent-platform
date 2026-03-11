#!/bin/bash
# GitHub 自动登录和上传脚本

echo "🚀 开始 GitHub 登录和上传流程..."
echo ""

# 检查是否已登录
if gh auth status &> /dev/null; then
    echo "✅ 已登录 GitHub"
    gh auth status
else
    echo "📝 需要登录 GitHub"
    echo ""
    echo "方式 1: 通过浏览器登录（推荐）"
    echo "运行: gh auth login"
    echo ""
    echo "方式 2: 使用 Token 登录"
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 点击 'Generate new token (classic)'"
    echo "3. 选择权限: repo, workflow"
    echo "4. 复制生成的 token"
    echo "5. 运行: echo YOUR_TOKEN | gh auth login --with-token"
    echo ""
    read -p "按回车键开始浏览器登录..."
    gh auth login
fi

echo ""
echo "📤 准备上传到 GitHub..."
read -p "请输入仓库名称 (默认: ai-agent-platform): " repo_name
repo_name=${repo_name:-ai-agent-platform}

read -p "仓库是公开还是私有? (public/private, 默认: public): " visibility
visibility=${visibility:-public}

echo ""
echo "🎯 即将创建仓库: $repo_name ($visibility)"
read -p "确认继续? (y/n): " confirm

if [[ $confirm == "y" || $confirm == "Y" ]]; then
    # 创建仓库并上传
    gh repo create "$repo_name" --$visibility --description "🤖 可自主进化的 AI Agent 平台" --source=. --remote=origin --push
    
    echo ""
    echo "✅ 上传完成！"
    echo "🌐 仓库地址:"
    gh repo view --web
else
    echo "❌ 已取消"
fi

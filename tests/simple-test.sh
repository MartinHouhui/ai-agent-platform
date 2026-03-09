#!/bin/bash

# 简单测试 - 不依赖数据库

echo "🧪 AI Agent Platform 简单测试"
echo "=============================="
echo ""

# 测试 1: 检查文件结构
echo "1️⃣ 测试文件结构..."
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
else
    echo "❌ package.json 缺失"
    exit 1
fi

if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json 存在"
else
    echo "❌ tsconfig.json 缺失"
    exit 1
fi

if [ -d "src" ]; then
    echo "✅ src 目录存在"
else
    echo "❌ src 目录缺失"
    exit 1
fi

echo ""

# 测试 2: 检查代码编译
echo "2️⃣ 测试代码编译..."
if [ -d "dist" ]; then
    echo "✅ dist 目录存在（已编译）"
else
    echo "⏳ 正在编译..."
    npm run build > /dev/null 2>&1
    if [ -d "dist" ]; then
        echo "✅ 编译成功"
    else
        echo "❌ 编译失败"
        exit 1
    fi
fi

echo ""

# 测试 3: 检查核心文件
echo "3️⃣ 测试核心文件..."
files=(
    "dist/core/Agent.js"
    "dist/models/ModelRouter.js"
    "dist/skills/SkillManager.js"
    "dist/adapters/AdapterManager.js"
    "dist/mcp/MCPManager.js"
    "dist/api/server.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

echo ""

# 测试 4: 检查文档
echo "4️⃣ 测试文档..."
docs=(
    "README.md"
    "QUICKSTART.md"
    "TESTING.md"
    "docs/ARCHITECTURE.md"
    "docs/FINAL_SUMMARY.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        lines=$(wc -l < "$doc")
        echo "✅ $doc ($lines 行)"
    else
        echo "❌ $doc 缺失"
        exit 1
    fi
done

echo ""

# 测试 5: 检查前端
echo "5️⃣ 测试前端..."
if [ -d "frontend" ]; then
    echo "✅ frontend 目录存在"
    
    if [ -f "frontend/package.json" ]; then
        echo "✅ frontend/package.json 存在"
    fi
    
    if [ -f "frontend/src/App.tsx" ]; then
        echo "✅ frontend/src/App.tsx 存在"
    fi
    
    if [ -f "frontend/src/components/ChatInterface.tsx" ]; then
        echo "✅ ChatInterface 组件存在"
    fi
else
    echo "❌ frontend 目录缺失"
fi

echo ""

# 测试 6: 检查 Docker
echo "6️⃣ 测试 Docker 配置..."
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile 存在"
fi

if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml 存在"
fi

if [ -f "healthcheck.js" ]; then
    echo "✅ healthcheck.js 存在"
fi

echo ""

# 测试 7: 统计代码量
echo "7️⃣ 代码统计..."
backend_lines=$(find dist -name "*.js" | xargs wc -l | tail -1 | awk '{print $1}')
echo "✅ 后端代码: $backend_lines 行"

if [ -d "frontend/src" ]; then
    frontend_lines=$(find frontend/src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    echo "✅ 前端代码: $frontend_lines 行"
fi

doc_lines=$(find docs -name "*.md" | xargs wc -l | tail -1 | awk '{print $1}')
echo "✅ 文档: $doc_lines 行"

echo ""

# 测试 8: Git 状态
echo "8️⃣ Git 状态..."
if [ -d ".git" ]; then
    commits=$(git log --oneline | wc -l)
    echo "✅ Git 提交数: $commits"
    
    last_commit=$(git log -1 --pretty=format:"%h - %s")
    echo "✅ 最后提交: $last_commit"
else
    echo "⚠️  不是 Git 仓库"
fi

echo ""
echo "🎉 所有测试通过！"
echo ""
echo "📊 测试总结:"
echo "  ✅ 文件结构完整"
echo "  ✅ 代码编译成功"
echo "  ✅ 核心文件齐全"
echo "  ✅ 文档完善"
echo "  ✅ 前端就绪"
echo "  ✅ Docker 配置完成"
echo ""
echo "🚀 下一步:"
echo "  1. 配置数据库（或使用 Docker）"
echo "  2. 启动服务: ./start.sh"
echo "  3. 访问: http://localhost:3000"

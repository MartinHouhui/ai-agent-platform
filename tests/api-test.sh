#!/bin/bash

# API 测试脚本

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 开始测试 AI Agent Platform API..."
echo ""

# 测试健康检查
echo "1️⃣ 测试健康检查..."
response=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 健康检查通过${NC}"
    echo "$body" | jq .
else
    echo -e "${RED}✗ 健康检查失败 (HTTP $http_code)${NC}"
fi
echo ""

# 测试聊天 API
echo "2️⃣ 测试聊天 API..."
response=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"帮我查询今天的订单"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 聊天 API 正常${NC}"
    echo "$body" | jq .
else
    echo -e "${RED}✗ 聊天 API 失败 (HTTP $http_code)${NC}"
fi
echo ""

# 测试向导 - 创建会话
echo "3️⃣ 测试向导 - 创建会话..."
response=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/wizard/start \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 向导创建会话成功${NC}"
    session_id=$(echo "$body" | jq -r '.data.sessionId')
    echo "Session ID: $session_id"
    echo "$body" | jq .
else
    echo -e "${RED}✗ 向导创建会话失败 (HTTP $http_code)${NC}"
    exit 1
fi
echo ""

# 测试向导 - 步骤 1: 系统信息
echo "4️⃣ 测试向导 - 步骤 1 (系统信息)..."
response=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/wizard/$session_id/system-info \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试 ERP",
    "type": "erp",
    "description": "测试用的 ERP 系统"
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 步骤 1 完成${NC}"
    echo "$body" | jq .
else
    echo -e "${RED}✗ 步骤 1 失败 (HTTP $http_code)${NC}"
fi
echo ""

# 测试向导 - 步骤 2: API 配置
echo "5️⃣ 测试向导 - 步骤 2 (API 配置)..."
response=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/wizard/$session_id/api-config \
  -H "Content-Type: application/json" \
  -d '{
    "baseUrl": "https://jsonplaceholder.typicode.com",
    "authType": "api_key",
    "apiKey": "test-key-123"
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 步骤 2 完成${NC}"
    echo "$body" | jq .
else
    echo -e "${RED}✗ 步骤 2 失败 (HTTP $http_code)${NC}"
fi
echo ""

# 测试向导 - 步骤 3: API 导入
echo "6️⃣ 测试向导 - 步骤 3 (API 导入)..."
response=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/wizard/$session_id/api-import \
  -H "Content-Type: application/json" \
  -d '{
    "method": "swagger_url",
    "swaggerUrl": "https://petstore.swagger.io/v2/swagger.json"
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 步骤 3 完成${NC}"
    echo "$body" | jq .
else
    echo -e "${RED}✗ 步骤 3 失败 (HTTP $http_code)${NC}"
fi
echo ""

# 测试向导 - 获取进度
echo "7️⃣ 测试向导 - 获取进度..."
response=$(curl -s -w "\n%{http_code}" $BASE_URL/api/wizard/$session_id)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 获取进度成功${NC}"
    echo "$body" | jq .
else
    echo -e "${RED}✗ 获取进度失败 (HTTP $http_code)${NC}"
fi
echo ""

echo "🎉 测试完成！"

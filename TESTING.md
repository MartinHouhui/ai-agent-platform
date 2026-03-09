# 测试指南

## 🧪 快速测试

### 1. 启动服务

\`\`\`bash
# 方式 1: 开发模式（推荐）
npm run dev

# 方式 2: 编译后运行
npm run build
npm start
\`\`\`

### 2. 运行测试脚本

\`\`\`bash
# 赋予执行权限
chmod +x tests/api-test.sh

# 运行测试
./tests/api-test.sh
\`\`\`

---

## 📝 手动测试

### 测试 1: 健康检查

\`\`\`bash
curl http://localhost:3000/health
\`\`\`

**预期响应：**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2026-03-09T15:30:00.000Z",
  "uptime": 123.456
}
\`\`\`

---

### 测试 2: 聊天 API

\`\`\`bash
curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message":"帮我查询今天的订单"}'
\`\`\`

**预期响应：**
\`\`\`json
{
  "success": true,
  "data": "...",
  "metadata": {
    "duration": 123,
    "tools": []
  }
}
\`\`\`

---

### 测试 3: 向导 - 创建会话

\`\`\`bash
curl -X POST http://localhost:3000/api/wizard/start \\
  -H "Content-Type: application/json" \\
  -d '{"userId":"test-user"}'
\`\`\`

**预期响应：**
\`\`\`json
{
  "success": true,
  "data": {
    "sessionId": "xxx-xxx-xxx",
    "currentStep": "system_info",
    "stepName": "系统信息"
  }
}
\`\`\`

---

### 测试 4: 向导 - 完整流程

\`\`\`bash
# 1. 创建会话
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/wizard/start \\
  -H "Content-Type: application/json" \\
  -d '{"userId":"test"}' | jq -r '.data.sessionId')

echo "Session ID: $SESSION_ID"

# 2. 步骤 1: 系统信息
curl -X POST http://localhost:3000/api/wizard/$SESSION_ID/system-info \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "测试 ERP",
    "type": "erp",
    "description": "测试系统"
  }'

# 3. 步骤 2: API 配置
curl -X POST http://localhost:3000/api/wizard/$SESSION_ID/api-config \\
  -H "Content-Type: application/json" \\
  -d '{
    "baseUrl": "https://jsonplaceholder.typicode.com",
    "authType": "api_key",
    "apiKey": "test-key"
  }'

# 4. 步骤 3: API 导入
curl -X POST http://localhost:3000/api/wizard/$SESSION_ID/api-import \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "swagger_url",
    "swaggerUrl": "https://petstore.swagger.io/v2/swagger.json"
  }'

# 5. 查看进度
curl http://localhost:3000/api/wizard/$SESSION_ID
\`\`\`

---

## 🐛 常见问题

### 1. 端口被占用

\`\`\`bash
# 查找占用端口的进程
lsof -i :3000

# 杀掉进程
kill -9 <PID>
\`\`\`

### 2. 数据库连接失败

\`\`\`bash
# 检查 MySQL 是否运行
mysql -u root -p -e "SELECT 1"

# 创建数据库
mysql -u root -p -e "CREATE DATABASE ai_agent_platform CHARACTER SET utf8mb4"
\`\`\`

### 3. API Key 无效

- 不配置 API Key 也可以运行（使用模拟响应）
- 要使用真实模型，需要配置 `.env` 文件

---

## 📊 性能测试

\`\`\`bash
# 使用 ab (Apache Bench)
ab -n 100 -c 10 http://localhost:3000/health

# 使用 wrk
wrk -t4 -c100 -d30s http://localhost:3000/health
\`\`\`

---

## 🔍 调试

### 查看日志

\`\`\`bash
# 实时查看日志
tail -f logs/combined.log

# 查看错误日志
tail -f logs/error.log
\`\`\`

### 启用详细日志

\`\`\`bash
LOG_LEVEL=debug npm run dev
\`\`\`

---

## 📦 测试数据

### 测试 API（公开）

可以使用这些公开 API 测试：

1. **JSONPlaceholder**（假数据）
   - URL: https://jsonplaceholder.typicode.com
   - 无需认证

2. **Petstore**（Swagger 示例）
   - URL: https://petstore.swagger.io
   - Swagger: https://petstore.swagger.io/v2/swagger.json

3. **ReqRes**（测试 API）
   - URL: https://reqres.in
   - 无需认证

---

## ✅ 测试检查清单

- [ ] 服务启动成功
- [ ] 健康检查通过
- [ ] 聊天 API 正常
- [ ] 向导创建会话成功
- [ ] 向导步骤 1-7 完成
- [ ] 代码生成正常
- [ ] 测试执行成功

---

**完成所有测试后，系统就可以投入使用了！🎉**

# AI Agent Platform - 部署文档

## 🐳 Docker 部署（推荐）

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/MartinHouhui/ai-agent-platform.git
cd ai-agent-platform

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置必要的参数

# 3. 一键启动（包含 MySQL + Redis + App + Frontend）
docker-compose up -d

# 4. 查看日志
docker-compose logs -f app

# 5. 访问应用
# 前端: http://localhost:5173
# 后端 API: http://localhost:3000
# API 文档: http://localhost:3000/api-docs
```

### 单独启动服务

```bash
# 只启动数据库
docker-compose up -d mysql redis

# 只启动应用
docker-compose up -d app

# 只启动前端
docker-compose up -d frontend
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（清空数据库）
docker-compose down -v
```

---

## 📦 手动部署

### 1. 安装依赖

```bash
# 后端
npm install

# 前端
cd frontend
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=ai_agent_platform
DB_USERNAME=ai_agent
DB_PASSWORD=ai_agent123456

# JWT 配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# 应用配置
NODE_ENV=production
PORT=3000

# 模型配置
GLM_API_KEY=your-glm-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. 初始化数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE ai_agent_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 创建用户
mysql -u root -p -e "CREATE USER 'ai_agent'@'localhost' IDENTIFIED BY 'ai_agent123456';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON ai_agent_platform.* TO 'ai_agent'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

### 4. 构建和启动

```bash
# 构建后端
npm run build

# 启动后端
npm start

# 构建前端
cd frontend
npm run build

# 启动前端（使用 nginx 或其他 web 服务器）
```

---

## 🔧 配置说明

### 数据库配置

支持三种数据库：
- **MySQL**（推荐生产环境）
- **PostgreSQL**
- **SQLite**（开发环境）

```env
# MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306

# PostgreSQL
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432

# SQLite
DB_TYPE=sqlite
DB_DATABASE=data/ai_agent_platform.db
```

### JWT 配置

```env
JWT_SECRET=your-secret-key-here  # 建议使用强密码
JWT_EXPIRES_IN=7d                # Token 过期时间
```

### 模型配置

```env
# 智谱 GLM（推荐）
GLM_API_KEY=your-glm-api-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# 阿里云通义千问
QWEN_API_KEY=your-qwen-api-key
```

---

## 🔐 安全建议

### 生产环境检查清单

- [ ] 修改默认管理员密码
- [ ] 使用强密码作为 JWT_SECRET
- [ ] 配置 HTTPS（使用 nginx 或 traefik）
- [ ] 配置防火墙规则
- [ ] 启用数据库备份
- [ ] 配置日志轮转
- [ ] 设置资源限制（CPU/内存）

### 修改管理员密码

```bash
# 登录应用
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'

# 修改密码（使用返回的 token）
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"admin123456","newPassword":"your-strong-password"}'
```

---

## 📊 监控和日志

### 查看日志

```bash
# Docker 日志
docker-compose logs -f app

# 应用日志（如果配置了）
tail -f logs/app.log
```

### 健康检查

```bash
# 后端健康检查
curl http://localhost:3000/health

# Docker 健康检查
docker ps
```

---

## 🔄 备份和恢复

### 备份 MySQL 数据

```bash
# 备份
docker exec ai-agent-mysql mysqldump -u root -proot123456 ai_agent_platform > backup.sql

# 恢复
docker exec -i ai-agent-mysql mysql -u root -proot123456 ai_agent_platform < backup.sql
```

---

## 🚀 性能优化

### Docker 优化

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_skill_status ON skills(status);
```

---

## ❓ 常见问题

### 1. 数据库连接失败

```bash
# 检查 MySQL 是否运行
docker-compose ps mysql

# 查看 MySQL 日志
docker-compose logs mysql

# 重启 MySQL
docker-compose restart mysql
```

### 2. 前端无法访问后端 API

检查 CORS 配置和 nginx 代理设置。

### 3. 内存不足

增加 Docker 内存限制或优化应用代码。

---

## 📞 支持

如有问题，请提交 Issue: https://github.com/MartinHouhui/ai-agent-platform/issues

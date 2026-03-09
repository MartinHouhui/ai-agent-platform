# AI Agent Platform - 快速开始

## 🚀 5 分钟启动指南

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置环境变量

\`\`\`bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
\`\`\`

**最小配置：**
- `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` - MySQL 数据库
- `OPENAI_API_KEY` - OpenAI API（可选，不填会使用模拟响应）
- `ALIBABA_API_KEY` - 通义千问（可选）
- `ZHIPU_API_KEY` - GLM（可选）

### 3. 创建数据库

\`\`\`bash
mysql -u root -p
CREATE DATABASE ai_agent_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

### 4. 启动服务

\`\`\`bash
npm run dev
\`\`\`

### 5. 测试 API

\`\`\`bash
# 健康检查
curl http://localhost:3000/health

# 发送消息
curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message":"帮我查询今天的订单"}'
\`\`\`

---

## 📚 开发指南

### 项目结构

\`\`\`
ai-agent-platform/
├── src/
│   ├── core/           # 核心引擎
│   │   ├── Agent.ts    # Agent 主类
│   │   └── types.ts    # 类型定义
│   ├── models/         # 模型提供商
│   │   ├── ModelRouter.ts
│   │   └── providers/
│   │       ├── OpenAIProvider.ts
│   │       ├── QwenProvider.ts
│   │       └── GLMProvider.ts
│   ├── skills/         # 技能系统
│   │   ├── SkillManager.ts
│   │   └── examples/
│   │       └── QueryOrderSkill.ts
│   ├── adapters/       # 适配器
│   │   ├── AdapterManager.ts
│   │   └── RESTAdapter.ts
│   ├── mcp/           # MCP 工具
│   │   └── MCPManager.ts
│   ├── entities/      # 数据库实体
│   │   ├── SkillEntity.ts
│   │   ├── LearningCaseEntity.ts
│   │   └── AdapterConfigEntity.ts
│   ├── api/           # HTTP API
│   │   └── server.ts
│   ├── config/        # 配置
│   │   └── database.ts
│   └── utils/         # 工具类
│       └── logger.ts
├── docs/              # 文档
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
└── package.json
\`\`\`

### 常用命令

\`\`\`bash
# 开发模式
npm run dev

# 编译
npm run build

# 生产模式
npm start

# 代码检查
npm run lint

# 格式化代码
npm run format
\`\`\`

---

## 🔧 对接业务系统

### 方式 1：使用 RESTAdapter（推荐）

\`\`\`typescript
import { RESTAdapter } from './adapters/RESTAdapter';
import { adapterManager } from './adapters/AdapterManager';

// 创建适配器
const erpAdapter = new RESTAdapter('natural-erp');

// 初始化
await erpAdapter.init({
  name: 'natural-erp',
  type: 'erp',
  baseUrl: 'https://erp.natural.com/api',
  apiKey: 'your-api-key',
});

// 注册
adapterManager.registerAdapter(erpAdapter);

// 使用
const orders = await erpAdapter.call('GET /orders', { status: 'pending' });
\`\`\`

### 方式 2：自动发现

\`\`\`bash
# POST /api/discover
curl -X POST http://localhost:3000/api/discover \\
  -H "Content-Type: application/json" \\
  -d '{
    "systemName": "natural-erp",
    "apiDocs": "https://erp.natural.com/swagger.json"
  }'
\`\`\`

---

## 🎓 添加新 Skill

\`\`\`typescript
import { SkillDefinition } from './core/types';

const MySkill: SkillDefinition = {
  id: 'my-skill-v1',
  name: '我的技能',
  version: '1.0.0',
  description: '技能描述',
  
  triggers: {
    intent: /关键词/i,
    domain: 'domain-name',
  },
  
  executor: {
    type: 'code',
    code: \`
      async function execute(params, { adapters, logger }) {
        // 你的代码
        return { success: true, data: {} };
      }
    \`
  },
  
  metadata: {
    createdAt: new Date(),
    learnedFrom: 'manual',
    successRate: 1.0,
    usageCount: 0,
  },
};

// 注册
skillManager.registerSkill(MySkill);
\`\`\`

---

## 🐛 常见问题

### 1. 数据库连接失败
- 检查 MySQL 是否启动
- 检查 `.env` 中的数据库配置
- 确保数据库已创建

### 2. 模型调用失败
- 检查 API Key 是否正确
- 检查网络连接
- 查看日志了解详细错误

### 3. TypeScript 编译错误
- 运行 `npm run build` 查看详细错误
- 检查类型定义

---

## 📞 获取帮助

- 查看文档：`docs/` 目录
- 查看日志：`logs/` 目录
- 提交 Issue：GitHub Issues

---

**下一步：**
1. 配置你的业务系统 API
2. 创建自定义 Skills
3. 集成到你的应用中

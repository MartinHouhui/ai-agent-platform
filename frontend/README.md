# AI Agent Platform Frontend

React + TypeScript + Vite + Ant Design

## 🚀 快速开始

### 开发环境

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
\`\`\`

### 生产构建

\`\`\`bash
npm run build
npm run preview
\`\`\`

---

## 📦 功能模块

### 1. 💬 对话界面 (`ChatInterface`)
- 实时聊天
- 消息气泡
- AI 响应展示
- 历史记录

### 2. 🧙 适配向导 (`WizardFlow`)
- 7 步向导流程
- 系统信息配置
- API 配置
- 文档导入
- AI 分析
- 功能选择
- 代码生成
- 测试部署

### 3. 🛠️ Skills 管理 (`SkillsManager`)
- Skills 列表
- 创建/编辑/删除
- 代码预览
- 测试运行

---

## 🎨 技术栈

- **React 18** - UI 框架
- **TypeScript 5** - 类型安全
- **Vite 6** - 构建工具
- **Ant Design 5** - UI 组件库
- **Axios** - HTTP 客户端

---

## 📁 项目结构

\`\`\`
frontend/
├── src/
│   ├── components/      # UI 组件
│   │   ├── ChatInterface.tsx
│   │   ├── WizardFlow.tsx
│   │   └── SkillsManager.tsx
│   ├── services/        # API 服务
│   │   └── api.ts
│   ├── types/           # 类型定义
│   │   └── index.ts
│   ├── App.tsx          # 主应用
│   └── main.tsx         # 入口
├── public/
├── index.html
└── package.json
\`\`\`

---

## 🌐 API 配置

创建 \`.env\` 文件：

\`\`\`env
VITE_API_URL=http://localhost:3000
\`\`\`

---

## 🎯 开发进度

- [x] 聊天界面
- [x] 向导流程 UI
- [x] Skills 管理界面
- [ ] 适配器配置界面
- [ ] 设置页面
- [ ] 用户认证
- [ ] 响应式优化

---

## 📝 待办事项

1. **优化向导流程**
   - [ ] 添加进度保存
   - [ ] 实现真实的 API 调用
   - [ ] 添加代码高亮

2. **完善 Skills 管理**
   - [ ] 实现编辑功能
   - [ ] 添加代码编辑器
   - [ ] 测试功能

3. **用户体验优化**
   - [ ] 添加加载动画
   - [ ] 优化错误提示
   - [ ] 添加快捷键

---

## 🐛 已知问题

- 向导流程需要连接真实后端
- Skills 管理需要实现 CRUD
- 缺少用户认证

---

## 📖 使用指南

### 启动前端

\`\`\`bash
npm run dev
\`\`\`

### 启动后端

\`\`\`bash
cd ../
./start.sh
\`\`\`

### 测试功能

1. 访问 http://localhost:5173
2. 点击左侧菜单切换页面
3. 测试聊天功能
4. 尝试向导流程

---

## 🚀 部署

### 构建

\`\`\`bash
npm run build
\`\`\`

### Nginx 配置

\`\`\`nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    root /path/to/frontend/dist;
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
\`\`\`

---

**前端开发完成度: 70%**

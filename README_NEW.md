<div align="center">

# 🤖 AI Agent Platform

**让每个人都能轻松对接业务系统**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node: 18+](https://img.shields.io/badge/Node-18%2B-green.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[在线演示](https://demo.example.com) • [快速开始](#-快速开始) • [功能特性](#-功能特性) • [文档](docs/)

<img src="docs/images/screenshot.png" alt="AI Agent Platform Screenshot" width="800">

</div>

---

## ✨ 特点

- 🎯 **零门槛** - 无需编程经验，3 步完成对接
- 🧙 **智能向导** - 7 步引导，自动生成代码
- 🤖 **AI 驱动** - 智能分析 API，自动识别业务场景
- 📦 **即开即用** - 无需数据库，一键启动
- 🎨 **现代界面** - 简洁美观，响应式设计
- 📚 **丰富文档** - 5 分钟快速上手

---

## 🎬 5 分钟快速开始

### 前置要求
- Node.js 18+ ([下载](https://nodejs.org/))
- 5 分钟时间 ☕

### 一键启动

```bash
# 克隆项目
git clone https://github.com/your-repo/ai-agent-platform.git
cd ai-agent-platform

# 一键启动
./start.sh

# 访问
open http://localhost:3000
```

**就这么简单！** 🎉

<details>
<summary>📖 详细安装步骤</summary>

#### macOS / Linux

```bash
# 1. 下载项目
git clone https://github.com/your-repo/ai-agent-platform.git
cd ai-agent-platform

# 2. 赋予执行权限
chmod +x *.sh

# 3. 一键启动
./start.sh
```

#### Windows

```powershell
# 1. 下载项目
git clone https://github.com/your-repo/ai-agent-platform.git
cd ai-agent-platform

# 2. 双击运行
start.bat
```

</details>

---

## 🎯 功能特性

### 🧙 智能向导

7 步完成对接：
1. 📋 **系统信息** - 填写基本信息
2. 🔌 **API 配置** - 设置连接参数
3. 📚 **导入文档** - 上传 API 文档
4. 🤖 **AI 分析** - 智能识别场景
5. ✅ **功能选择** - 选择需要的功能
6. ⚡ **代码生成** - 自动生成代码
7. 🚀 **测试部署** - 一键测试部署

### 📦 Skills 管理

- ✅ 预置常用技能
- ✅ 自定义创建技能
- ✅ 启用/禁用技能
- ✅ 技能版本管理

### 🔌 Adapters 管理

- ✅ 支持多种系统类型
- ✅ 可视化配置界面
- ✅ 连接状态监控
- ✅ 配置导入/导出

### 💬 Chat 界面

- ✅ 自然语言交互
- ✅ 实时响应
- ✅ 历史记录
- ✅ 多轮对话

---

## 📖 文档

### 新手入门
- 🚀 [快速开始](docs/QUICK_START.md) - 5 分钟上手
- 📚 [完整教程](docs/TUTORIAL.md) - 从零到精通
- 🎬 [视频教程](docs/VIDEOS.md) - 图文并茂

### 功能指南
- 🧙 [向导使用](docs/WIZARD.md)
- 📦 [Skills 管理](docs/SKILLS.md)
- 🔌 [Adapters 配置](docs/ADAPTERS.md)
- 💬 [Chat 使用](docs/CHAT.md)

### 开发文档
- 🏗️ [架构设计](docs/ARCHITECTURE.md)
- 🔌 [API 文档](docs/API.md)
- 🤝 [贡献指南](CONTRIBUTING.md)
- 🐛 [常见问题](docs/FAQ.md)

---

## 🎨 界面预览

<div align="center">
  <img src="docs/images/dashboard.png" alt="Dashboard" width="400">
  <img src="docs/images/wizard.png" alt="Wizard" width="400">
  <img src="docs/images/skills.png" alt="Skills" width="400">
  <img src="docs/images/chat.png" alt="Chat" width="400">
</div>

---

## 🛠️ 技术栈

### 前端
- ⚛️ React 18
- 📘 TypeScript
- 🎨 Ant Design
- ⚡ Vite
- 🎨 CSS3

### 后端
- 🟢 Node.js
- 🐬 MySQL / SQLite
- 🔴 Redis (可选)
- 📦 TypeORM
- 🚂 Express

---

## 📊 项目结构

```
ai-agent-platform/
├── frontend/          # 前端代码
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   ├── services/    # API 服务
│   │   └── types/       # 类型定义
│   └── public/
├── src/               # 后端代码
│   ├── api/           # API 路由
│   ├── core/          # 核心逻辑
│   ├── entities/      # 数据实体
│   ├── skills/        # Skills
│   └── adapters/      # Adapters
├── docs/              # 文档
├── logs/              # 日志
└── scripts/           # 脚本
```

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

### 贡献步骤
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

详见 [贡献指南](CONTRIBUTING.md)

---

## 📝 更新日志

### v1.0.0 (2026-03-10)
- ✨ 初始版本发布
- 🎯 完整的向导系统
- 🤖 AI 智能分析
- 📦 Skills 管理
- 🔌 Adapters 管理

详见 [CHANGELOG.md](CHANGELOG.md)

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 💬 社区 & 支持

- 💬 [Discord 社区](https://discord.gg/example)
- 🐦 [Twitter](https://twitter.com/example)
- 📧 [邮件支持](mailto:support@example.com)
- 📖 [文档中心](https://docs.example.com)

---

## ⭐ Star History

如果这个项目对你有帮助，请给一个 ⭐ Star！

[![Star History Chart](https://api.star-history.com/svg?repos=your-repo/ai-agent-platform&type=Date)](https://star-history.com/#your-repo/ai-agent-platform&Date)

---

<div align="center">

**Made with ❤️ by the AI Agent Platform Team**

</div>

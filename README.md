# AI Agent Platform

🤖 一个可自主进化的 AI Agent 平台，能够快速对接业务系统、适配多个大模型、生成动态页面。

## 核心特性

- **🔄 自主进化** - AI 自主学习对接新业务系统，经验沉淀为 Skill
- **🌐 多模型适配** - 统一接口支持 GPT、Claude、Gemini、国产模型
- **📊 动态页面生成** - 根据业务数据自动生成个性化展现
- **🎥 会议支持** - 集成 ASR/TTS，支持会议助手
- **🔌 MCP + Skills** - 标准化工具协议 + 可复用技能

## 架构概览

```
展现层 → Agent 核心 → 统一能力层 → 多模型层 → 业务系统
```

详细架构见 [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev

# 运行测试
npm test
```

## 项目状态

🚧 **MVP 开发中** - 当前阶段：核心框架搭建

## License

MIT

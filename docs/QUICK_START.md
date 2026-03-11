# 🚀 快速开始指南

> 5 分钟快速上手 AI Agent Platform

## 📋 准备工作

### 你需要：
- ✅ 一台电脑（Windows/Mac/Linux 都可以）
- ✅ 已安装 Node.js 18+ ([下载地址](https://nodejs.org/))
- ✅ 一个浏览器（Chrome/Edge/Safari 都可以）

### 检查 Node.js
打开终端/命令行，输入：
```bash
node -v
```
看到版本号（如 v18.0.0 或更高）就说明已安装 ✅

---

## 🎯 3 步开始使用

### 第 1 步：下载项目

**方式 1：克隆 Git 仓库**
```bash
git clone https://github.com/your-repo/ai-agent-platform.git
cd ai-agent-platform
```

**方式 2：下载 ZIP**
1. 点击项目页面的 "Download ZIP"
2. 解压到任意文件夹
3. 打开终端，进入该文件夹

---

### 第 2 步：一键启动

**macOS / Linux:**
```bash
./start.sh
```

**Windows:**
```bash
# 双击运行 start.bat
# 或在 PowerShell 中运行：
.\start.bat
```

**看到这个画面就成功了：**
```
✅ 启动成功！

🌐 访问地址:
   http://localhost:3000
```

---

### 第 3 步：打开浏览器

在浏览器中访问：
```
http://localhost:3000
```

**首次打开会看到欢迎引导**，按照提示操作即可！

---

## 🎓 3 分钟学会使用

### 功能 1：查看已对接的系统

1. 点击左侧菜单的 **"Adapters"**
2. 可以看到所有已对接的系统
3. 点击系统名称查看详情

### 功能 2：创建新的对接

1. 点击左侧菜单的 **"Wizard"**（向导）
2. 按照 7 个步骤操作：
   - 📋 填写系统信息
   - 🔌 配置 API
   - 📚 导入文档
   - 🤖 AI 分析
   - ✅ 选择功能
   - ⚡ 生成代码
   - 🚀 测试部署

### 功能 3：管理 Skills（技能）

1. 点击左侧菜单的 **"Skills"**
2. 查看所有可用的技能
3. 可以启用/禁用/编辑技能

---

## 💡 常见问题

### Q1: 启动失败怎么办？

**检查端口是否被占用：**
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

**解决方法：**
1. 关闭占用端口的程序
2. 或修改 `simple-server.js` 中的端口号

---

### Q2: 浏览器打不开页面？

**检查服务是否运行：**
```bash
curl http://localhost:3000/health
```

**看到这个说明正常：**
```json
{"status":"ok","timestamp":"..."}
```

**如果没反应：**
1. 检查终端是否有错误信息
2. 查看 `logs/backend.log` 文件
3. 重新运行 `./start.sh`

---

### Q3: 如何停止服务？

**方式 1：使用停止脚本**
```bash
./stop.sh
```

**方式 2：手动停止**
```bash
# 查找进程
ps aux | grep node

# 停止进程
pkill -f "node.*simple-server"
```

---

### Q4: 如何更新到最新版本？

```bash
git pull
./stop.sh
./start.sh
```

---

## 🎯 下一步

### 深入学习
- 📖 [完整功能文档](./docs/FEATURES.md)
- 🎬 [视频教程](./docs/TUTORIALS.md)
- 💡 [最佳实践](./docs/BEST_PRACTICES.md)

### 对接你的第一个系统
1. 准备好系统的 API 文档
2. 获取 API Key
3. 使用向导快速对接

### 加入社区
- 💬 [Discord 社区](https://discord.gg/example)
- 🐛 [问题反馈](https://github.com/issues)
- 📧 [邮件联系](mailto:support@example.com)

---

## 🆘 需要帮助？

### 在线支持
- 💬 点击页面右上角的 **"?"** 按钮
- 📧 发送邮件到：support@example.com
- 💬 Discord: https://discord.gg/example

### 离线文档
- 📁 查看 `docs/` 文件夹
- 📄 阅读 `README.md`
- 🎬 查看 `tutorials/` 视频

---

## ✅ 恭喜！

你已经学会了基础使用！

**接下来：**
- 🎯 对接你的第一个系统
- 📚 学习更多高级功能
- 🤝 分享你的经验

**记住：**
> 遇到任何问题，都可以点击右上角的 **"?"** 获取帮助！

---

**祝你使用愉快！** 🎉

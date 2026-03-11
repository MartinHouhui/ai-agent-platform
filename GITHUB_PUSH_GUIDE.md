# GitHub 推送指南

## 🚀 快速推送（3 步）

### 步骤 1: 创建 GitHub 仓库

访问：https://github.com/new

填写信息：
- **Repository name**: `ai-agent-platform`
- **Description**: `🤖 AI Agent Platform - 可自主进化的业务系统对接平台`
- **Public** 或 **Private**（任选）
- ⚠️ **不要勾选** "Add a README file"

点击 **Create repository**

---

### 步骤 2: 添加远程仓库

创建完成后，GitHub 会显示仓库地址，类似：
```
https://github.com/YOUR_USERNAME/ai-agent-platform.git
```

运行以下命令（替换 `YOUR_USERNAME` 为你的用户名）：

```bash
cd ~/clawd/ai-agent-platform

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ai-agent-platform.git

# 确保分支名为 main
git branch -M main
```

---

### 步骤 3: 推送代码

```bash
# 推送所有提交
git push -u origin main
```

---

## 🎯 完整命令（复制粘贴）

```bash
cd ~/clawd/ai-agent-platform

# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/ai-agent-platform.git
git branch -M main
git push -u origin main
```

---

## 🔐 使用 SSH（推荐）

如果你想使用 SSH 而不是 HTTPS：

```bash
# 使用 SSH 地址
git remote add origin git@github.com:YOUR_USERNAME/ai-agent-platform.git
git branch -M main
git push -u origin main
```

---

## 📊 推送内容统计

推送内容：
- ✅ 12 个 Git 提交
- ✅ 8,551 行代码
- ✅ 40,000+ 字文档
- ✅ 18 个 API 端点
- ✅ 5 个前端页面
- ✅ 完整的测试套件

---

## 🎉 推送后

访问你的仓库：
```
https://github.com/YOUR_USERNAME/ai-agent-platform
```

建议添加：
1. **Topics**: `ai`, `agent`, `typescript`, `react`, `docker`
2. **About**: 添加项目描述和网站链接
3. **README**: 已经有完整的 README.md

---

## 📝 后续更新

以后更新代码只需：

```bash
git add .
git commit -m "更新说明"
git push
```

---

## 🆘 遇到问题？

### 问题 1: remote origin already exists
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ai-agent-platform.git
```

### 问题 2: 推送被拒绝
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 问题 3: 认证失败
- 使用 Personal Access Token
- 或配置 SSH Key

---

## 🎁 仓库徽章

推送后可以在 README.md 添加徽章：

```markdown
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/ai-agent-platform?style=social)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/ai-agent-platform?style=social)
![GitHub license](https://img.shields.io/github/license/YOUR_USERNAME/ai-agent-platform)
```

---

**准备好了吗？开始推送吧！🚀**

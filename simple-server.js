// AI Agent Platform - 稳定版简化后端
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据持久化
const DATA_FILE = path.join(__dirname, '../data/app-data.json');
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 加载数据
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('加载数据失败:', error);
  }
  return {
    skills: [
      { id: '1', name: '查询订单', description: '查询订单信息', type: 'query', status: 'active', createdAt: new Date().toISOString() },
      { id: '2', name: '创建订单', description: '创建新订单', type: 'create', status: 'active', createdAt: new Date().toISOString() },
      { id: '3', name: '更新订单', description: '更新订单状态', type: 'update', status: 'active', createdAt: new Date().toISOString() },
    ],
    adapters: [
      { id: '1', name: 'ERP 系统', type: 'erp', baseUrl: 'https://erp.example.com', status: 'connected', createdAt: new Date().toISOString() },
      { id: '2', name: 'CRM 系统', type: 'crm', baseUrl: 'https://crm.example.com', status: 'connected', createdAt: new Date().toISOString() },
    ],
    wizardSessions: [],
    chatHistory: [],
  };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

let appData = loadData();

// ============ API 路由 ============

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'AI Agent Platform',
    features: {
      skills: appData.skills.length,
      adapters: appData.adapters.length,
      persistence: 'json-file',
    },
  });
});

// Stats
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      skills: appData.skills.length,
      activeSkills: appData.skills.filter(s => s.status === 'active').length,
      adapters: appData.adapters.length,
      connectedAdapters: appData.adapters.filter(a => a.status === 'connected').length,
      chatMessages: appData.chatHistory.length,
      wizardSessions: appData.wizardSessions.length,
    },
  });
});

// Skills API
app.get('/api/skills', (req, res) => {
  res.json({ success: true, data: appData.skills });
});

app.get('/api/skills/:id', (req, res) => {
  const skill = appData.skills.find(s => s.id === req.params.id);
  if (skill) {
    res.json({ success: true, data: skill });
  } else {
    res.status(404).json({ success: false, error: 'Skill not found' });
  }
});

app.post('/api/skills', (req, res) => {
  const skill = {
    id: Date.now().toString(),
    ...req.body,
    status: req.body.status || 'active',
    createdAt: new Date().toISOString(),
  };
  appData.skills.push(skill);
  saveData(appData);
  res.json({ success: true, data: skill });
});

app.put('/api/skills/:id', (req, res) => {
  const index = appData.skills.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    appData.skills[index] = {
      ...appData.skills[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    saveData(appData);
    res.json({ success: true, data: appData.skills[index] });
  } else {
    res.status(404).json({ success: false, error: 'Skill not found' });
  }
});

app.delete('/api/skills/:id', (req, res) => {
  const index = appData.skills.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    appData.skills.splice(index, 1);
    saveData(appData);
    res.json({ success: true, message: 'Skill deleted' });
  } else {
    res.status(404).json({ success: false, error: 'Skill not found' });
  }
});

// Adapters API
app.get('/api/adapters', (req, res) => {
  res.json({ success: true, data: appData.adapters });
});

app.get('/api/adapters/:id', (req, res) => {
  const adapter = appData.adapters.find(a => a.id === req.params.id);
  if (adapter) {
    res.json({ success: true, data: adapter });
  } else {
    res.status(404).json({ success: false, error: 'Adapter not found' });
  }
});

app.post('/api/adapters', (req, res) => {
  const adapter = {
    id: Date.now().toString(),
    ...req.body,
    status: req.body.status || 'connected',
    createdAt: new Date().toISOString(),
  };
  appData.adapters.push(adapter);
  saveData(appData);
  res.json({ success: true, data: adapter });
});

app.put('/api/adapters/:id', (req, res) => {
  const index = appData.adapters.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    appData.adapters[index] = {
      ...appData.adapters[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    saveData(appData);
    res.json({ success: true, data: appData.adapters[index] });
  } else {
    res.status(404).json({ success: false, error: 'Adapter not found' });
  }
});

app.delete('/api/adapters/:id', (req, res) => {
  const index = appData.adapters.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    appData.adapters.splice(index, 1);
    saveData(appData);
    res.json({ success: true, message: 'Adapter deleted' });
  } else {
    res.status(404).json({ success: false, error: 'Adapter not found' });
  }
});

// Chat API
app.post('/api/chat', (req, res) => {
  const { message, context } = req.body;
  const chatMessage = {
    id: Date.now().toString(),
    message,
    context,
    timestamp: new Date().toISOString(),
    response: `收到消息: ${message}`,
  };
  appData.chatHistory.push(chatMessage);
  saveData(appData);
  res.json({
    success: true,
    response: chatMessage.response,
    timestamp: chatMessage.timestamp,
  });
});

app.get('/api/chat/history', (req, res) => {
  res.json({ success: true, data: appData.chatHistory });
});

// Wizard API
app.post('/api/wizard/start', (req, res) => {
  const session = {
    id: Date.now().toString(),
    step: 0,
    data: req.body,
    createdAt: new Date().toISOString(),
  };
  appData.wizardSessions.push(session);
  saveData(appData);
  res.json({
    success: true,
    sessionId: session.id,
    message: '向导会话已创建',
    currentStep: 0,
  });
});

app.get('/api/wizard/:sessionId', (req, res) => {
  const session = appData.wizardSessions.find(s => s.id === req.params.sessionId);
  if (session) {
    res.json({ success: true, data: session });
  } else {
    res.status(404).json({ success: false, error: 'Session not found' });
  }
});

app.post('/api/wizard/:sessionId/next', (req, res) => {
  const session = appData.wizardSessions.find(s => s.id === req.params.sessionId);
  if (session) {
    session.step = (session.step || 0) + 1;
    session.data = { ...session.data, ...req.body };
    saveData(appData);
    res.json({
      success: true,
      currentStep: session.step,
      message: '步骤已完成',
    });
  } else {
    res.status(404).json({ success: false, error: 'Session not found' });
  }
});

// 静态文件服务（前端）
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
✅ AI Agent Platform 已启动！

🌐 访问地址:
   http://localhost:${PORT}

📖 API 端点:
   健康检查: GET  http://localhost:${PORT}/health
   统计信息: GET  http://localhost:${PORT}/api/stats
   Skills:   GET/POST/PUT/DELETE http://localhost:${PORT}/api/skills
   Adapters: GET/POST/PUT/DELETE http://localhost:${PORT}/api/adapters
   Chat:     POST http://localhost:${PORT}/api/chat
   Wizard:   POST http://localhost:${PORT}/api/wizard/start

💾 数据持久化:
   数据文件: ${DATA_FILE}
   自动保存: ✅ 启用

💡 提示:
   - 数据会自动保存到 JSON 文件
   - 重启后数据不会丢失
   - 支持完整的 CRUD 操作
  `);
});

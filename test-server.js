// 简单的后端测试服务器
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'AI Agent Platform Backend'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ 服务器运行在端口 ${PORT}`);
    console.log(`📖 健康检查: http://localhost:${PORT}/health`);
    console.log(`🧪 测试 API: http://localhost:${PORT}/api/test`);
});

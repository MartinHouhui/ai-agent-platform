// AI Agent Platform - MySQL 版本（稳定版）
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME || 'ai_agent',
  password: process.env.DB_PASSWORD || 'ai_agent123456',
  database: process.env.DB_DATABASE || 'ai_agent_platform',
  waitForConnections: true,
  connectionLimit: 10,
});

// 初始化数据库表
async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    // 创建 skills 表（使用反引号避免关键字冲突）
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS skills (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        version VARCHAR(20),
        description TEXT,
        system_type VARCHAR(50),
        domain VARCHAR(50),
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_system (system_type),
        INDEX idx_domain (domain)
      )
    `);

    // 创建 adapters 表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS adapters (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50),
        baseUrl VARCHAR(255),
        config JSON,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ 数据库表初始化成功');
  } finally {
    connection.release();
  }
}

// ============ API 路由 ============

// 健康检查
app.get('/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      message: 'AI Agent Platform (MySQL)',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Skills API
app.get('/api/skills', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM skills WHERE isActive = TRUE');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取 Skills 失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const { id, name, version, description, system_type, domain } = req.body;
    const skillId = id || Date.now().toString();
    
    await pool.execute(
      'INSERT INTO skills (id, name, version, description, system_type, domain) VALUES (?, ?, ?, ?, ?, ?)',
      [skillId, name, version || '1.0.0', description, system_type, domain]
    );
    
    const [rows] = await pool.execute('SELECT * FROM skills WHERE id = ?', [skillId]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('创建 Skill 失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, version, description, system_type, domain } = req.body;
    
    await pool.execute(
      'UPDATE skills SET name = ?, version = ?, description = ?, system_type = ?, domain = ? WHERE id = ?',
      [name, version, description, system_type, domain, id]
    );
    
    const [rows] = await pool.execute('SELECT * FROM skills WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('更新 Skill 失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE skills SET isActive = FALSE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    console.error('删除 Skill 失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Adapters API
app.get('/api/adapters', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM adapters WHERE isActive = TRUE');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取 Adapters 失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/adapters', async (req, res) => {
  try {
    const { id, name, type, baseUrl, config } = req.body;
    const adapterId = id || Date.now().toString();
    
    await pool.execute(
      'INSERT INTO adapters (id, name, type, baseUrl, config) VALUES (?, ?, ?, ?, ?)',
      [adapterId, name, type, baseUrl, JSON.stringify(config || {})]
    );
    
    const [rows] = await pool.execute('SELECT * FROM adapters WHERE id = ?', [adapterId]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('创建 Adapter 失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/adapters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE adapters SET isActive = FALSE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Adapter deleted' });
  } catch (error) {
    console.error('删除 Adapter 失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    res.json({
      success: true,
      response: `收到消息: ${message}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat 失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Wizard API
app.post('/api/wizard/start', async (req, res) => {
  try {
    res.json({
      success: true,
      sessionId: Date.now().toString(),
      message: '向导已启动',
      currentStep: 0,
    });
  } catch (error) {
    console.error('启动向导失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    console.log('🔧 初始化数据库...');
    await initDatabase();
    
    console.log('🚀 启动服务器...');
    app.listen(PORT, () => {
      console.log(`
✅ AI Agent Platform (MySQL) 已启动！

🌐 访问地址: http://localhost:${PORT}

📖 API 端点:
   健康检查: GET  http://localhost:${PORT}/health
   Skills:   GET/POST/PUT/DELETE http://localhost:${PORT}/api/skills
   Adapters: GET/POST/DELETE http://localhost:${PORT}/api/adapters
   Chat:     POST http://localhost:${PORT}/api/chat
   Wizard:   POST http://localhost:${PORT}/api/wizard/start

💾 数据库: MySQL (${process.env.DB_HOST || 'localhost'})
      `);
    });
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

start();

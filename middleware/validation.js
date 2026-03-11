// 数据验证中间件
const validateSkill = (req, res, next) => {
  const { name, system_type, domain } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Skill 名称不能为空',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!system_type || system_type.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '系统类型不能为空',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!domain || domain.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '领域不能为空',
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

const validateAdapter = (req, res, next) => {
  const { name, type, baseUrl } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Adapter 名称不能为空',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!type || type.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Adapter 类型不能为空',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!baseUrl || baseUrl.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Base URL 不能为空',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // 验证 URL 格式
  try {
    new URL(baseUrl);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Base URL 格式不正确',
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'SyntaxError') {
    return res.status(400).json({
      success: false,
      error: 'JSON 格式错误',
      code: 'SYNTAX_ERROR'
    });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: '资源已存在',
      code: 'DUPLICATE_ERROR'
    });
  }
  
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    code: 'INTERNAL_ERROR'
  });
};

module.exports = {
  validateSkill,
  validateAdapter,
  requestLogger,
  errorHandler
};

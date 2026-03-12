// 数据验证中间件
const Joi = require('joi');

// Skill 验证 Schema
const skillSchema = Joi.object({
  id: Joi.string().max(100),
  name: Joi.string().min(1).max(255).required(),
  version: Joi.string().max(20),
  description: Joi.string().allow(''),
  system_type: Joi.string().min(1).max(50).required(),
  domain: Joi.string().min(1).max(50).required(),
  isActive: Joi.boolean()
});

// Adapter 验证 Schema
const adapterSchema = Joi.object({
  id: Joi.string().max(100),
  name: Joi.string().min(1).max(255).required(),
  type: Joi.string().min(1).max(50).required(),
  baseUrl: Joi.string().uri().required(),
  config: Joi.object()
});

// 验证函数（供测试和中间件使用）
const validateSkillData = (data) => {
  return skillSchema.validate(data, { abortEarly: false });
};

const validateAdapterData = (data) => {
  return adapterSchema.validate(data, { abortEarly: false });
};

// Express 中间件
const validateSkill = (req, res, next) => {
  const { error, value } = validateSkillData(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  req.body = value;
  next();
};

const validateAdapter = (req, res, next) => {
  const { error, value } = validateAdapterData(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  req.body = value;
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
  validateSkillData,
  validateAdapterData,
  requestLogger,
  errorHandler
};

/**
 * API 文档路由
 */

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerConfig } from '../config/swagger';

const router = Router();

/**
 * Swagger UI 文档页面
 * GET /api-docs
 */
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerConfig, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI Agent Platform API 文档',
  swaggerOptions: {
    persistAuthorization: true, // 保持授权状态
    displayRequestDuration: true, // 显示请求时长
    filter: true, // 启用搜索过滤
  },
}));

/**
 * Swagger JSON 规范
 * GET /api-docs.json
 */
router.get('/json', (req, res) => {
  res.json(swaggerConfig);
});

export default router;

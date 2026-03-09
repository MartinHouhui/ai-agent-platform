/**
 * HTTP API 服务器
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Agent } from '../core/Agent';
import { SkillManager } from '../skills/SkillManager';
import { AdapterManager } from '../adapters/AdapterManager';
import { createWizardRoutes } from './wizardRoutes';
import { createSkillsRoutes } from './skillsRoutes';
import { createAdapterRoutes } from './adaptersRoutes';
import { logger } from '../utils/logger';

export function createAPIServer(agent: Agent) {
  const app = express();

  // 中间件
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 请求日志
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
    });
    next();
  });

  /**
   * 健康检查
   */
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  /**
   * 处理用户消息（主入口）
   * POST /api/chat
   * Body: { "message": "帮我查询今天的订单", "context": {} }
   */
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: '消息不能为空',
        });
      }

      logger.info('收到用户消息', { message, context });

      // 调用 Agent 处理
      const result = await agent.process(message, context);

      res.json({
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: result.metadata,
      });

    } catch (error: any) {
      logger.error('处理消息失败', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * 获取所有 Skills
   * GET /api/skills
   */
  app.get('/api/skills', async (req: Request, res: Response) => {
    try {
      // TODO: 从 SkillManager 获取
      res.json({
        success: true,
        data: [],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * 获取所有适配器
   * GET /api/adapters
   */
  app.get('/api/adapters', async (req: Request, res: Response) => {
    try {
      // TODO: 从 AdapterManager 获取
      res.json({
        success: true,
        data: [],
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * 系统自发现
   * POST /api/discover
   * Body: { "systemName": "natural-erp", "apiDocs": "http://..." }
   */
  app.post('/api/discover', async (req: Request, res: Response) => {
    try {
      const { systemName, apiDocs } = req.body;

      // TODO: 实现系统自发现
      res.json({
        success: true,
        data: {
          systemName,
          status: 'discovering',
          message: '系统发现任务已启动',
        },
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * 错误处理
   */
  app.use((err: any, req: Request, res: Response, next: any) => {
    logger.error('未捕获的错误', { error: err.message, stack: err.stack });
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  });

  return app;
}

/**
 * 启动服务器
 */
export function startServer(
  agent: Agent,
  skillManager: SkillManager,
  adapterManager: AdapterManager,
  wizardService: any,
  port: number = 3000
) {
  const app = createAPIServer(agent);
  
  // 添加向导路由
  app.use('/api/wizard', createWizardRoutes(wizardService));
  
  // 添加 Skills 路由
  app.use('/api/skills', createSkillsRoutes(skillManager));
  
  // 添加适配器路由
  app.use('/api/adapters', createAdapterRoutes(adapterManager));

  const server = app.listen(port, () => {
    logger.info(`🚀 API 服务器已启动: http://localhost:${port}`);
    logger.info(`📋 API 文档: http://localhost:${port}/health`);
    logger.info(`🧙 向导 API: http://localhost:${port}/api/wizard`);
    logger.info(`📚 Skills API: http://localhost:${port}/api/skills`);
    logger.info(`🔌 Adapters API: http://localhost:${port}/api/adapters`);
  });

  return server;
}

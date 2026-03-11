/**
 * HTTP API 服务器
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Agent } from '../core/Agent';
import { AgentEngine } from '../core/AgentEngine';
import { SkillManager } from '../skills/SkillManager';
import { AdapterManager } from '../adapters/AdapterManager';
import { createWizardRoutes } from './wizardRoutes';
import { createSkillsRoutes } from './skillsRoutes';
import { createAdapterRoutes } from './adaptersRoutes';
import { createAgentRoutes } from './agentRoutes';
import { createAuthRoutes } from './authRoutes';
import docsRouter from './docs';
import { logger } from '../utils/logger';

export function createAPIServer(agent: Agent, agentEngine?: AgentEngine) {
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
  port: number = 3000,
  agentEngine?: AgentEngine
) {
  const app = createAPIServer(agent, agentEngine);

  // 添加向导路由
  app.use('/api/wizard', createWizardRoutes(wizardService));

  // 添加 Skills 路由
  app.use('/api/skills', createSkillsRoutes(skillManager));

  // 添加适配器路由
  app.use('/api/adapters', createAdapterRoutes(adapterManager));

  // 添加 Agent 引擎路由（如果提供了 agentEngine）
  if (agentEngine) {
    app.use('/api/agent', createAgentRoutes(agentEngine));
  }

  // 添加认证路由
  app.use('/api/auth', createAuthRoutes());

  // API 文档
  app.use('/api-docs', docsRouter);

  const server = app.listen(port, () => {
    logger.info(`🚀 API 服务器已启动: http://localhost:${port}`);
    logger.info(`📋 API 文档: http://localhost:${port}/api-docs`);
    logger.info(`🔐 认证 API: http://localhost:${port}/api/auth`);
    logger.info(`🧙 向导 API: http://localhost:${port}/api/wizard`);
    logger.info(`📚 Skills API: http://localhost:${port}/api/skills`);
    logger.info(`🔌 Adapters API: http://localhost:${port}/api/adapters`);
    if (agentEngine) {
      logger.info(`🤖 Agent 引擎 API: http://localhost:${port}/api/agent`);
    }
  });

  return server;
}

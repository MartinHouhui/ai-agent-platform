/**
 * Agent API 路由
 */

import { Router, Request, Response } from 'express';
import { AgentEngine } from '../core/AgentEngine';
import { logger } from '../utils/logger';

export function createAgentRoutes(agentEngine: AgentEngine): Router {
  const router = Router();

  /**
   * POST /api/agent/chat
   * 与 Agent 对话
   *
   * Body: {
   *   "message": "查询今天的订单",
   *   "sessionId": "可选的会话 ID",
   *   "context": {} // 可选的上下文
   * }
   */
  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const { message, sessionId, context } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: '消息不能为空',
        });
      }

      logger.info('[API] 收到对话请求', { message, sessionId });

      const result = await agentEngine.process(message, sessionId, context);

      res.json({
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: result.metadata,
      });

    } catch (error: any) {
      logger.error('[API] 对话处理失败', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/agent/session/:sessionId/clear
   * 清除会话历史
   */
  router.post('/session/:sessionId/clear', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      agentEngine.clearHistory(String(sessionId));

      res.json({
        success: true,
        message: '会话历史已清除',
      });

    } catch (error: any) {
      logger.error('[API] 清除会话失败', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/agent/status
   * 获取 Agent 状态
   */
  router.get('/status', async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          status: 'running',
          version: '1.0.0',
          capabilities: [
            'intent-understanding',
            'task-planning',
            'tool-selection',
            'execution',
            'learning'
          ],
        },
      });

    } catch (error: any) {
      logger.error('[API] 获取状态失败', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/agent/test
   * 测试 Agent 的意图理解能力
   */
  router.post('/test', async (req: Request, res: Response) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: '测试消息不能为空',
        });
      }

      logger.info('[API] 收到测试请求', { message });

      const result = await agentEngine.process(message);

      res.json({
        success: true,
        data: {
          input: message,
          output: result.data,
          metadata: result.metadata,
        },
      });

    } catch (error: any) {
      logger.error('[API] 测试失败', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
}

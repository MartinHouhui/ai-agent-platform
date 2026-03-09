/**
 * 适配器 API 路由
 */

import { Router, Request, Response } from 'express';
import { AdapterManager } from '../adapters/AdapterManager';
import { logger } from '../utils/logger';

export function createAdapterRoutes(adapterManager: AdapterManager): Router {
  const router = Router();

  /**
   * 获取所有适配器
   * GET /api/adapters
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const adapters = adapterManager.listAdapters();

      res.json({
        success: true,
        data: adapters.map(adapter => ({
          name: adapter.name,
          type: adapter.type,
          isActive: true, // TODO: 实现健康检查
        })),
        total: adapters.length,
      });
    } catch (error: any) {
      logger.error('获取适配器失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 获取单个适配器
   * GET /api/adapters/:name
   */
  router.get('/:name', async (req: Request, res: Response) => {
    try {
      const adapterName = req.params.name as string;
      const adapters = adapterManager.listAdapters();
      const adapter = adapters.find(a => a.name === adapterName);

      if (!adapter) {
        return res.status(404).json({
          success: false,
          error: '适配器不存在',
        });
      }

      // 执行健康检查
      const isHealthy = await adapter.healthCheck();

      res.json({
        success: true,
        data: {
          name: adapter.name,
          type: adapter.type,
          isActive: isHealthy,
          lastChecked: new Date(),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 测试适配器连接
   * POST /api/adapters/:name/test
   */
  router.post('/:name/test', async (req: Request, res: Response) => {
    try {
      const adapterName = req.params.name as string;
      const { method, params } = req.body;

      const result = await adapterManager.call(adapterName, params || {});

      res.json({
        success: true,
        data: result,
        message: '适配器测试成功',
      });
    } catch (error: any) {
      logger.error('测试适配器失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 发现适配器 API
   * POST /api/adapters/:name/discover
   */
  router.post('/:name/discover', async (req: Request, res: Response) => {
    try {
      const adapterName = req.params.name as string;

      const discovery = await adapterManager.discoverSystem(adapterName);

      res.json({
        success: true,
        data: discovery,
        message: 'API 发现完成',
      });
    } catch (error: any) {
      logger.error('API 发现失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

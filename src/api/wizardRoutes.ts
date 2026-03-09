/**
 * 适配向导 API 路由
 */

import { Router, Request, Response } from 'express';
import { AdapterWizardService, WizardStep } from '../services/AdapterWizardService';
import { logger } from '../utils/logger';

export function createWizardRoutes(wizardService: AdapterWizardService): Router {
  const router = Router();

  /**
   * 创建新的向导会话
   * POST /api/wizard/start
   */
  router.post('/start', async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const session = wizardService.createSession(userId || 'default');

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          currentStep: session.currentStep,
          stepName: getStepName(session.currentStep),
        },
      });
    } catch (error: any) {
      logger.error('创建向导会话失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 获取会话状态
   * GET /api/wizard/:sessionId
   */
  router.get('/:sessionId', (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = wizardService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: '会话不存在' });
      }

      res.json({
        success: true,
        data: {
          ...session,
          stepName: getStepName(session.currentStep),
          progress: getProgress(session.currentStep),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 步骤 1: 保存系统信息
   * POST /api/wizard/:sessionId/system-info
   */
  router.post('/:sessionId/system-info', (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = wizardService.saveSystemInfo(sessionId, req.body);
      res.json({
        success: true,
        data: {
          currentStep: session.currentStep,
          stepName: getStepName(session.currentStep),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 步骤 2: 保存 API 配置
   * POST /api/wizard/:sessionId/api-config
   */
  router.post('/:sessionId/api-config', async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = await wizardService.saveAPIConfig(sessionId, req.body);
      res.json({
        success: true,
        data: {
          currentStep: session.currentStep,
          stepName: getStepName(session.currentStep),
          connectionTested: session.apiConfig?.connectionTested,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 步骤 3: 导入 API 文档
   * POST /api/wizard/:sessionId/api-import
   */
  router.post('/:sessionId/api-import', async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = await wizardService.importAPIDocument(sessionId, req.body);
      res.json({
        success: true,
        data: {
          currentStep: session.currentStep,
          stepName: getStepName(session.currentStep),
          endpointsCount: session.apiImport?.parsedSchema?.paths ? 
            Object.keys(session.apiImport.parsedSchema.paths).length : 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 步骤 4: AI 分析
   * POST /api/wizard/:sessionId/analyze
   */
  router.post('/:sessionId/analyze', async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = await wizardService.analyzeAPI(sessionId);
      res.json({
        success: true,
        data: {
          currentStep: session.currentStep,
          stepName: getStepName(session.currentStep),
          analysis: session.aiAnalysis,
        },
      });
    } catch (error: any) {
      logger.error('AI 分析失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 步骤 5: 保存功能选择
   * POST /api/wizard/:sessionId/features
   */
  router.post('/:sessionId/features', (req: Request, res: Response) => {
    try {
      const { features } = req.body;
      const sessionId = req.params.sessionId as string;
      const session = wizardService.saveFeatureSelection(sessionId, features);
      res.json({
        success: true,
        data: {
          currentStep: session.currentStep,
          stepName: getStepName(session.currentStep),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 步骤 6: 生成代码
   * POST /api/wizard/:sessionId/generate
   */
  router.post('/:sessionId/generate', async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = await wizardService.generateCode(sessionId);
      res.json({
        success: true,
        data: {
          currentStep: session.currentStep,
          stepName: getStepName(session.currentStep),
          code: session.generatedCode,
        },
      });
    } catch (error: any) {
      logger.error('代码生成失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 步骤 7: 运行测试
   * POST /api/wizard/:sessionId/test
   */
  router.post('/:sessionId/test', async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      const session = await wizardService.runTests(sessionId);
      res.json({
        success: true,
        data: {
          status: session.status,
          testResults: session.testResults,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 部署适配器
   * POST /api/wizard/:sessionId/deploy
   */
  router.post('/:sessionId/deploy', async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      const result = await wizardService.deployAdapter(sessionId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

/**
 * 获取步骤名称
 */
function getStepName(step: WizardStep): string {
  const names = {
    [WizardStep.SYSTEM_INFO]: '系统信息',
    [WizardStep.API_CONFIG]: 'API 配置',
    [WizardStep.API_IMPORT]: 'API 导入',
    [WizardStep.AI_ANALYSIS]: 'AI 分析',
    [WizardStep.FEATURE_SELECTION]: '功能选择',
    [WizardStep.CODE_GENERATION]: '代码生成',
    [WizardStep.TEST_DEPLOY]: '测试部署',
  };
  return names[step] || '未知';
}

/**
 * 获取进度百分比
 */
function getProgress(step: WizardStep): number {
  const steps = [
    WizardStep.SYSTEM_INFO,
    WizardStep.API_CONFIG,
    WizardStep.API_IMPORT,
    WizardStep.AI_ANALYSIS,
    WizardStep.FEATURE_SELECTION,
    WizardStep.CODE_GENERATION,
    WizardStep.TEST_DEPLOY,
  ];
  const index = steps.indexOf(step);
  return Math.round(((index + 1) / steps.length) * 100);
}

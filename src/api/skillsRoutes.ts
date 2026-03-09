/**
 * Skills API 路由
 */

import { Router, Request, Response } from 'express';
import { SkillManager } from '../skills/SkillManager';
import { logger } from '../utils/logger';
import { SkillDefinition } from '../core/types';

export function createSkillsRoutes(skillManager: SkillManager): Router {
  const router = Router();

  /**
   * 获取所有 Skills
   * GET /api/skills
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const skills = skillManager.listSkills();
      res.json({
        success: true,
        data: skills.map(skill => ({
          id: skill.id,
          name: skill.name,
          version: skill.version,
          description: skill.description,
          executorType: skill.executor.type,
          usageCount: skill.metadata.usageCount,
          successRate: skill.metadata.successRate,
          createdAt: skill.metadata.createdAt,
        })),
        total: skills.length,
      });
    } catch (error: any) {
      logger.error('获取 Skills 失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 获取单个 Skill
   * GET /api/skills/:id
   */
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const skillId = req.params.id;
      const skills = skillManager.listSkills();
      const skill = skills.find(s => s.id === skillId);

      if (!skill) {
        return res.status(404).json({
          success: false,
          error: 'Skill 不存在',
        });
      }

      res.json({
        success: true,
        data: skill,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 创建新 Skill
   * POST /api/skills
   */
  router.post('/', (req: Request, res: Response) => {
    try {
      const { name, version, description, executorType, code, triggers } = req.body;

      if (!name || !description || !executorType || !code) {
        return res.status(400).json({
          success: false,
          error: '缺少必需字段',
        });
      }

      const skill: SkillDefinition = {
        id: `skill-${Date.now()}`,
        name,
        version: version || '1.0.0',
        description,
        triggers: triggers || {},
        executor: {
          type: executorType,
          code,
        },
        metadata: {
          createdAt: new Date(),
          learnedFrom: 'manual-creation',
          successRate: 1.0,
          usageCount: 0,
        },
      };

      skillManager.registerSkill(skill);

      logger.info('创建 Skill', { skillId: skill.id, name });

      res.status(201).json({
        success: true,
        data: skill,
        message: 'Skill 创建成功',
      });
    } catch (error: any) {
      logger.error('创建 Skill 失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 更新 Skill
   * PUT /api/skills/:id
   */
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const skillId = req.params.id;
      const updates = req.body;

      // TODO: 实现更新逻辑
      logger.info('更新 Skill', { skillId, updates });

      res.json({
        success: true,
        message: 'Skill 更新成功',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 删除 Skill
   * DELETE /api/skills/:id
   */
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const skillId = req.params.id as string;

      // TODO: 实现删除逻辑
      logger.info('删除 Skill', { skillId });

      res.json({
        success: true,
        message: 'Skill 删除成功',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * 测试 Skill
   * POST /api/skills/:id/test
   */
  router.post('/:id/test', async (req: Request, res: Response) => {
    try {
      const skillId = req.params.id as string;
      const { params } = req.body;

      const result = await skillManager.executeSkill(skillId, params || {});

      res.json({
        success: true,
        data: result,
        message: 'Skill 测试成功',
      });
    } catch (error: any) {
      logger.error('测试 Skill 失败', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

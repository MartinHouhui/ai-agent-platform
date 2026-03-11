/**
 * Skill 管理器 - 管理技能的注册、查找、执行、学习
 */

import { v4 as uuidv4 } from 'uuid';
import { Task, SkillDefinition } from '../core/types';
import { logger } from '../utils/logger';

export class SkillManager {
  private skills: Map<string, SkillDefinition> = new Map();

  constructor() {
    this.loadSkills();
  }

  /**
   * 加载已有 Skills
   */
  private loadSkills(): void {
    // TODO: 从数据库或文件加载
    logger.info('加载 Skills...');
  }

  /**
   * 注册新 Skill
   */
  registerSkill(skill: SkillDefinition): void {
    this.skills.set(skill.id, skill);
    logger.info('注册 Skill', { id: skill.id, name: skill.name });
    // TODO: 持久化到数据库
  }

  /**
   * 查找匹配的 Skill
   */
  async findMatchingSkill(task: Task): Promise<SkillDefinition | null> {
    for (const skill of this.skills.values()) {
      // 检查意图匹配
      if (skill.triggers.intent) {
        if (skill.triggers.intent.test(task.description)) {
          logger.info('找到匹配的 Skill', { skillId: skill.id, taskId: task.id });
          return skill;
        }
      }

      // 检查系统匹配
      if (skill.triggers.system && task.params.system === skill.triggers.system) {
        return skill;
      }

      // 检查域匹配
      if (skill.triggers.domain && task.params.domain === skill.triggers.domain) {
        return skill;
      }
    }

    return null;
  }

  /**
   * 执行 Skill
   */
  async executeSkill(skillId: string, params: any): Promise<any> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    logger.info('执行 Skill', { skillId, params });

    try {
      let result: any;

      switch (skill.executor.type) {
        case 'code':
          // 执行代码（需要沙箱环境）
          result = await this.executeCode(skill.executor.code!, params);
          break;

        case 'prompt':
          // 执行提示词模板
          result = await this.executePrompt(skill.executor.prompt!, params);
          break;

        case 'hybrid':
          // 混合模式
          result = await this.executeHybrid(skill, params);
          break;
      }

      // 更新使用统计
      skill.metadata.usageCount++;
      // TODO: 更新成功率

      return result;

    } catch (error: any) {
      logger.error('Skill 执行失败', { skillId, error: error.message });
      throw error;
    }
  }

  /**
   * 执行代码
   */
  private async executeCode(code: string, params: any): Promise<any> {
    // TODO: 实现安全的代码执行沙箱
    // 可以使用 vm2、isolated-vm 等
    logger.warn('代码执行功能待实现');
    return { code, params };
  }

  /**
   * 执行提示词模板
   */
  private async executePrompt(promptTemplate: string, params: any): Promise<any> {
    // 简单的模板替换
    let prompt = promptTemplate;
    for (const [key, value] of Object.entries(params)) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    // TODO: 调用模型
    logger.info('执行提示词', { prompt });
    return { prompt };
  }

  /**
   * 混合执行
   */
  private async executeHybrid(skill: SkillDefinition, params: any): Promise<any> {
    // 先执行代码获取数据，再用提示词处理
    const data = await this.executeCode(skill.executor.code!, params);
    const result = await this.executePrompt(skill.executor.prompt!, { ...params, data });
    return result;
  }

  /**
   * 学习新 Skill
   */
  async learnSkill(
    taskDescription: string,
    system: string,
    solution: string
  ): Promise<SkillDefinition> {
    logger.info('学习新 Skill', { taskDescription, system });

    // 生成 Skill 定义
    const skill: SkillDefinition = {
      id: `skill-${uuidv4()}`,
      name: `${system} - ${taskDescription}`,
      version: '1.0.0',
      description: `自动学习：${taskDescription}`,
      triggers: {
        system,
        intent: new RegExp(taskDescription, 'i')
      },
      executor: {
        type: 'code',
        code: solution
      },
      metadata: {
        createdAt: new Date(),
        learnedFrom: `auto-learn-${Date.now()}`,
        successRate: 1.0,
        usageCount: 0
      }
    };

    this.registerSkill(skill);
    return skill;
  }

  /**
   * 列出所有 Skills
   */
  listSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  /**
   * 更新 Skill 统计信息
   */
  async updateStats(skillId: string, success: boolean): Promise<void> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      logger.warn('更新统计失败：Skill 不存在', { skillId });
      return;
    }

    // 更新成功率（简单移动平均）
    const totalUses = skill.metadata.usageCount + 1;
    const successCount = skill.metadata.successRate * skill.metadata.usageCount + (success ? 1 : 0);
    skill.metadata.successRate = successCount / totalUses;
    skill.metadata.usageCount = totalUses;

    logger.info('Skill 统计已更新', {
      skillId,
      success,
      usageCount: skill.metadata.usageCount,
      successRate: skill.metadata.successRate.toFixed(2)
    });

    // TODO: 持久化到数据库
  }
}

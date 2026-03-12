/**
 * 模型路由器 - 根据任务类型选择最优模型
 */

import { Model } from '../core/types';
import { logger } from '../utils/logger';
import { qwenClient } from './QwenClient';

// 模型配置
const MODELS: Model[] = [
  {
    id: 'qwen3.5-plus',
    name: '通义千问 3.5 Plus',
    provider: 'alibaba',
    capabilities: ['chinese', 'code', 'analysis', 'reasoning', 'multilingual'],
    costPer1kTokens: 0.004
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    capabilities: ['code', 'analysis', 'reasoning', 'multilingual'],
    costPer1kTokens: 0.01
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    capabilities: ['code', 'analysis', 'reasoning', 'long-context'],
    costPer1kTokens: 0.015
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    capabilities: ['code', 'analysis', 'multimodal', 'creative'],
    costPer1kTokens: 0.001
  },
  {
    id: 'glm-4',
    name: 'GLM-4',
    provider: 'zhipu',
    capabilities: ['chinese', 'code', 'analysis'],
    costPer1kTokens: 0.002
  }
];

// 路由策略
const ROUTING_STRATEGY: Record<string, string[]> = {
  'intent-understanding': ['chinese', 'reasoning'],
  'code-generation': ['code', 'reasoning'],
  'data-analysis': ['analysis', 'reasoning'],
  'chinese-nlu': ['chinese'],
  'creative-writing': ['creative'],
  'long-context': ['long-context'],
  'multimodal': ['multimodal'],
  'cost-sensitive': []  // 选最便宜的
};

export class ModelRouter {
  private models: Map<string, Model> = new Map();
  private defaultModel: string;

  constructor() {
    // 加载模型配置
    MODELS.forEach(m => this.models.set(m.id, m));
    
    // 优先使用通义千问
    this.defaultModel = process.env.ANTHROPIC_MODEL || 'qwen3.5-plus';
    
    logger.info('模型路由器初始化', { 
      modelCount: this.models.size,
      defaultModel: this.defaultModel 
    });
  }

  /**
   * 选择模型
   */
  async selectModel(taskType: string): Promise<Model> {
    const requiredCapabilities = ROUTING_STRATEGY[taskType] || [];

    // 筛选符合条件的模型
    const candidates = Array.from(this.models.values()).filter(model => {
      if (requiredCapabilities.length === 0) return true;
      return requiredCapabilities.every(cap => model.capabilities.includes(cap));
    });

    if (candidates.length === 0) {
      logger.warn('没有找到符合条件的模型，使用默认模型', { taskType });
      return this.models.get('gpt-4-turbo')!;
    }

    // 选择成本最低的
    const selected = candidates.reduce((best, current) => 
      current.costPer1kTokens < best.costPer1kTokens ? current : best
    );

    logger.info('选择模型', { 
      taskType, 
      modelId: selected.id, 
      provider: selected.provider 
    });

    return selected;
  }

  /**
   * 统一调用接口
   */
  async call(model: Model, prompt: string, options?: any): Promise<any> {
    logger.info('调用模型', { modelId: model.id });

    try {
      switch (model.provider) {
        case 'openai':
          return await this.callOpenAI(model, prompt, options);
        
        case 'anthropic':
          return await this.callAnthropic(model, prompt, options);
        
        case 'google':
          return await this.callGoogle(model, prompt, options);
        
        case 'alibaba':
          return await this.callAlibaba(model, prompt, options);
        
        case 'zhipu':
          return await this.callZhipu(model, prompt, options);
        
        default:
          throw new Error(`不支持的模型提供商: ${model.provider}`);
      }
    } catch (error: any) {
      logger.error('模型调用失败', { modelId: model.id, error: error.message });
      throw error;
    }
  }

  /**
   * 调用 OpenAI
   */
  private async callOpenAI(model: Model, prompt: string, options?: any): Promise<any> {
    // TODO: 实现 OpenAI API 调用
    const response = {
      content: `[OpenAI ${model.id}] 响应: ${prompt.substring(0, 50)}...`
    };
    return response;
  }

  /**
   * 调用 Anthropic
   */
  private async callAnthropic(model: Model, prompt: string, options?: any): Promise<any> {
    // TODO: 实现 Anthropic API 调用
    const response = {
      content: `[Anthropic ${model.id}] 响应: ${prompt.substring(0, 50)}...`
    };
    return response;
  }

  /**
   * 调用 Google
   */
  private async callGoogle(model: Model, prompt: string, options?: any): Promise<any> {
    // TODO: 实现 Google API 调用
    const response = {
      content: `[Google ${model.id}] 响应: ${prompt.substring(0, 50)}...`
    };
    return response;
  }

  /**
   * 调用阿里云（通义千问）
   */
  private async callAlibaba(model: Model, prompt: string, options?: any): Promise<any> {
    try {
      const response = await qwenClient.chat(
        [{ role: 'user', content: prompt }],
        {
          model: model.id,
          temperature: options?.temperature || 0.7,
          maxTokens: options?.maxTokens || 4096
        }
      );
      
      return {
        content: response.content,
        usage: response.usage
      };
    } catch (error: any) {
      logger.error('通义千问调用失败', { model: model.id, error: error.message });
      // 降级响应
      return {
        content: `[通义千问降级模式] ${prompt.substring(0, 50)}...`
      };
    }
  }

  /**
   * 调用智谱
   */
  private async callZhipu(model: Model, prompt: string, options?: any): Promise<any> {
    // TODO: 实现智谱 API 调用
    const response = {
      content: `[智谱 ${model.id}] 响应: ${prompt.substring(0, 50)}...`
    };
    return response;
  }

  /**
   * 列出所有可用模型
   */
  listModels(): Model[] {
    return Array.from(this.models.values());
  }
}

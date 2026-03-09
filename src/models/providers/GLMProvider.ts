/**
 * GLM（智谱 AI）模型提供商
 */

import axios from 'axios';
import { logger } from '../../utils/logger';

export class GLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ZHIPU_API_KEY || '';
    this.baseUrl = 'https://open.bigmodel.cn/api/paas/v3/model-api';
  }

  /**
   * 调用 GLM 模型
   */
  async call(
    model: string,
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<{ content: string; usage: any }> {
    if (!this.apiKey) {
      logger.warn('GLM API Key 未配置，使用模拟响应');
      return {
        content: `[模拟 GLM ${model}] ${prompt.substring(0, 100)}...`,
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      };
    }

    try {
      const messages: any[] = [];
      
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await axios.post(
        `${this.baseUrl}/${model}/invoke`,
        {
          prompt: messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      return {
        content: data.data.choices[0].content,
        usage: data.data.usage,
      };
    } catch (error: any) {
      logger.error('GLM 调用失败', {
        model,
        error: error.response?.data || error.message
      });
      throw new Error(`GLM 调用失败: ${error.message}`);
    }
  }

  /**
   * 获取 embedding
   */
  async getEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      logger.warn('GLM API Key 未配置，返回空 embedding');
      return new Array(1024).fill(0);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/embedding-2/invoke`,
        {
          prompt: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data.data.embedding;
    } catch (error: any) {
      logger.error('GLM Embedding 失败', { error: error.message });
      throw error;
    }
  }
}

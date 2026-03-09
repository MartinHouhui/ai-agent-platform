/**
 * 适配器管理器 - 管理各业务系统的适配器
 */

import { Task, AdapterConfig } from '../core/types';
import { logger } from '../utils/logger';

export interface SystemAdapter {
  name: string;
  type: 'erp' | 'crm' | 'oa' | 'im' | 'custom';
  init(config: AdapterConfig): Promise<void>;
  call(method: string, params?: any): Promise<any>;
  discover(): Promise<any>;
  healthCheck(): Promise<boolean>;
}

export class AdapterManager {
  private adapters: Map<string, SystemAdapter> = new Map();

  constructor() {
    logger.info('适配器管理器初始化');
  }

  /**
   * 注册适配器
   */
  registerAdapter(adapter: SystemAdapter): void {
    this.adapters.set(adapter.name, adapter);
    logger.info('注册适配器', { name: adapter.name, type: adapter.type });
  }

  /**
   * 初始化适配器
   */
  async initAdapter(name: string, config: AdapterConfig): Promise<void> {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`适配器不存在: ${name}`);
    }

    await adapter.init(config);
    logger.info('适配器初始化完成', { name });
  }

  /**
   * 查找适配器
   */
  async findAdapter(task: Task): Promise<SystemAdapter | null> {
    // 根据任务类型查找
    for (const adapter of this.adapters.values()) {
      if (task.params.system === adapter.name) {
        return adapter;
      }
    }
    return null;
  }

  /**
   * 调用适配器
   */
  async call(adapterName: string, params: any): Promise<any> {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) {
      throw new Error(`适配器不存在: ${adapterName}`);
    }

    logger.info('调用适配器', { adapterName, params });
    
    try {
      const result = await adapter.call('execute', params);
      return result;
    } catch (error: any) {
      logger.error('适配器调用失败', { adapterName, error: error.message });
      throw error;
    }
  }

  /**
   * 自发现：AI 探索系统 API
   */
  async discoverSystem(systemName: string, apiDocs?: string): Promise<any> {
    logger.info('开始系统自发现', { systemName });

    // TODO: 实现自动探索逻辑
    // 1. 读取 API 文档（Swagger/OpenAPI）
    // 2. 分析接口结构
    // 3. 生成适配器代码
    // 4. 测试关键接口

    const discoveryResult = {
      systemName,
      endpoints: [],
      models: [],
      generatedCode: '// 自动生成的适配器代码'
    };

    logger.info('系统自发现完成', { systemName });
    return discoveryResult;
  }

  /**
   * 列出所有适配器
   */
  listAdapters(): SystemAdapter[] {
    return Array.from(this.adapters.values());
  }
}

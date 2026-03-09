/**
 * 核心类型定义
 */

// ============ 意图相关 ============

export interface Intent {
  id: string;
  type: IntentType;
  action: string;
  entities: Record<string, any>;
  confidence: number;
  rawText: string;
}

export enum IntentType {
  QUERY = 'query',           // 查询
  CREATE = 'create',         // 创建
  UPDATE = 'update',         // 更新
  DELETE = 'delete',         // 删除
  ANALYZE = 'analyze',       // 分析
  INTEGRATE = 'integrate',   // 对接
  CHAT = 'chat',             // 闲聊
  UNKNOWN = 'unknown'        // 未知
}

// ============ 任务相关 ============

export interface Task {
  id: string;
  type: TaskType;
  description: string;
  params: Record<string, any>;
  status: TaskStatus;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export enum TaskType {
  API_CALL = 'api_call',
  DATA_QUERY = 'data_query',
  PAGE_GENERATE = 'page_generate',
  SKILL_LEARN = 'skill_learn',
  SYSTEM_INTEGRATE = 'system_integrate',
  MESSAGE_SEND = 'message_send',
  DATA_ANALYZE = 'data_analyze'
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// ============ 工具相关 ============

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: 'skill' | 'mcp' | 'adapter';
  inputSchema: any;
  handler: string | Function;
}

// ============ 结果相关 ============

export interface Result {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    duration: number;
    model?: string;
    tools?: string[];
  };
}

// ============ 模型相关 ============

export interface Model {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'alibaba' | 'baidu' | 'zhipu';
  capabilities: string[];
  costPer1kTokens: number;
}

// ============ 适配器相关 ============

export interface AdapterConfig {
  name: string;
  type: 'erp' | 'crm' | 'oa' | 'im' | 'custom';
  baseUrl?: string;
  apiKey?: string;
  credentials?: Record<string, any>;
}

// ============ Skill 相关 ============

export interface SkillDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  triggers: {
    intent?: RegExp;
    system?: string;
    domain?: string;
  };
  executor: {
    type: 'code' | 'prompt' | 'hybrid';
    code?: string;
    prompt?: string;
  };
  metadata: {
    createdAt: Date;
    learnedFrom: string;
    successRate: number;
    usageCount: number;
  };
}

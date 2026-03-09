// 向导步骤
export enum WizardStep {
  SYSTEM_INFO = 'system_info',
  API_CONFIG = 'api_config',
  API_IMPORT = 'api_import',
  AI_ANALYSIS = 'ai_analysis',
  FEATURE_SELECTION = 'feature_selection',
  CODE_GENERATION = 'code_generation',
  TEST_DEPLOY = 'test_deploy',
}

// 向导会话
export interface WizardSession {
  id: string;
  userId: string;
  currentStep: WizardStep;
  status: 'in_progress' | 'completed' | 'failed';

  systemInfo?: {
    name: string;
    type: 'erp' | 'crm' | 'oa' | 'im' | 'custom';
    description: string;
    logo?: string;
  };

  apiConfig?: {
    baseUrl: string;
    authType: 'api_key' | 'oauth' | 'basic' | 'custom';
    apiKey?: string;
    connectionTested: boolean;
  };

  apiImport?: {
    method: 'swagger_url' | 'upload' | 'manual';
    swaggerUrl?: string;
  };

  aiAnalysis?: {
    endpoints: any[];
    models: any[];
    suggestedFeatures: BusinessFeature[];
  };

  selectedFeatures?: BusinessFeature[];

  generatedCode?: {
    adapterCode: string;
    skills: GeneratedSkill[];
  };
}

// 业务功能
export interface BusinessFeature {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredEndpoints: string[];
  priority: 'high' | 'medium' | 'low';
}

// 生成的 Skill
export interface GeneratedSkill {
  name: string;
  description: string;
  triggerKeywords: string[];
  code: string;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

// Skill
export interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  executorType: 'code' | 'prompt' | 'hybrid';
  usageCount: number;
  successRate: number;
}

// Adapter
export interface Adapter {
  id: string;
  name: string;
  type: string;
  baseUrl?: string;
  isActive: boolean;
}

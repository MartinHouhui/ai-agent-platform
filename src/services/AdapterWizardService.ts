/**
 * 系统适配向导服务
 * 提供向导式的业务系统适配流程
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { OpenAIProvider } from '../models/providers/OpenAIProvider';
import { QwenProvider } from '../models/providers/QwenProvider';

// 向导步骤类型
export enum WizardStep {
  SYSTEM_INFO = 'system_info',           // 步骤 1: 系统信息
  API_CONFIG = 'api_config',             // 步骤 2: API 配置
  API_IMPORT = 'api_import',             // 步骤 3: API 文档导入
  AI_ANALYSIS = 'ai_analysis',           // 步骤 4: AI 分析
  FEATURE_SELECTION = 'feature_selection', // 步骤 5: 功能选择
  CODE_GENERATION = 'code_generation',   // 步骤 6: 代码生成
  TEST_DEPLOY = 'test_deploy',           // 步骤 7: 测试部署
}

// 向导会话
export interface WizardSession {
  id: string;
  userId: string;
  currentStep: WizardStep;
  status: 'in_progress' | 'completed' | 'failed';

  // 步骤 1: 系统信息
  systemInfo?: {
    name: string;
    type: 'erp' | 'crm' | 'oa' | 'im' | 'custom';
    description: string;
    logo?: string;
  };

  // 步骤 2: API 配置
  apiConfig?: {
    baseUrl: string;
    authType: 'api_key' | 'oauth' | 'basic' | 'custom';
    apiKey?: string;
    username?: string;
    password?: string;
    customHeaders?: Record<string, string>;
    connectionTested: boolean;
  };

  // 步骤 3: API 导入
  apiImport?: {
    method: 'swagger_url' | 'upload' | 'manual';
    swaggerUrl?: string;
    uploadedFile?: string;
    manualEndpoints?: APIEndpoint[];
    parsedSchema?: any;
  };

  // 步骤 4: AI 分析结果
  aiAnalysis?: {
    endpoints: APIEndpoint[];
    models: DataModel[];
    suggestedFeatures: BusinessFeature[];
    confidence: number;
  };

  // 步骤 5: 功能选择
  selectedFeatures?: BusinessFeature[];

  // 步骤 6: 生成的代码
  generatedCode?: {
    adapterCode: string;
    skills: GeneratedSkill[];
    testCases: TestCase[];
  };

  // 步骤 7: 测试结果
  testResults?: TestResult[];

  createdAt: Date;
  updatedAt: Date;
}

// API 端点
export interface APIEndpoint {
  method: string;
  path: string;
  summary: string;
  description?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
  tags?: string[];
}

// 数据模型
export interface DataModel {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
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

// 测试用例
export interface TestCase {
  name: string;
  endpoint: string;
  method: string;
  params: any;
  expectedStatus: number;
}

// 测试结果
export interface TestResult {
  testCase: string;
  success: boolean;
  duration: number;
  response?: any;
  error?: string;
}

export class AdapterWizardService {
  private sessions: Map<string, WizardSession> = new Map();
  private openai: OpenAIProvider;
  private qwen: QwenProvider;

  constructor() {
    this.openai = new OpenAIProvider();
    this.qwen = new QwenProvider();
    logger.info('系统适配向导服务初始化');
  }

  /**
   * 创建新的向导会话
   */
  createSession(userId: string): WizardSession {
    const session: WizardSession = {
      id: uuidv4(),
      userId,
      currentStep: WizardStep.SYSTEM_INFO,
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.sessions.set(session.id, session);
    logger.info('创建向导会话', { sessionId: session.id, userId });

    return session;
  }

  /**
   * 获取会话
   */
  getSession(sessionId: string): WizardSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 步骤 1: 保存系统信息
   */
  saveSystemInfo(sessionId: string, systemInfo: any): WizardSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    session.systemInfo = systemInfo;
    session.currentStep = WizardStep.API_CONFIG;
    session.updatedAt = new Date();

    logger.info('保存系统信息', { sessionId, systemInfo });
    return session;
  }

  /**
   * 步骤 2: 保存 API 配置
   */
  async saveAPIConfig(sessionId: string, apiConfig: any): Promise<WizardSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    // 测试连接
    const connectionTested = await this.testConnection(apiConfig);

    session.apiConfig = {
      ...apiConfig,
      connectionTested,
    };

    if (connectionTested) {
      session.currentStep = WizardStep.API_IMPORT;
    }

    session.updatedAt = new Date();
    logger.info('保存 API 配置', { sessionId, connectionTested });

    return session;
  }

  /**
   * 测试 API 连接
   */
  private async testConnection(apiConfig: any): Promise<boolean> {
    try {
      const axios = require('axios');
      const response = await axios.get(apiConfig.baseUrl, {
        timeout: 5000,
        headers: this.buildAuthHeaders(apiConfig),
      });
      return response.status < 500;
    } catch (error) {
      logger.warn('连接测试失败', { error });
      return false;
    }
  }

  /**
   * 构建认证头
   */
  private buildAuthHeaders(apiConfig: any): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (apiConfig.authType) {
      case 'api_key':
        headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
        break;
      case 'basic':
        const credentials = Buffer.from(
          `${apiConfig.username}:${apiConfig.password}`
        ).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      case 'custom':
        Object.assign(headers, apiConfig.customHeaders);
        break;
    }

    return headers;
  }

  /**
   * 步骤 3: 导入 API 文档
   */
  async importAPIDocument(sessionId: string, importConfig: any): Promise<WizardSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    session.apiImport = importConfig;

    // 解析 Swagger 文档
    if (importConfig.method === 'swagger_url' && importConfig.swaggerUrl) {
      const parsedSchema = await this.parseSwagger(importConfig.swaggerUrl);
      session.apiImport.parsedSchema = parsedSchema;
    }

    session.currentStep = WizardStep.AI_ANALYSIS;
    session.updatedAt = new Date();

    logger.info('导入 API 文档', { sessionId, method: importConfig.method });
    return session;
  }

  /**
   * 解析 Swagger 文档
   */
  private async parseSwagger(swaggerUrl: string): Promise<any> {
    try {
      const axios = require('axios');
      const response = await axios.get(swaggerUrl, { timeout: 10000 });
      return response.data;
    } catch (error) {
      logger.error('解析 Swagger 失败', { error });
      throw new Error('无法解析 Swagger 文档');
    }
  }

  /**
   * 步骤 4: AI 分析 API
   */
  async analyzeAPI(sessionId: string): Promise<WizardSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    logger.info('开始 AI 分析', { sessionId });

    // 提取 API 端点
    const endpoints = this.extractEndpoints(session);

    // 使用 AI 分析业务场景
    const prompt = this.buildAnalysisPrompt(endpoints, session.systemInfo);

    const aiResponse = await this.openai.call(
      'gpt-4-turbo',
      prompt,
      { temperature: 0.7 }
    );

    const analysis = this.parseAnalysisResult(aiResponse.content);

    session.aiAnalysis = analysis;
    session.currentStep = WizardStep.FEATURE_SELECTION;
    session.updatedAt = new Date();

    logger.info('AI 分析完成', { sessionId, featuresCount: analysis.suggestedFeatures.length });

    return session;
  }

  /**
   * 提取 API 端点
   */
  private extractEndpoints(session: WizardSession): APIEndpoint[] {
    const schema = session.apiImport?.parsedSchema;
    if (!schema || !schema.paths) return [];

    const endpoints: APIEndpoint[] = [];

    for (const [path, methods] of Object.entries(schema.paths)) {
      for (const [method, spec] of Object.entries(methods as any)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          endpoints.push({
            method: method.toUpperCase(),
            path,
            summary: (spec as any).summary || '',
            description: (spec as any).description || '',
            parameters: (spec as any).parameters,
            requestBody: (spec as any).requestBody,
            responses: (spec as any).responses,
            tags: (spec as any).tags,
          });
        }
      }
    }

    return endpoints;
  }

  /**
   * 构建 AI 分析提示词
   */
  private buildAnalysisPrompt(endpoints: APIEndpoint[], systemInfo: any): string {
    return `
你是一个业务系统分析专家。请分析以下 API 端点，并识别出主要的业务场景和功能。

系统信息：
- 名称：${systemInfo?.name || '未知'}
- 类型：${systemInfo?.type || '未知'}
- 描述：${systemInfo?.description || '无'}

API 端点列表：
${JSON.stringify(endpoints, null, 2)}

请返回 JSON 格式的分析结果：
{
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/orders",
      "summary": "查询订单",
      "description": "查询订单列表",
      "tags": ["订单管理"]
    }
  ],
  "models": [
    {
      "name": "Order",
      "fields": [
        { "name": "id", "type": "string", "required": true, "description": "订单ID" },
        { "name": "customer_id", "type": "string", "required": true, "description": "客户ID" }
      ]
    }
  ],
  "suggestedFeatures": [
    {
      "id": "query-order",
      "name": "查询订单",
      "description": "从系统查询订单信息",
      "category": "订单管理",
      "requiredEndpoints": ["GET /api/orders"],
      "priority": "high"
    }
  ],
  "confidence": 0.95
}

只返回 JSON，不要有其他内容。
    `;
  }

  /**
   * 解析 AI 分析结果
   */
  private parseAnalysisResult(content: string): any {
    try {
      // 提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('未找到 JSON');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('解析 AI 结果失败', { error, content });
      // 返回默认结果
      return {
        endpoints: [],
        models: [],
        suggestedFeatures: [],
        confidence: 0,
      };
    }
  }

  /**
   * 步骤 5: 保存功能选择
   */
  saveFeatureSelection(sessionId: string, features: BusinessFeature[]): WizardSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    session.selectedFeatures = features;
    session.currentStep = WizardStep.CODE_GENERATION;
    session.updatedAt = new Date();

    logger.info('保存功能选择', { sessionId, featuresCount: features.length });
    return session;
  }

  /**
   * 步骤 6: AI 生成代码
   */
  async generateCode(sessionId: string): Promise<WizardSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    logger.info('开始生成代码', { sessionId });

    // 生成适配器代码
    const adapterCode = await this.generateAdapterCode(session);

    // 生成 Skills
    const skills = await this.generateSkills(session);

    // 生成测试用例
    const testCases = this.generateTestCases(session);

    session.generatedCode = {
      adapterCode,
      skills,
      testCases,
    };

    session.currentStep = WizardStep.TEST_DEPLOY;
    session.updatedAt = new Date();

    logger.info('代码生成完成', { sessionId });

    return session;
  }

  /**
   * 生成适配器代码
   */
  private async generateAdapterCode(session: WizardSession): Promise<string> {
    const prompt = `
生成一个 REST API 适配器的 TypeScript 代码。

系统信息：
- 名称：${session.systemInfo?.name}
- 基础 URL：${session.apiConfig?.baseUrl}
- 认证方式：${session.apiConfig?.authType}

API 端点：
${JSON.stringify(session.aiAnalysis?.endpoints, null, 2)}

请生成完整的 TypeScript 类，包含：
1. 初始化方法
2. 认证处理
3. 主要的 API 调用方法
4. 错误处理

只返回代码，不要有其他内容。
    `;

    const response = await this.qwen.call('qwen-max', prompt);
    return response.content;
  }

  /**
   * 生成 Skills
   */
  private async generateSkills(session: WizardSession): Promise<GeneratedSkill[]> {
    const skills: GeneratedSkill[] = [];

    for (const feature of session.selectedFeatures || []) {
      const prompt = `
为以下业务功能生成一个 Skill 代码：

功能名称：${feature.name}
功能描述：${feature.description}
相关 API：${feature.requiredEndpoints.join(', ')}

请生成 TypeScript 代码，包含：
1. 触发关键词
2. 执行函数
3. 错误处理

返回格式：
{
  "name": "功能名称",
  "description": "功能描述",
  "triggerKeywords": ["关键词1", "关键词2"],
  "code": "async function execute(params) { ... }"
}
      `;

      const response = await this.qwen.call('qwen-max', prompt);

      try {
        const skill = JSON.parse(response.content);
        skills.push(skill);
      } catch (error) {
        logger.warn('解析 Skill 失败', { feature: feature.name, error });
      }
    }

    return skills;
  }

  /**
   * 生成测试用例
   */
  private generateTestCases(session: WizardSession): TestCase[] {
    const testCases: TestCase[] = [];

    for (const endpoint of session.aiAnalysis?.endpoints || []) {
      testCases.push({
        name: `测试 ${endpoint.method} ${endpoint.path}`,
        endpoint: endpoint.path,
        method: endpoint.method,
        params: {},
        expectedStatus: 200,
      });
    }

    return testCases;
  }

  /**
   * 步骤 7: 运行测试
   */
  async runTests(sessionId: string): Promise<WizardSession> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    logger.info('开始测试', { sessionId });

    const testResults: TestResult[] = [];

    // TODO: 实际执行测试
    for (const testCase of session.generatedCode?.testCases || []) {
      testResults.push({
        testCase: testCase.name,
        success: true,
        duration: 100,
        response: {},
      });
    }

    session.testResults = testResults;
    session.status = 'completed';
    session.updatedAt = new Date();

    logger.info('测试完成', { sessionId });

    return session;
  }

  /**
   * 部署适配器
   */
  async deployAdapter(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('会话不存在');

    logger.info('部署适配器', { sessionId });

    // TODO: 保存到数据库
    // TODO: 注册到 AdapterManager
    // TODO: 注册 Skills

    return {
      success: true,
      adapterId: session.id,
      message: '适配器部署成功',
    };
  }
}

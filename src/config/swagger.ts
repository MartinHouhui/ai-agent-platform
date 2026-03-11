/**
 * Swagger API 文档配置
 */

export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Agent Platform API',
      version: '1.0.0',
      description: '🤖 可自主进化的 AI Agent 平台 API 文档',
      contact: {
        name: 'Martin Hou',
        email: 'martin@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发服务器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: '用户 ID',
            },
            username: {
              type: 'string',
              description: '用户名',
            },
            email: {
              type: 'string',
              format: 'email',
              description: '邮箱地址',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              description: '用户角色',
            },
            avatar: {
              type: 'string',
              description: '头像 URL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              description: '最后登录时间',
            },
          },
        },
        Skill: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Skill ID',
            },
            name: {
              type: 'string',
              description: 'Skill 名称',
            },
            type: {
              type: 'string',
              enum: ['code', 'prompt'],
              description: '类型',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: '状态',
            },
            usageCount: {
              type: 'integer',
              description: '使用次数',
            },
            successRate: {
              type: 'number',
              description: '成功率',
            },
            createdAt: {
              type: 'string',
              format: 'date',
              description: '创建时间',
            },
          },
        },
        Adapter: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: '适配器 ID',
            },
            name: {
              type: 'string',
              description: '适配器名称',
            },
            type: {
              type: 'string',
              enum: ['ERP', 'CRM', 'OA', 'IM', 'Custom'],
              description: '类型',
            },
            apiUrl: {
              type: 'string',
              format: 'uri',
              description: 'API 地址',
            },
            status: {
              type: 'string',
              enum: ['online', 'offline'],
              description: '状态',
            },
            lastSync: {
              type: 'string',
              description: '最后同步时间',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: '错误信息',
            },
            code: {
              type: 'string',
              description: '错误代码',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: '认证相关接口',
      },
      {
        name: 'Agent',
        description: 'AI Agent 引擎接口',
      },
      {
        name: 'Skills',
        description: '技能管理接口',
      },
      {
        name: 'Adapters',
        description: '适配器管理接口',
      },
      {
        name: 'Wizard',
        description: '系统配置向导接口',
      },
    ],
  },
  apis: ['./src/api/*.ts', './src/api/routes/*.ts'], // 扫描的文件路径
};

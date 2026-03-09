/**
 * 通用 REST API 适配器
 * 可以对接任何 RESTful API
 */

import axios, { AxiosInstance } from 'axios';
import { SystemAdapter, AdapterManager } from './AdapterManager';
import { AdapterConfig } from '../core/types';
import { logger } from '../utils/logger';

export class RESTAdapter implements SystemAdapter {
  name: string;
  type: 'erp' | 'crm' | 'oa' | 'im' | 'custom' = 'custom';
  
  private client: AxiosInstance;
  private config: any;

  constructor(name: string) {
    this.name = name;
    this.client = axios.create();
  }

  /**
   * 初始化适配器
   */
  async init(config: AdapterConfig): Promise<void> {
    this.config = config;
    
    // 创建 axios 实例
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 设置认证
    if (config.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${config.apiKey}`;
    }

    if (config.credentials) {
      // 支持自定义认证方式
      const { headerName, headerValue } = config.credentials;
      if (headerName && headerValue) {
        this.client.defaults.headers.common[headerName] = headerValue;
      }
    }

    logger.info('REST 适配器初始化完成', { name: this.name, baseUrl: config.baseUrl });
  }

  /**
   * 调用 API
   */
  async call(method: string, params?: any): Promise<any> {
    logger.info('REST API 调用', { adapter: this.name, method, params });

    try {
      // 解析 method: "GET /api/orders" 或 "POST /api/orders"
      const [httpMethod, path] = method.split(' ');
      const upperMethod = httpMethod.toUpperCase();

      let response;

      switch (upperMethod) {
        case 'GET':
          response = await this.client.get(path, { params });
          break;
        
        case 'POST':
          response = await this.client.post(path, params);
          break;
        
        case 'PUT':
          response = await this.client.put(path, params);
          break;
        
        case 'DELETE':
          response = await this.client.delete(path, { data: params });
          break;
        
        case 'PATCH':
          response = await this.client.patch(path, params);
          break;
        
        default:
          throw new Error(`不支持的 HTTP 方法: ${upperMethod}`);
      }

      logger.info('REST API 调用成功', { 
        adapter: this.name, 
        method, 
        status: response.status 
      });

      return response.data;

    } catch (error: any) {
      logger.error('REST API 调用失败', {
        adapter: this.name,
        method,
        error: error.response?.data || error.message,
      });
      throw error;
    }
  }

  /**
   * 自发现：探索 API 结构
   */
  async discover(): Promise<any> {
    logger.info('开始 API 自发现', { adapter: this.name });

    const discovery = {
      endpoints: [],
      schemas: [],
    };

    try {
      // 尝试获取 OpenAPI/Swagger 文档
      const swaggerUrls = [
        '/swagger.json',
        '/api-docs',
        '/openapi.json',
        '/v2/api-docs',
        '/v3/api-docs',
      ];

      for (const url of swaggerUrls) {
        try {
          const response = await this.client.get(url);
          if (response.data) {
            logger.info('发现 API 文档', { url });
            
            // 解析 OpenAPI 文档
            const apiDoc = response.data;
            
            if (apiDoc.paths) {
              for (const [path, methods] of Object.entries(apiDoc.paths)) {
                for (const [method, spec] of Object.entries(methods as any)) {
                  if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
                    discovery.endpoints.push({
                      method: method.toUpperCase(),
                      path,
                      summary: (spec as any).summary || '',
                      description: (spec as any).description || '',
                    });
                  }
                }
              }
            }

            break; // 找到文档就停止
          }
        } catch (error) {
          // 继续尝试下一个 URL
        }
      }

      logger.info('API 自发现完成', { 
        adapter: this.name, 
        endpointCount: discovery.endpoints.length 
      });

      return discovery;

    } catch (error: any) {
      logger.error('API 自发现失败', { error: error.message });
      return discovery;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 尝试访问根路径或健康检查端点
      const healthUrls = ['/health', '/api/health', '/', '/api'];
      
      for (const url of healthUrls) {
        try {
          await this.client.get(url);
          return true;
        } catch (error) {
          // 继续尝试
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * 设置请求拦截器
   */
  setRequestInterceptor(interceptor: (config: any) => any): void {
    this.client.interceptors.request.use(interceptor);
  }

  /**
   * 设置响应拦截器
   */
  setResponseInterceptor(
    onSuccess: (response: any) => any,
    onError?: (error: any) => any
  ): void {
    this.client.interceptors.response.use(onSuccess, onError);
  }
}

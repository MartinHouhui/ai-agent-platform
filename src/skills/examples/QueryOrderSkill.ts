/**
 * 查询订单 Skill
 * 示例：从业务系统查询订单数据
 */

import { SkillDefinition } from '../../core/types';

export const QueryOrderSkill: SkillDefinition = {
  id: 'query-order-v1',
  name: '查询订单',
  version: '1.0.0',
  description: '从业务系统查询订单信息，支持按订单号、客户、日期等条件查询',
  
  triggers: {
    intent: /(查询|查看|搜索|获取).*(订单|order)/i,
    domain: 'order',
  },
  
  executor: {
    type: 'code',
    code: `
/**
 * 查询订单
 * @param params 查询参数
 * @param adapters 适配器管理器
 * @returns 订单数据
 */
async function execute(params, { adapters, logger }) {
  const { orderId, customerId, startDate, endDate, status } = params;
  
  logger.info('开始查询订单', { params });
  
  // 获取业务系统适配器（ERP/CRM）
  const adapter = await adapters.getAdapter('business-system');
  
  // 构建查询条件
  const queryParams = {};
  if (orderId) queryParams.order_id = orderId;
  if (customerId) queryParams.customer_id = customerId;
  if (startDate) queryParams.start_date = startDate;
  if (endDate) queryParams.end_date = endDate;
  if (status) queryParams.status = status;
  
  // 调用业务系统 API
  const response = await adapter.call('GET /api/orders', queryParams);
  
  // 格式化结果
  const orders = response.data || response.orders || [];
  
  logger.info('查询订单完成', { count: orders.length });
  
  return {
    success: true,
    data: orders,
    message: \`找到 \${orders.length} 条订单记录\`
  };
}
    `
  },
  
  metadata: {
    createdAt: new Date('2026-03-09'),
    learnedFrom: 'manual-design',
    successRate: 1.0,
    usageCount: 0,
  },
};

/**
 * 使用示例：
 * 
 * // 通过 Agent 调用
 * const result = await agent.process('帮我查询今天的订单');
 * 
 * // 或者直接调用 Skill
 * const skillManager = new SkillManager();
 * await skillManager.registerSkill(QueryOrderSkill);
 * const result = await skillManager.executeSkill('query-order-v1', {
 *   startDate: '2026-03-09',
 *   endDate: '2026-03-09'
 * });
 */

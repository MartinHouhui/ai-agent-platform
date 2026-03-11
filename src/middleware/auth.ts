/**
 * 认证中间件
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-agent-platform-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

/**
 * 生成 JWT Token
 */
export function generateToken(user: any): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  // 使用 any 类型绕过类型检查（jsonwebtoken 类型定义问题）
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 认证中间件 - 验证 Token
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 从 header 获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供认证 Token',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer "
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token 无效或已过期',
        code: 'INVALID_TOKEN',
      });
    }

    // 将用户信息附加到请求对象
    req.user = decoded;
    next();

  } catch (error: any) {
    logger.error('认证中间件错误', { error: error.message });
    return res.status(500).json({
      success: false,
      error: '认证失败',
      code: 'AUTH_ERROR',
    });
  }
}

/**
 * 角色检查中间件
 */
export function roleMiddleware(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未认证',
        code: 'UNAUTHORIZED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: '权限不足',
        code: 'FORBIDDEN',
      });
    }

    next();
  };
}

/**
 * 可选认证中间件 - Token 存在则验证，不存在则跳过
 */
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error: any) {
    // 可选认证失败不阻止请求
    next();
  }
}

/**
 * 认证 API 路由
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export function createAuthRoutes(): Router {
  const router = Router();
  const authService = new AuthService();

  /**
   * POST /api/auth/register
   * 用户注册
   */
  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;

      // 验证必填字段
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: '用户名、邮箱和密码为必填项',
        });
      }

      // 验证密码强度
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: '密码长度至少 6 位',
        });
      }

      const { user, token } = await authService.register(username, email, password);

      // 返回用户信息（不包含密码）
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };

      res.status(201).json({
        success: true,
        data: {
          user: userResponse,
          token,
        },
      });

    } catch (error: any) {
      logger.error('注册失败', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/auth/login
   * 用户登录
   */
  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: '用户名和密码为必填项',
        });
      }

      const { user, token } = await authService.login(username, password);

      // 返回用户信息
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      };

      res.json({
        success: true,
        data: {
          user: userResponse,
          token,
        },
      });

    } catch (error: any) {
      logger.error('登录失败', { error: error.message });
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/auth/me
   * 获取当前用户信息
   */
  router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: '用户不存在',
        });
      }

      // 返回用户信息
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      };

      res.json({
        success: true,
        data: userResponse,
      });

    } catch (error: any) {
      logger.error('获取用户信息失败', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * PUT /api/auth/profile
   * 更新用户信息
   */
  router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const updates = req.body;

      // 过滤允许更新的字段
      const allowedFields = ['avatar', 'preferences'];
      const filteredUpdates: any = {};
      for (const key of allowedFields) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }

      const user = await authService.updateUser(userId, filteredUpdates);

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          preferences: user.preferences,
        },
      });

    } catch (error: any) {
      logger.error('更新用户信息失败', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/auth/change-password
   * 修改密码
   */
  router.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: '原密码和新密码为必填项',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: '新密码长度至少 6 位',
        });
      }

      await authService.changePassword(userId, oldPassword, newPassword);

      res.json({
        success: true,
        message: '密码修改成功',
      });

    } catch (error: any) {
      logger.error('修改密码失败', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
}

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { MysqlUserRepository } from '../infrastructure/repositories/mysql-user.repository';
import { authenticate } from '../middleware/auth.middleware';
import { env } from '../config/env.config';

export function register(router: Router): void {
  const repository = new MysqlUserRepository();
  const service = new AuthService(repository);
  const controller = new AuthController(service);

  const basePath = env.api.basePath;

  router.post(`${basePath}/auth/register`, controller.register);
  router.post(`${basePath}/auth/login`, controller.login);
  router.get(`${basePath}/auth/me`, authenticate, controller.me);
  router.put(`${basePath}/auth/profile`, authenticate, controller.updateProfile);
  router.put(`${basePath}/auth/password`, authenticate, controller.updatePassword);
}

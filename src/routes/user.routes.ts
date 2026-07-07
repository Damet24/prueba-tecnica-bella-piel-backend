import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { MysqlUserRepository } from '../infrastructure/repositories/mysql-user.repository';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { env } from '../config/env.config';

export function register(router: Router): void {
  const repository = new MysqlUserRepository();
  const service = new UserService(repository);
  const controller = new UserController(service);

  const basePath = env.api.basePath;

  router.use(`${basePath}/users`, authenticate, requireAdmin);
  router.get(`${basePath}/users`, controller.getAll);
  router.get(`${basePath}/users/:id`, controller.getById);
  router.post(`${basePath}/users`, controller.create);
  router.put(`${basePath}/users/:id`, controller.update);
  router.delete(`${basePath}/users/:id`, controller.delete);
}

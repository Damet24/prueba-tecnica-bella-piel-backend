import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { MysqlTaskRepository } from '../infrastructure/repositories/mysql-task.repository';
import { env } from '../config/env.config';

export function register(router: Router): void {
  const repository = new MysqlTaskRepository();
  const service = new TaskService(repository);
  const controller = new TaskController(service);

  const basePath = env.api.basePath;

  router.get(`${basePath}/tasks`, controller.getAll);
  router.get(`${basePath}/tasks/:id`, controller.getById);
  router.post(`${basePath}/tasks`, controller.create);
  router.put(`${basePath}/tasks/:id`, controller.update);
  router.delete(`${basePath}/tasks/:id`, controller.delete);
}

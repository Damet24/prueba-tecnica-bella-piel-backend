import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.service.getAll(req.userId!);
      res.status(httpStatus.OK).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.service.getById(req.params.id as string);
      res.status(httpStatus.OK).json(task);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.service.create({ ...req.body, user_id: req.userId });
      res.status(httpStatus.CREATED).json(task);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.service.update(req.params.id as string, req.body);
      res.status(httpStatus.OK).json(task);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id as string);
      res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

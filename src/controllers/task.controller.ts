import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import httpStatus from 'http-status';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.service.getAll();
      res.status(httpStatus.OK).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.service.getById(req.params.id as string);
      res.status(httpStatus.OK).json(task);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.service.create(req.body);
      res.status(httpStatus.CREATED).json(task);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const task = await this.service.update(req.params.id as string, req.body);
      res.status(httpStatus.OK).json(task);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id as string);
      res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

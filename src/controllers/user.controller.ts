import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { UserService } from '../services/user.service';

export class UserController {
  constructor(private readonly service: UserService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.getAll();
      res.status(httpStatus.OK).json(users);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.getById(Number(req.params.id));
      res.status(httpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.create(req.body);
      res.status(httpStatus.CREATED).json(user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.update(Number(req.params.id), req.body);
      res.status(httpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(Number(req.params.id));
      res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

import { Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class UserController {
  constructor(private readonly service: UserService) {}

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.getAll();
      const filtered = users.filter(u => u.id !== req.userId);
      res.status(httpStatus.OK).json(filtered);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.getById(Number(req.params.id));
      res.status(httpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  };

  getDeleted = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.getDeleted();
      res.status(httpStatus.OK).json(users);
    } catch (error) {
      next(error);
    }
  };

  restore = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.restore(Number(req.params.id));
      res.status(httpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.create(req.body);
      res.status(httpStatus.CREATED).json(user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.update(Number(req.params.id), req.body);
      res.status(httpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.userId === Number(req.params.id)) {
        res.status(httpStatus.FORBIDDEN).json({ error: 'You cannot delete yourself' });
        return;
      }
      await this.service.delete(Number(req.params.id));
      res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

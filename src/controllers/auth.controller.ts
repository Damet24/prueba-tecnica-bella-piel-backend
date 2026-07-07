import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.register(req.body);
      res.status(httpStatus.CREATED).json(user);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.me(req.userId as number);
      res.status(httpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  };
}

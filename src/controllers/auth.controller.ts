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

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.updateProfile(req.userId as number, req.body);
      res.status(httpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  };

  updatePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.service.updatePassword(req.userId as number, currentPassword, newPassword);
      res.status(httpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
}

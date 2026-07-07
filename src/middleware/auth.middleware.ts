import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { env } from '../config/env.config';
import { ForbiddenError } from '../domain/errors';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRol?: string;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).json({ error: 'Token is required' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwt.secret) as { id: number; rol: string };
    req.userId = payload.id;
    req.userRol = payload.rol;
    next();
  } catch {
    res.status(httpStatus.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.userRol !== 'admin') {
    res.status(httpStatus.FORBIDDEN).json({ error: new ForbiddenError('Admin access required').message });
    return;
  }
  next();
}

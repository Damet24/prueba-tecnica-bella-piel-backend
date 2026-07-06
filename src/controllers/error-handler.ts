import { type Request, type Response, type NextFunction } from 'express';
import httpStatus from 'http-status';
import { DomainError } from '../domain/errors';
import logger from '../config/logger';
import { env } from '../config/env.config';

const errorCodeToHttpStatus: Record<string, number> = {
  TASK_NOT_FOUND: httpStatus.NOT_FOUND,
  TASK_VALIDATION_ERROR: httpStatus.BAD_REQUEST,
  INVALID_TASK_STATUS: httpStatus.BAD_REQUEST,
};

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof DomainError) {
    const httpCode = errorCodeToHttpStatus[err.code] ?? httpStatus.INTERNAL_SERVER_ERROR;
    logger.warn(`${req.method} ${req.originalUrl} - ${err.code}: ${err.message}`);
    res.status(httpCode).json({ error: err.message, code: err.code });
    return;
  }

  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    stack: env.isDev ? err.stack : undefined,
  });
  const message = env.isDev ? err.message : 'Internal server error';
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: message });
}

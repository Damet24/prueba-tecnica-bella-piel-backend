import express, { Router, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import httpStatus from 'http-status';
import http from 'node:http';
import { register } from './routes/task.routes';
import { errorHandler } from './controllers/error-handler';
import logger from './config/logger';

export class Server {
  private readonly express: express.Express;
  readonly port: string;
  httpServer?: http.Server;

  constructor(port: string) {
    this.port = port;
    this.express = express();
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(helmet.xssFilter());
    this.express.use(helmet.noSniff());
    this.express.use(helmet.hidePoweredBy());
    this.express.use(helmet.frameguard({ action: 'deny' }));
    this.express.use(cors());

    const router = Router();
    register(router);
    this.express.use(router);

    router.use((req: Request, res: Response, next: NextFunction) => {
      logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
      res.status(httpStatus.NOT_FOUND).json({ error: httpStatus[404] });
    });

    router.use(errorHandler);
  }

  async listen(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.httpServer = this.express.listen(this.port, () => {
        logger.info(`Server running at http://localhost:${this.port}`);
        resolve();
      });
    });
  }
}

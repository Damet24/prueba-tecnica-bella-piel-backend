import express, { Router, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import httpStatus from 'http-status';
import http from 'node:http';
import swaggerUi from 'swagger-ui-express';
import { register as registerTaskRoutes } from './routes/task.routes';
import { register as registerAuthRoutes } from './routes/auth.routes';
import { register as registerUserRoutes } from './routes/user.routes';
import { errorHandler } from './controllers/error-handler';
import { swaggerSpec } from './config/swagger';
import { env } from './config/env.config';
import { seedDefaultAdmin } from './database/seed';
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

    if (env.swagger.enabled) {
      this.express.use(env.swagger.path, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
      this.express.get(`${env.swagger.path}.json`, (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
      });
      logger.info(`Swagger docs available at http://localhost:${this.port}${env.swagger.path}`);
    }

    const router = Router();
    registerTaskRoutes(router);
    registerAuthRoutes(router);
    registerUserRoutes(router);
    this.express.use(router);

    router.use((req: Request, res: Response, next: NextFunction) => {
      logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
      res.status(httpStatus.NOT_FOUND).json({ error: httpStatus[404] });
    });

    router.use(errorHandler);
  }

  async listen(): Promise<void> {
    await seedDefaultAdmin();
    await new Promise<void>((resolve) => {
      this.httpServer = this.express.listen(this.port, () => {
        logger.info(`Server running at http://localhost:${this.port}`);
        resolve();
      });
    });
  }
}

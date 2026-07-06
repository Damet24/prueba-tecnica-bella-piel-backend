import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: env.api.version,
      description: 'API REST para gestión de tareas',
    },
    servers: [
      {
        url: `http://localhost:${env.port}${env.api.basePath}`,
        description: 'Local server',
      },
    ],
  },
  apis: ['src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

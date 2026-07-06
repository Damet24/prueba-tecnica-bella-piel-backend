import winston from 'winston';
import { env } from './env.config';

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  }),
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: env.isDev ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({
      format: env.isDev ? consoleFormat : jsonFormat,
    }),
  ],
});

export default logger;

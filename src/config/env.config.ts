import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  isDev: boolean;
  isProduction: boolean;
  port: number;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  api: {
    version: string;
    basePath: string;
  };
}

function loadEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = Number(process.env.PORT) || 3000;
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT) || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || 'root';
  const dbName = process.env.DB_NAME || 'task_manager';
  const apiVersion = process.env.API_VERSION || 'v1';

  if (!dbHost || !dbUser || !dbName) {
    throw new Error('Missing required environment variables');
  }

  return {
    nodeEnv,
    isDev: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    port,
    db: {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      name: dbName,
    },
    api: {
      version: apiVersion,
      basePath: `/api/${apiVersion}`,
    },
  };
}

export const env = loadEnv();

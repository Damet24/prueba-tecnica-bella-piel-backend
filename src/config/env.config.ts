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
  jwt: {
    secret: string;
    expiresIn: string;
  };
  defaultAdmin: {
    nombre: string;
    email: string;
    password: string;
  };
  api: {
    version: string;
    basePath: string;
  };
  swagger: {
    enabled: boolean;
    path: string;
  };
}

export function loadEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = Number(process.env.PORT) || 3000;
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT) || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || 'root';
  const dbName = process.env.DB_NAME || 'task_manager';
  const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@taskmanager.com';
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
  const defaultAdminNombre = process.env.DEFAULT_ADMIN_NOMBRE || 'Administrador';
  const apiVersion = process.env.API_VERSION || 'v1';

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
    jwt: {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn,
    },
    defaultAdmin: {
      nombre: defaultAdminNombre,
      email: defaultAdminEmail,
      password: defaultAdminPassword,
    },
    api: {
      version: apiVersion,
      basePath: `/api/${apiVersion}`,
    },
    swagger: {
      enabled: nodeEnv === 'development',
      path: '/api-docs',
    },
  };
}

export const env = loadEnv();

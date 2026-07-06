import { describe, it, expect, afterEach } from 'vitest';
import { loadEnv } from '../../src/config/env.config';

const originalEnv = process.env;

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('loadEnv', () => {
  it('returns development defaults when no env vars are set', () => {
    process.env = {};

    const config = loadEnv();

    expect(config.nodeEnv).toBe('development');
    expect(config.isDev).toBe(true);
    expect(config.isProduction).toBe(false);
    expect(config.port).toBe(3000);
    expect(config.db.host).toBe('localhost');
    expect(config.db.port).toBe(3306);
    expect(config.db.user).toBe('root');
    expect(config.db.password).toBe('root');
    expect(config.db.name).toBe('task_manager');
    expect(config.api.version).toBe('v1');
    expect(config.api.basePath).toBe('/api/v1');
  });

  it('reads values from environment variables', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4000';
    process.env.DB_HOST = 'production-db.example.com';
    process.env.DB_PORT = '3307';
    process.env.DB_USER = 'admin';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_NAME = 'prod_db';
    process.env.API_VERSION = 'v2';

    const config = loadEnv();

    expect(config.nodeEnv).toBe('production');
    expect(config.isDev).toBe(false);
    expect(config.isProduction).toBe(true);
    expect(config.port).toBe(4000);
    expect(config.db.host).toBe('production-db.example.com');
    expect(config.db.port).toBe(3307);
    expect(config.db.user).toBe('admin');
    expect(config.db.password).toBe('secret');
    expect(config.db.name).toBe('prod_db');
    expect(config.api.version).toBe('v2');
    expect(config.api.basePath).toBe('/api/v2');
  });

  it('coerces port to number', () => {
    process.env.PORT = '8080';

    const config = loadEnv();

    expect(config.port).toBeTypeOf('number');
    expect(config.port).toBe(8080);
  });

  it('coerces db port to number', () => {
    process.env.DB_PORT = '3306';

    const config = loadEnv();

    expect(config.db.port).toBeTypeOf('number');
    expect(config.db.port).toBe(3306);
  });

  it('isDev true for development', () => {
    process.env.NODE_ENV = 'development';

    const config = loadEnv();

    expect(config.isDev).toBe(true);
    expect(config.isProduction).toBe(false);
  });

  it('isProduction true for production', () => {
    process.env.NODE_ENV = 'production';

    const config = loadEnv();

    expect(config.isDev).toBe(false);
    expect(config.isProduction).toBe(true);
  });

  it('isDev false for any non-development value', () => {
    process.env.NODE_ENV = 'test';

    const config = loadEnv();

    expect(config.isDev).toBe(false);
    expect(config.isProduction).toBe(false);
  });
});

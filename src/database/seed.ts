import bcrypt from 'bcryptjs';
import pool from './mysql.connection';
import { env } from '../config/env.config';
import logger from '../config/logger';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';

interface CountRow extends RowDataPacket {
  total: number;
}

export async function seedDefaultAdmin(): Promise<void> {
  try {
    const [rows] = await pool.query<CountRow[]>(
      'SELECT COUNT(*) as total FROM users WHERE rol = ? AND fecha_eliminacion IS NULL',
      ['admin'],
    );

    const total = rows[0]?.total ?? 0;

    if (total > 0) {
      logger.info('Default admin already exists, skipping seed');
      return;
    }

    const hashedPassword = await bcrypt.hash(env.defaultAdmin.password, 10);

    await pool.query<ResultSetHeader>(
      'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [env.defaultAdmin.nombre, env.defaultAdmin.email, hashedPassword, 'admin'],
    );

    logger.info(`Default admin created: ${env.defaultAdmin.email}`);
  } catch (error) {
    logger.error('Failed to seed default admin', error);
  }
}

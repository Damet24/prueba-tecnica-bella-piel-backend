import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import pool from '../../database/mysql.connection';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

interface UserRow extends RowDataPacket, User {}

export class MysqlUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE fecha_eliminacion IS NULL ORDER BY fecha_creacion DESC',
    );
    return rows;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE id = ? AND fecha_eliminacion IS NULL',
      [id],
    );
    return rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ? AND fecha_eliminacion IS NULL',
      [email],
    );
    return rows[0] || null;
  }

  async create(data: Pick<User, 'nombre' | 'email' | 'password'>): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (nombre, email, password) VALUES (?, ?, ?)',
      [data.nombre, data.email, data.password],
    );
    return (await this.findById(result.insertId)) as User;
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      values.push(data.password);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET fecha_eliminacion = NOW() WHERE id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }
}

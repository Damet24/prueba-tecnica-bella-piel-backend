import { randomUUID } from 'node:crypto';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import pool from '../../database/mysql.connection';
import { Task } from '../../domain/task.entity';
import { TaskRepository } from '../../domain/repositories/task.repository';

interface TaskRow extends RowDataPacket, Task {}

export class MysqlTaskRepository implements TaskRepository {
  async findAll(userId: number): Promise<Task[]> {
    const [rows] = await pool.query<TaskRow[]>(
      'SELECT * FROM tasks WHERE user_id = ? AND fecha_eliminacion IS NULL ORDER BY fecha_creacion DESC',
      [userId],
    );
    return rows;
  }

  async findById(id: string): Promise<Task | null> {
    const [rows] = await pool.query<TaskRow[]>(
      'SELECT * FROM tasks WHERE id = ? AND fecha_eliminacion IS NULL',
      [id],
    );
    return rows[0] || null;
  }

  async create(task: Pick<Task, 'titulo' | 'descripcion' | 'estado' | 'user_id'>): Promise<Task> {
    const id = randomUUID();
    await pool.query(
      'INSERT INTO tasks (id, user_id, titulo, descripcion, estado) VALUES (?, ?, ?, ?, ?)',
      [id, task.user_id, task.titulo, task.descripcion, task.estado],
    );
    return (await this.findById(id)) as Task;
  }

  async update(id: string, data: Partial<Task>): Promise<Task | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.titulo !== undefined) {
      fields.push('titulo = ?');
      values.push(data.titulo);
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.estado !== undefined) {
      fields.push('estado = ?');
      values.push(data.estado);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE tasks SET fecha_eliminacion = NOW() WHERE id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }
}

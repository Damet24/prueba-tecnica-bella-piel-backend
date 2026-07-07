import { TaskRepository } from '../domain/repositories/task.repository';
import { Task } from '../domain/task.entity';
import { TaskNotFoundError, InvalidTaskStatusError, TaskValidationError } from '../domain/errors';

const VALID_STATUSES: Task['estado'][] = ['pendiente', 'en progreso', 'completada'];

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  async getAll(userId: number): Promise<Task[]> {
    return this.repository.findAll(userId);
  }

  async getById(id: string): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) throw new TaskNotFoundError(id);
    return task;
  }

  async create(data: { titulo: string; descripcion?: string; estado?: string; user_id: number }): Promise<Task> {
    if (!data.titulo || data.titulo.trim().length === 0) {
      throw new TaskValidationError('Title is required');
    }

    const estado = data.estado ?? 'pendiente';
    if (!VALID_STATUSES.includes(estado as Task['estado'])) {
      throw new InvalidTaskStatusError(estado);
    }

    return this.repository.create({
      titulo: data.titulo.trim(),
      descripcion: data.descripcion?.trim(),
      estado: estado as Task['estado'],
      user_id: data.user_id,
    });
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new TaskNotFoundError(id);

    if (data.titulo !== undefined && data.titulo.trim().length === 0) {
      throw new TaskValidationError('Title cannot be empty');
    }

    if (data.estado !== undefined && !VALID_STATUSES.includes(data.estado)) {
      throw new InvalidTaskStatusError(data.estado);
    }

    const cleanData: Partial<Task> = {};
    if (data.titulo !== undefined) cleanData.titulo = data.titulo.trim();
    if (data.descripcion !== undefined) cleanData.descripcion = data.descripcion?.trim();
    if (data.estado !== undefined) cleanData.estado = data.estado;

    return this.repository.update(id, cleanData) as Promise<Task>;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new TaskNotFoundError(id);

    await this.repository.softDelete(id);
  }
}

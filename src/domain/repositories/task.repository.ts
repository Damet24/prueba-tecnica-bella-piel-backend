import { Task } from '../task.entity';

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(task: Pick<Task, 'titulo' | 'descripcion' | 'estado'>): Promise<Task>;
  update(id: string, data: Partial<Task>): Promise<Task | null>;
  softDelete(id: string): Promise<boolean>;
}

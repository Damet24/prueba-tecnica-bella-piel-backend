import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from '../../src/services/task.service';
import { TaskRepository } from '../../src/domain/repositories/task.repository';
import { Task } from '../../src/domain/task.entity';
import {
  TaskNotFoundError,
  InvalidTaskStatusError,
  TaskValidationError,
} from '../../src/domain/errors';

const mockTask: Task = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 1,
  titulo: 'Test task',
  descripcion: 'A description',
  estado: 'pendiente',
  fecha_creacion: new Date('2024-01-01'),
  fecha_actualizacion: new Date('2024-01-01'),
};

function createMockRepo(): TaskRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  };
}

describe('TaskService', () => {
  let repo: TaskRepository;
  let service: TaskService;

  beforeEach(() => {
    repo = createMockRepo();
    service = new TaskService(repo);
  });

  describe('getAll', () => {
    it('returns tasks for the given user', async () => {
      vi.mocked(repo.findAll!).mockResolvedValue([mockTask]);

      const result = await service.getAll(1);

      expect(result).toEqual([mockTask]);
      expect(repo.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('getById', () => {
    it('returns task when found', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);

      const result = await service.getById(mockTask.id);

      expect(result).toEqual(mockTask);
      expect(repo.findById).toHaveBeenCalledWith(mockTask.id);
    });

    it('throws TaskNotFoundError when task does not exist', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(null);

      await expect(service.getById('nonexistent')).rejects.toThrow(TaskNotFoundError);
      expect(repo.findById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('create', () => {
    it('creates task with default estado pendiente', async () => {
      vi.mocked(repo.create!).mockResolvedValue(mockTask);

      const result = await service.create({ titulo: 'Test task', descripcion: 'Desc', user_id: 1 });

      expect(result).toEqual(mockTask);
      expect(repo.create).toHaveBeenCalledWith({
        titulo: 'Test task',
        descripcion: 'Desc',
        estado: 'pendiente',
        user_id: 1,
      });
    });

    it('uses provided estado when valid', async () => {
      vi.mocked(repo.create!).mockResolvedValue({ ...mockTask, estado: 'completada' });

      const result = await service.create({ titulo: 'Test', estado: 'completada', user_id: 1 });

      expect(result.estado).toBe('completada');
      expect(repo.create).toHaveBeenCalledWith({
        titulo: 'Test',
        descripcion: undefined,
        estado: 'completada',
        user_id: 1,
      });
    });

    it('throws InvalidTaskStatusError for invalid estado', async () => {
      await expect(
        service.create({ titulo: 'Test', estado: 'invalid_status', user_id: 1 }),
      ).rejects.toThrow(InvalidTaskStatusError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('throws TaskValidationError when titulo is empty', async () => {
      await expect(
        service.create({ titulo: '', user_id: 1 }),
      ).rejects.toThrow(TaskValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('throws TaskValidationError when titulo is only whitespace', async () => {
      await expect(
        service.create({ titulo: '   ', user_id: 1 }),
      ).rejects.toThrow(TaskValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('trims titulo before creating', async () => {
      vi.mocked(repo.create!).mockResolvedValue(mockTask);

      await service.create({ titulo: '  My Task  ', user_id: 1 });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'My Task' }),
      );
    });

    it('trims descripcion when provided', async () => {
      vi.mocked(repo.create!).mockResolvedValue(mockTask);

      await service.create({ titulo: 'Task', descripcion: '  Desc  ', user_id: 1 });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ descripcion: 'Desc' }),
      );
    });
  });

  describe('update', () => {
    it('updates task when it exists', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);
      vi.mocked(repo.update!).mockResolvedValue({ ...mockTask, titulo: 'Updated' });

      const result = await service.update(mockTask.id, { titulo: 'Updated' });

      expect(result.titulo).toBe('Updated');
      expect(repo.findById).toHaveBeenCalledWith(mockTask.id);
      expect(repo.update).toHaveBeenCalledWith(mockTask.id, { titulo: 'Updated' });
    });

    it('throws TaskNotFoundError when task does not exist', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { titulo: 'Updated' }),
      ).rejects.toThrow(TaskNotFoundError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws TaskValidationError when titulo is empty', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);

      await expect(
        service.update(mockTask.id, { titulo: '' }),
      ).rejects.toThrow(TaskValidationError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws TaskValidationError when titulo is only whitespace', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);

      await expect(
        service.update(mockTask.id, { titulo: '   ' }),
      ).rejects.toThrow(TaskValidationError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws InvalidTaskStatusError for invalid estado', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);

      await expect(
        service.update(mockTask.id, { estado: 'bogus' as Task['estado'] }),
      ).rejects.toThrow(InvalidTaskStatusError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('trims titulo before updating', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);
      vi.mocked(repo.update!).mockResolvedValue(mockTask);

      await service.update(mockTask.id, { titulo: '  Trimmed  ' });

      expect(repo.update).toHaveBeenCalledWith(mockTask.id, { titulo: 'Trimmed' });
    });

    it('trims descripcion before updating', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);
      vi.mocked(repo.update!).mockResolvedValue(mockTask);

      await service.update(mockTask.id, { descripcion: '  Desc  ' });

      expect(repo.update).toHaveBeenCalledWith(mockTask.id, { descripcion: 'Desc' });
    });

    it('passes only provided fields to repository', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);
      vi.mocked(repo.update!).mockResolvedValue(mockTask);

      await service.update(mockTask.id, { estado: 'completada' });

      expect(repo.update).toHaveBeenCalledWith(mockTask.id, { estado: 'completada' });
    });
  });

  describe('delete', () => {
    it('soft deletes task when it exists', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockTask);
      vi.mocked(repo.softDelete!).mockResolvedValue(true);

      await service.delete(mockTask.id);

      expect(repo.findById).toHaveBeenCalledWith(mockTask.id);
      expect(repo.softDelete).toHaveBeenCalledWith(mockTask.id);
    });

    it('throws TaskNotFoundError when task does not exist', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(TaskNotFoundError);
      expect(repo.softDelete).not.toHaveBeenCalled();
    });
  });
});

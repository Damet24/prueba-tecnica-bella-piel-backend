import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { User, PublicUser } from '../../src/domain/user.entity';
import { TaskNotFoundError, EmailAlreadyExistsError } from '../../src/domain/errors';

vi.mock('bcryptjs', () => {
  const hash = vi.fn().mockResolvedValue('$2a$10$hashedpassword');
  const compare = vi.fn().mockResolvedValue(true);
  return { default: { hash, compare }, hash, compare };
});

const mockUser: User = {
  id: 1,
  nombre: 'Test User',
  email: 'test@test.com',
  password: '$2a$10$hashedpassword',
  rol: 'usuario',
  fecha_creacion: new Date('2024-01-01'),
  fecha_actualizacion: new Date('2024-01-01'),
};

const mockPublicUser: PublicUser = {
  id: 1,
  nombre: 'Test User',
  email: 'test@test.com',
  rol: 'usuario',
  fecha_creacion: new Date('2024-01-01'),
  fecha_actualizacion: new Date('2024-01-01'),
};

function createMockRepo(): UserRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  };
}

describe('UserService', () => {
  let repo: UserRepository;
  let service: UserService;

  beforeEach(() => {
    repo = createMockRepo();
    service = new UserService(repo);
  });

  describe('getAll', () => {
    it('returns all users without passwords', async () => {
      vi.mocked(repo.findAll!).mockResolvedValue([mockUser]);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPublicUser);
      expect(result[0]).not.toHaveProperty('password');
      expect(repo.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('getById', () => {
    it('returns public user when found', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockUser);

      const result = await service.getById(1);

      expect(result).toEqual(mockPublicUser);
      expect(result).not.toHaveProperty('password');
      expect(repo.findById).toHaveBeenCalledWith(1);
    });

    it('throws TaskNotFoundError when user does not exist', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(TaskNotFoundError);
      expect(repo.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('creates user with hashed password and specified rol', async () => {
      bcrypt.hash.mockResolvedValue('$2a$10$hashedpassword');
      vi.mocked(repo.findByEmail!).mockResolvedValue(null);
      vi.mocked(repo.create!).mockResolvedValue(mockUser);
      vi.mocked(repo.update!).mockResolvedValue(mockUser);
      vi.mocked(repo.findById!).mockResolvedValue(mockUser);

      const result = await service.create({
        nombre: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        rol: 'usuario',
      });

      expect(result).toEqual(mockPublicUser);
      expect(result).not.toHaveProperty('password');
      expect(repo.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Test User', email: 'test@test.com' }),
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repo.update).toHaveBeenCalledWith(1, { rol: 'usuario' });
    });

    it('throws EmailAlreadyExistsError when email is taken', async () => {
      vi.mocked(repo.findByEmail!).mockResolvedValue(mockUser);

      await expect(
        service.create({ nombre: 'Test', email: 'test@test.com', password: 'pass', rol: 'usuario' }),
      ).rejects.toThrow(EmailAlreadyExistsError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates user fields', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, nombre: 'Updated Name' };
      vi.mocked(repo.update!).mockResolvedValue(updatedUser);

      const result = await service.update(1, { nombre: 'Updated Name' });

      expect(result.nombre).toBe('Updated Name');
      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(repo.update).toHaveBeenCalledWith(1, { nombre: 'Updated Name' });
    });

    it('throws TaskNotFoundError when user does not exist', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(null);

      await expect(service.update(999, { nombre: 'New' })).rejects.toThrow(TaskNotFoundError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws EmailAlreadyExistsError when new email is taken', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockUser);
      vi.mocked(repo.findByEmail!).mockResolvedValue({ ...mockUser, id: 2, email: 'taken@test.com' });

      await expect(
        service.update(1, { email: 'taken@test.com' }),
      ).rejects.toThrow(EmailAlreadyExistsError);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('does not check email uniqueness when email is unchanged', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockUser);
      vi.mocked(repo.update!).mockResolvedValue(mockUser);

      await service.update(1, { email: 'test@test.com' });

      expect(repo.findByEmail).not.toHaveBeenCalled();
      expect(repo.update).toHaveBeenCalledWith(1, { email: 'test@test.com' });
    });
  });

  describe('delete', () => {
    it('soft deletes user when it exists', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockUser);
      vi.mocked(repo.softDelete!).mockResolvedValue(true);

      await service.delete(1);

      expect(repo.findById).toHaveBeenCalledWith(1);
      expect(repo.softDelete).toHaveBeenCalledWith(1);
    });

    it('throws TaskNotFoundError when user does not exist', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(TaskNotFoundError);
      expect(repo.softDelete).not.toHaveBeenCalled();
    });
  });
});

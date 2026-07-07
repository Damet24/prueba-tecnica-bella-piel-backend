import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { User, PublicUser } from '../../src/domain/user.entity';
import { InvalidCredentialsError, EmailAlreadyExistsError } from '../../src/domain/errors';

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

describe('AuthService', () => {
  let repo: UserRepository;
  let service: AuthService;

  beforeEach(() => {
    repo = createMockRepo();
    service = new AuthService(repo);
  });

  describe('register', () => {
    it('creates user with hashed password and returns public user', async () => {
      vi.mocked(repo.findByEmail!).mockResolvedValue(null);
      vi.mocked(repo.create!).mockResolvedValue(mockUser);

      const result = await service.register({
        nombre: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual(mockPublicUser);
      expect(result).not.toHaveProperty('password');
      expect(repo.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Test User',
          email: 'test@test.com',
        }),
      );
      const createCall = vi.mocked(repo.create!).mock.calls[0][0];
      expect(createCall.password).not.toBe('password123');
    });

    it('throws EmailAlreadyExistsError when email is taken', async () => {
      vi.mocked(repo.findByEmail!).mockResolvedValue(mockUser);

      await expect(
        service.register({ nombre: 'Test', email: 'test@test.com', password: 'pass' }),
      ).rejects.toThrow(EmailAlreadyExistsError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns user and token when credentials are valid', async () => {
      vi.mocked(repo.findByEmail!).mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login('test@test.com', 'password123');

      expect(result.user).toEqual(mockPublicUser);
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBeTypeOf('string');
      expect(result.token.split('.')).toHaveLength(3);
      expect(repo.findByEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('throws InvalidCredentialsError when user not found', async () => {
      vi.mocked(repo.findByEmail!).mockResolvedValue(null);

      await expect(
        service.login('nonexistent@test.com', 'password123'),
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('throws InvalidCredentialsError when password is wrong', async () => {
      vi.mocked(repo.findByEmail!).mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        service.login('test@test.com', 'wrongpassword'),
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('me', () => {
    it('returns public user when user exists', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(mockUser);

      const result = await service.me(1);

      expect(result).toEqual(mockPublicUser);
      expect(result).not.toHaveProperty('password');
      expect(repo.findById).toHaveBeenCalledWith(1);
    });

    it('throws InvalidCredentialsError when user does not exist', async () => {
      vi.mocked(repo.findById!).mockResolvedValue(null);

      await expect(service.me(999)).rejects.toThrow(InvalidCredentialsError);
    });
  });
});

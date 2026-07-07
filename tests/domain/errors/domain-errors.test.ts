import { describe, it, expect } from 'vitest';
import {
  TaskNotFoundError,
  InvalidTaskStatusError,
  TaskValidationError,
  InvalidCredentialsError,
  EmailAlreadyExistsError,
  ForbiddenError,
  DomainError,
} from '../../../src/domain/errors';

describe('Domain Errors', () => {
  it('TaskNotFoundError has correct code and message', () => {
    const error = new TaskNotFoundError('abc-123');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('TASK_NOT_FOUND');
    expect(error.message).toBe('Task with id "abc-123" not found');
  });

  it('InvalidTaskStatusError has correct code and message', () => {
    const error = new InvalidTaskStatusError('invalido');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('INVALID_TASK_STATUS');
    expect(error.message).toContain('invalido');
    expect(error.message).toContain('pendiente');
    expect(error.message).toContain('en progreso');
    expect(error.message).toContain('completada');
  });

  it('TaskValidationError has correct code and message', () => {
    const error = new TaskValidationError('Title is required');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('TASK_VALIDATION_ERROR');
    expect(error.message).toBe('Title is required');
  });

  it('InvalidCredentialsError has correct code and message', () => {
    const error = new InvalidCredentialsError();

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('INVALID_CREDENTIALS');
    expect(error.message).toBe('Invalid email or password');
  });

  it('EmailAlreadyExistsError has correct code and message', () => {
    const error = new EmailAlreadyExistsError('test@test.com');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('EMAIL_ALREADY_EXISTS');
    expect(error.message).toBe('User with email test@test.com already exists');
  });

  it('ForbiddenError has correct code and default message', () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.message).toBe('Access denied');
  });

  it('ForbiddenError accepts custom message', () => {
    const error = new ForbiddenError('Admin access required');

    expect(error.message).toBe('Admin access required');
  });

  it('DomainError sets name from constructor', () => {
    const error = new TaskNotFoundError('x');

    expect(error.name).toBe('TaskNotFoundError');
  });
});

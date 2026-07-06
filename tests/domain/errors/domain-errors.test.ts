import { describe, it, expect } from 'vitest';
import {
  TaskNotFoundError,
  InvalidTaskStatusError,
  TaskValidationError,
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

  it('DomainError sets name from constructor', () => {
    const error = new TaskNotFoundError('x');

    expect(error.name).toBe('TaskNotFoundError');
  });
});

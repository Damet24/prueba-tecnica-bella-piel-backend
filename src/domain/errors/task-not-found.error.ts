import { DomainError } from './domain.error';

export class TaskNotFoundError extends DomainError {
  readonly code = 'TASK_NOT_FOUND';

  constructor(id: string) {
    super(`Task with id "${id}" not found`);
  }
}

import { DomainError } from './domain.error';

export class InvalidTaskStatusError extends DomainError {
  readonly code = 'INVALID_TASK_STATUS';

  constructor(status: string) {
    super(`"${status}" is not a valid task status. Use: pendiente, en progreso, completada`);
  }
}

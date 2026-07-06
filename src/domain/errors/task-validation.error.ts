import { DomainError } from './domain.error';

export class TaskValidationError extends DomainError {
  readonly code = 'TASK_VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

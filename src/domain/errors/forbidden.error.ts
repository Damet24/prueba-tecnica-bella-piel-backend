import { DomainError } from './domain.error';

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';

  constructor(message = 'Access denied') {
    super(message);
  }
}

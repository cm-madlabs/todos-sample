abstract class ExtendedError extends Error {
  constructor(message: string, error?: Error) {
    super(message);

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true,
    });

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExtendedError);
    }

    if (error) {
      const messageLines = (this.message.match(/\n/g) || []).length + 1;
      if (this.stack) {
        this.stack =
          this.stack
            .split('\n')
            .slice(0, messageLines + 1)
            .join('\n') +
          '\n' +
          error.stack;
      }
    }
  }
}

abstract class TodosError extends ExtendedError {}

export class TodoValidationError extends TodosError {}
export class TodoNotFoundError extends TodosError {
  constructor() {
    super('the specified todo is not found');
  }
}
export class TodoForbiddenError extends TodosError {
  constructor(message: string) {
    super(message);

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: 'TodoNotFoundError',
      writable: true,
    });

    console.error(message);
    this.message = 'the specified todo is not found';
  }
}
export class TodoRepositoryError extends TodosError {
  constructor(message: string) {
    super(message);

    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: 'InternalServerError',
      writable: true,
    });

    console.error(message);
    this.message = 'internal server error';
  }
}

export class UnauthorizedError extends TodosError {}

export class UnknownError extends TodosError {
  constructor(message: string) {
    super(message);

    console.error(message);
    this.message = 'Unknown Error';
  }
}

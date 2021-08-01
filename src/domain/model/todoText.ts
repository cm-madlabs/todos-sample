import {TodoValidationError} from '../../util/error/error';

const limit = 100;

export class TodoText {
  constructor(public readonly value: string) {
    if (value.length > limit) {
      throw new TodoValidationError(
        `todo text is limited to ${limit} characters.`
      );
    }
  }
}

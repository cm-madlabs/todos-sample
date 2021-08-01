import validator from 'validator';
import {TodoValidationError} from '../../util/error/error';

export class TodoId {
  constructor(public readonly value: string) {
    if (!validator.isUUID(value)) {
      throw new TodoValidationError(`${value} is invalid todo ID`);
    }
  }
}

import {ITodoRepository} from '../domain/repository/todoRepository';
import {TodoText} from '../domain/model/todoText';
import {TodoId} from '../domain/model/todoId';
import {v4 as uuid} from 'uuid';
import {Todo} from '../domain/model/todo';
import {TodoValidationError} from '../util/error/error';

export class UserApplication {
  private readonly todoRepository: ITodoRepository;

  constructor(props: {todoRepository: ITodoRepository}) {
    this.todoRepository = props.todoRepository;
  }

  create = async (props: {text: string}) => {
    const id = new TodoId(uuid());
    const text = new TodoText(props.text);

    const todo = new Todo({id, text});

    await this.todoRepository.create(todo);
  };

  find = async (props: {id: string}) => {
    const id = new TodoId(props.id);

    return await this.todoRepository.read(id);
  };

  update = async (props: {id: string; text?: string; checked?: boolean}) => {
    if (props.text === undefined && props.checked === undefined) {
      throw new TodoValidationError('there is no updated content');
    }

    const id = new TodoId(props.id);

    const todo = await this.todoRepository.read(id);

    if (typeof props.text === 'string') {
      todo.changeText(new TodoText(props.text));
    }

    if (typeof props.checked === 'boolean') {
      if (props.checked) {
        todo.check();
      } else {
        todo.unCheck();
      }
    }

    await this.todoRepository.update(todo);
  };

  delete = async (props: {id: string}) => {
    const id = new TodoId(props.id);

    await this.todoRepository.delete(id);
  };
}

import {Todo} from '../model/todo';
import {TodoId} from '../model/todoId';

export interface ITodoRepository {
  create: (todo: Todo) => Promise<void>;
  read: (todoId: TodoId) => Promise<Todo>;
  update: (todo: Todo) => Promise<void>;
  delete: (todoId: TodoId) => Promise<void>;
}

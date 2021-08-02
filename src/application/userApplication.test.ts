import {UserApplication} from './userApplication';
import {createMock} from 'ts-auto-mock';
import {ITodoRepository} from '../domain/repository/todoRepository';
import {On, method} from 'ts-auto-mock/extension';
import {Todo} from '../domain/model/todo';
import {TodoText} from '../domain/model/todoText';
import {TodoId} from '../domain/model/todoId';
import {TodoValidationError} from '../util/error/error';

describe('userApplication', () => {
  test('Todoを作成する', async () => {
    const todoRepository = createMock<ITodoRepository>();
    const mockMethod = On(todoRepository).get(method('create')) as jest.Mock;

    const userApplication = new UserApplication({todoRepository});

    await userApplication.create({text: 'test text'});

    expect(mockMethod.mock.calls).toHaveLength(1);
  });

  test('Todoを取得する', async () => {
    const id = 'ecea1c18-8e7c-4745-938a-4769fbc478f6';
    const text = 'test text';
    const todoRepository = createMock<ITodoRepository>();
    const mockMethod = On(todoRepository).get(method('read')) as jest.Mock;
    mockMethod.mockResolvedValueOnce(
      new Todo({
        id: new TodoId(id),
        text: new TodoText(text),
      })
    );

    const userApplication = new UserApplication({todoRepository});

    const todo = await userApplication.find({id});

    expect(mockMethod.mock.calls[0][0]).toStrictEqual(new TodoId(id));

    expect(todo.getId().value).toBe(id);
    expect(todo.getText().value).toBe(text);
    expect(todo.getChecked()).toBe(false);
  });

  test.each`
    text                   | checked
    ${'updated test text'} | ${undefined}
    ${undefined}           | ${true}
    ${undefined}           | ${false}
  `(
    'Todoを更新する text=$text checked=$checked',
    async (input: {text?: string; checked?: boolean}) => {
      const id = 'ecea1c18-8e7c-4745-938a-4769fbc478f6';
      const beforeText = 'test text';
      const beforeChecked = true;
      const todoRepository = createMock<ITodoRepository>({
        read: async () => {
          return new Todo({
            id: new TodoId(id),
            text: new TodoText(beforeText),
            checked: beforeChecked,
          });
        },
      });
      const mockMethod = On(todoRepository).get(method('update')) as jest.Mock;

      const userApplication = new UserApplication({todoRepository});

      await userApplication.update({
        id,
        text: input.text,
        checked: input.checked,
      });

      const expected = new Todo({
        id: new TodoId(id),
        text:
          input.text !== undefined
            ? new TodoText(input.text)
            : new TodoText(beforeText),
        checked: input.checked !== undefined ? input.checked : beforeChecked,
      });
      const received = mockMethod.mock.calls[0][0] as Todo;

      expect(received.getId().value).toBe(expected.getId().value);
      expect(received.getText().value).toBe(expected.getText().value);
      expect(received.getChecked()).toBe(expected.getChecked());
    }
  );

  test('更新内容を指定しないとTodoの更新に失敗する', async () => {
    const id = 'ecea1c18-8e7c-4745-938a-4769fbc478f6';
    const todoRepository = createMock<ITodoRepository>();

    const userApplication = new UserApplication({todoRepository});

    await expect(
      userApplication.update({
        id,
        text: undefined,
        checked: undefined,
      })
    ).rejects.toThrow(new TodoValidationError('there is no updated content'));
  });

  test('Todoを削除する', async () => {
    const id = 'ecea1c18-8e7c-4745-938a-4769fbc478f6';
    const todoRepository = createMock<ITodoRepository>();
    const mockMethod = On(todoRepository).get(method('delete')) as jest.Mock;
    mockMethod.mockResolvedValueOnce(new TodoId(id));

    const userApplication = new UserApplication({todoRepository});

    await userApplication.delete({id});

    expect(mockMethod.mock.calls[0][0]).toStrictEqual(new TodoId(id));
  });
});

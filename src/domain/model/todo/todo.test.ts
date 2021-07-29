import {Todo} from './todo';
import {TodoValidationError} from '../../../util/error/error';
import {TodoId} from './todoId';
import {TodoText} from './todoText';

describe('Todo', () => {
  test.each`
    text                             | textLength
    ${new TodoText('a')}             | ${'a'.length}
    ${new TodoText('hello')}         | ${'hello'.length}
    ${new TodoText('a'.repeat(100))} | ${100}
  `(
    'テキスト文字数 $textLength で、Todoを作成する',
    ({text}: {text: TodoText}) => {
      const id = new TodoId('5fb1935f-b538-4d66-b049-a907c1f3a184');
      const todo = new Todo({id, text});

      expect(todo.getId()).toBe(id);
      expect(todo.getText()).toBe(text);
      expect(todo.getChecked()).toBe(false);
    }
  );

  test('IDがUUID以外で、TodoIdは作成できない', () => {
    const id = 'invalid id';

    expect(() => {
      new TodoId(id);
    }).toThrow(new TodoValidationError(`${id} is invalid todo ID`));
  });

  test('テキスト文字数 101 で、TodoTextは作成できない', () => {
    const text = 'a'.repeat(101);

    expect(() => {
      new TodoText(text);
    }).toThrow(
      new TodoValidationError('todo text is limited to 100 characters.')
    );
  });

  test('Todoのチェックを切り替えることができる', () => {
    const id = new TodoId('5fb1935f-b538-4d66-b049-a907c1f3a184');
    const text = new TodoText('todo text');
    const todo = new Todo({id, text});

    expect(todo.getChecked()).toBe(false);
    todo.check();
    expect(todo.getChecked()).toBe(true);
    todo.unCheck();
    expect(todo.getChecked()).toBe(false);
  });

  test('Todoのチェックを同じ状態に切り替えることができる', () => {
    const id = new TodoId('5fb1935f-b538-4d66-b049-a907c1f3a184');
    const text = new TodoText('todo text');
    const todo = new Todo({id, text});

    expect(todo.getChecked()).toBe(false);
    todo.check();
    todo.check();
    expect(todo.getChecked()).toBe(true);
    todo.unCheck();
    todo.unCheck();
    expect(todo.getChecked()).toBe(false);
  });
});

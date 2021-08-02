import {createMock} from 'ts-auto-mock';
import {UserApplication} from '../../application/userApplication';
import {Todo} from '../../domain/model/todo';
import {TodoText} from '../../domain/model/todoText';
import {TodoId} from '../../domain/model/todoId';
import {UserApiGwV2Presentation} from './userApiGwV2Presentation';
import {APIGatewayProxyEventV2} from 'aws-lambda';

describe('UserApiGwV2Presentation', () => {
  test('create', async () => {
    const id = 'a01af38a-b4c4-4b12-93ef-c6a546f98695';
    const text = 'test text';

    const userApplication = createMock<UserApplication>({
      create: async () => {
        return new Todo({
          id: new TodoId(id),
          text: new TodoText(text),
          checked: false,
        });
      },
    });
    const userApiGwV2Presentation = new UserApiGwV2Presentation({
      userApplication,
    });
    const event = createMock<APIGatewayProxyEventV2>({
      body: JSON.stringify({text}),
    });

    const response = await userApiGwV2Presentation.create(event);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(id);
    expect(body.text).toBe(text);
    expect(body.checked).toBe(false);
  });

  test('find', async () => {
    const id = 'a01af38a-b4c4-4b12-93ef-c6a546f98695';
    const text = 'test text';

    const userApplication = createMock<UserApplication>({
      find: async () => {
        return new Todo({
          id: new TodoId(id),
          text: new TodoText(text),
          checked: false,
        });
      },
    });
    const userApiGwV2Presentation = new UserApiGwV2Presentation({
      userApplication,
    });
    const event = createMock<APIGatewayProxyEventV2>({
      pathParameters: {
        todoId: id,
      },
    });

    const response = await userApiGwV2Presentation.find(event);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(id);
    expect(body.text).toBe(text);
    expect(body.checked).toBe(false);
  });

  test.each`
    beforeText       | beforeChecked | inputText       | inputChecked | afterText        | afterChecked
    ${'before text'} | ${false}      | ${'after text'} | ${undefined} | ${'after text'}  | ${false}
    ${'before text'} | ${false}      | ${undefined}    | ${true}      | ${'before text'} | ${false}
    ${'before text'} | ${false}      | ${'after text'} | ${true}      | ${'before text'} | ${false}
  `(
    'update',
    async (input: {
      beforeText: string;
      beforeChecked: boolean;
      inputText?: string;
      inputChecked?: boolean;
      afterText: string;
      afterChecked: boolean;
    }) => {
      const id = 'a01af38a-b4c4-4b12-93ef-c6a546f98695';

      const userApplication = createMock<UserApplication>({
        update: async () => {
          return new Todo({
            id: new TodoId(id),
            text: new TodoText(input.afterText),
            checked: input.afterChecked,
          });
        },
      });
      const userApiGwV2Presentation = new UserApiGwV2Presentation({
        userApplication,
      });
      const event = createMock<APIGatewayProxyEventV2>({
        pathParameters: {
          todoId: id,
        },
        body: JSON.stringify({
          text: input.inputText,
          checked: input.inputChecked,
        }),
      });

      const response = await userApiGwV2Presentation.update(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(id);
      expect(body.text).toBe(input.afterText);
      expect(body.checked).toBe(input.afterChecked);
    }
  );

  test('remove', async () => {
    const id = 'a01af38a-b4c4-4b12-93ef-c6a546f98695';
    const text = 'test text';

    const userApplication = createMock<UserApplication>({
      find: async () => {
        return new Todo({
          id: new TodoId(id),
          text: new TodoText(text),
          checked: false,
        });
      },
    });
    const userApiGwV2Presentation = new UserApiGwV2Presentation({
      userApplication,
    });
    const event = createMock<APIGatewayProxyEventV2>({
      pathParameters: {
        todoId: id,
      },
    });

    const response = await userApiGwV2Presentation.remove(event);

    expect(response.statusCode).toBe(204);
  });
});

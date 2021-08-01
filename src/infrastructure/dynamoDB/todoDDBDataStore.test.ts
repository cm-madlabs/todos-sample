import {createMock} from 'ts-auto-mock';
import {TodoDDBDataStore} from './todoDDBDataStore';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DateUtil} from '../../util/dateUtil';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {Todo} from '../../domain/model/todo';
import {TodoId} from '../../domain/model/todoId';
import {TodoText} from '../../domain/model/todoText';
import {mockClient} from 'aws-sdk-client-mock';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe('todoDataStore', () => {
  test('Todoを作成できる', async () => {
    const tableName = 'DUMMY';
    const dynamoDB = new DynamoDBClient({});
    const now = new Date('1970-01-01T00:00:00.000Z').getTime();
    const dateUtil = createMock<DateUtil>({
      getUnixTimeMillis: () => now,
    });

    const id = '4bfa20ef-2843-487f-a367-0f71b50f5066';
    const text = 'test text';

    ddbMock.on(PutCommand).resolves({});

    const todoDataStore = new TodoDDBDataStore({
      dynamoDB,
      tableName,
      dateUtil,
    });

    const todo = new Todo({
      id: new TodoId(id),
      text: new TodoText(text),
    });

    await todoDataStore.create(todo);

    expect(ddbMock.call(0).args[0].input).toStrictEqual({
      TableName: tableName,
      Item: {
        id,
        text,
        checked: false,
        createdAt: now,
        updatedAt: now,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    });
  });

  test('Todoを取得できる', async () => {
    const tableName = 'DUMMY';
    const dynamoDB = new DynamoDBClient({});
    const dateUtil = createMock<DateUtil>();

    const id = '4bfa20ef-2843-487f-a367-0f71b50f5066';
    const text = 'test text';
    const checked = true;
    const createdAt = new Date('1970-01-01T00:00:00.000Z').getTime();
    const updatedAt = new Date('1971-01-01T00:00:00.000Z').getTime();

    ddbMock.on(GetCommand, {TableName: tableName, Key: {id}}).resolves({
      Item: {
        id,
        text,
        checked,
        createdAt,
        updatedAt,
      },
    });

    const todoDataStore = new TodoDDBDataStore({
      dynamoDB,
      tableName,
      dateUtil,
    });

    const todo = await todoDataStore.read(new TodoId(id));

    expect(ddbMock.call(0).args[0].input).toStrictEqual({
      TableName: tableName,
      Key: {id},
    });
    expect(todo.getId().value).toBe(id);
    expect(todo.getText().value).toBe(text);
    expect(todo.getChecked()).toBe(checked);
  });

  test('Todoを更新できる', async () => {
    const tableName = 'DUMMY';
    const dynamoDB = new DynamoDBClient({});
    const now = new Date('1970-01-01T00:00:00.000Z').getTime();
    const dateUtil = createMock<DateUtil>({
      getUnixTimeMillis: () => now,
    });

    const id = '4bfa20ef-2843-487f-a367-0f71b50f5066';
    const text = 'test text';
    const checked = true;

    ddbMock.on(UpdateCommand).resolves({});

    const todoDataStore = new TodoDDBDataStore({
      dynamoDB,
      tableName,
      dateUtil,
    });

    const todo = new Todo({
      id: new TodoId(id),
      text: new TodoText(text),
      checked,
    });

    await todoDataStore.update(todo);

    expect(ddbMock.call(0).args[0].input).toStrictEqual({
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression:
        'set text = :text, checked = :checked, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':checked': checked,
        ':text': text,
        ':updatedAt': now,
      },
      ConditionExpression: 'attribute_exists(id)',
    });
  });

  test('Todoを削除できる', async () => {
    const tableName = 'DUMMY';
    const dynamoDB = new DynamoDBClient({});
    const now = new Date('1970-01-01T00:00:00.000Z').getTime();
    const dateUtil = createMock<DateUtil>({
      getUnixTimeMillis: () => now,
    });

    const id = '4bfa20ef-2843-487f-a367-0f71b50f5066';

    ddbMock.on(DeleteCommand).resolves({});

    const todoDataStore = new TodoDDBDataStore({
      dynamoDB,
      tableName,
      dateUtil,
    });

    await todoDataStore.delete(new TodoId(id));

    expect(ddbMock.call(0).args[0].input).toStrictEqual({
      TableName: tableName,
      Key: {
        id,
      },
    });
  });
});

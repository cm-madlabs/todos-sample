import {execSync} from 'child_process';
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {DateUtil} from '../../../src/util/dateUtil';
import {TodoDDBDataStore} from '../../../src/infrastructure/dynamoDB/todoDDBDataStore';
import {UserApplication} from '../../../src/application/userApplication';
import {UserApiGwV2Presentation} from '../../../src/presentation/apiGwV2/userApiGwV2Presentation';
import {createMock} from 'ts-auto-mock';
import {APIGatewayProxyEventV2} from 'aws-lambda';

const tableName = 'intg-test-table';

let dynamoDB: DynamoDBClient;

beforeAll(async () => {
  execSync('docker compose up -d');
  execSync(
    'docker compose run wait todos-dynamodb-local:8000 -- echo "Database is up"'
  );
  dynamoDB = new DynamoDBClient({
    credentials: {
      accessKeyId: 'DUMMY',
      secretAccessKey: 'DUMMY',
    },
    endpoint: 'http://localhost:8000',
  });
  process.env.TABLE_NAME = tableName;
  await dynamoDB.send(
    new CreateTableCommand({
      TableName: tableName,
      KeySchema: [{KeyType: 'HASH', AttributeName: 'id'}],
      AttributeDefinitions: [{AttributeType: 'S', AttributeName: 'id'}],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    })
  );
});

afterAll(async () => {
  await dynamoDB.send(
    new DeleteTableCommand({
      TableName: tableName,
    })
  );
  execSync('docker compose down');
});

describe('Integration TODO CRUD', () => {
  test('Todoに対してCRUD操作を行う', async () => {
    const dynamoDB = new DynamoDBClient({
      credentials: {
        accessKeyId: 'DUMMY',
        secretAccessKey: 'DUMMY',
      },
      endpoint: 'http://localhost:8000',
    });
    const dateUtil = new DateUtil();
    const todoRepository = new TodoDDBDataStore({
      dynamoDB,
      tableName,
      dateUtil,
    });
    const userApplication = new UserApplication({todoRepository});
    const userApiGwV2Presentation = new UserApiGwV2Presentation({
      userApplication,
    });

    /**
     * Create
     */
    const createEvent = createMock<APIGatewayProxyEventV2>({
      body: JSON.stringify({text: 'test text'}),
    });
    const createResp = await userApiGwV2Presentation.create(createEvent);
    expect(createResp.statusCode).toBe(200);
    const createRespBody = JSON.parse(createResp.body);
    const todoId = createRespBody.id;
    expect(todoId).toHaveLength(36);
    expect(createRespBody.text).toBe('test text');
    expect(createRespBody.checked).toBe(false);

    /**
     * Read
     */
    const findEvent = createMock<APIGatewayProxyEventV2>({
      pathParameters: {todoId},
    });
    const findResp = await userApiGwV2Presentation.find(findEvent);
    expect(findResp.statusCode).toBe(200);
    const findRespBody = JSON.parse(findResp.body);
    expect(findRespBody.text).toBe('test text');
    expect(findRespBody.checked).toBe(false);

    /**
     * Update
     */
    const updateEvent = createMock<APIGatewayProxyEventV2>({
      pathParameters: {todoId},
      body: JSON.stringify({text: 'after text'}),
    });
    const updateResp = await userApiGwV2Presentation.update(updateEvent);
    expect(updateResp.statusCode).toBe(200);
    const updateRespBody = JSON.parse(updateResp.body);
    expect(updateRespBody.text).toBe('after text');
    expect(updateRespBody.checked).toBe(false);

    /**
     * Remove
     */
    const removeEvent = createMock<APIGatewayProxyEventV2>({
      pathParameters: {todoId},
    });
    await userApiGwV2Presentation.remove(removeEvent);
  });
});

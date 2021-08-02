import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DateUtil} from '../../util/dateUtil';
import {TodoDDBDataStore} from '../../infrastructure/dynamoDB/todoDDBDataStore';
import {UserApplication} from '../../application/userApplication';
import {UserApiGwV2Presentation} from './userApiGwV2Presentation';

export const getContainer = () => {
  const dynamoDB = new DynamoDBClient({});
  const tableName = process.env.TABLE_NAME!;
  const dateUtil = new DateUtil();
  const todoRepository = new TodoDDBDataStore({dynamoDB, tableName, dateUtil});
  const userApplication = new UserApplication({todoRepository});
  const userApiGwV2Presentation = new UserApiGwV2Presentation({
    userApplication,
  });

  return {
    userApiGwV2Presentation,
  };
};

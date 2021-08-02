import {ITodoRepository} from '../../domain/repository/todoRepository';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import {DateUtil} from '../../util/dateUtil';
import {TodoNotFoundError, TodoRepositoryError} from '../../util/error/error';
import {Todo} from '../../domain/model/todo';
import {TodoId} from '../../domain/model/todoId';
import {TodoText} from '../../domain/model/todoText';

export class TodoDDBDataStore implements ITodoRepository {
  private readonly dynamoDB: DynamoDBClient;
  private readonly ddbDoc: DynamoDBDocumentClient;
  private readonly tableName: string;
  private readonly dateUtil: DateUtil;

  constructor(props: {
    dynamoDB: DynamoDBClient;
    tableName: string;
    dateUtil: DateUtil;
  }) {
    this.dynamoDB = props.dynamoDB;
    this.ddbDoc = DynamoDBDocumentClient.from(props.dynamoDB);
    this.tableName = props.tableName;
    this.dateUtil = props.dateUtil;
  }

  create: ITodoRepository['create'] = async todo => {
    const now = this.dateUtil.getUnixTimeMillis();
    await this.ddbDoc.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          id: todo.getId().value,
          text: todo.getText().value,
          checked: todo.getChecked(),
          createdAt: now,
          updatedAt: now,
        },
        ConditionExpression: 'attribute_not_exists(id)',
      })
    );
  };

  read: ITodoRepository['read'] = async todoId => {
    const {Item} = await this.ddbDoc.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {id: todoId.value},
      })
    );

    if (Item === undefined) {
      throw new TodoNotFoundError();
    }

    if (typeof Item.id !== 'string') {
      throw new TodoRepositoryError(
        `todo.id is invalid type, want: string, got: ${typeof Item.id}`
      );
    }
    if (typeof Item.text !== 'string') {
      throw new TodoRepositoryError(
        `todo.text is invalid type, want: string, got: ${typeof Item.text}`
      );
    }
    if (typeof Item.checked !== 'boolean') {
      throw new TodoRepositoryError(
        `todo.checked is invalid type, want: boolean, got: ${typeof Item.checked}`
      );
    }

    return new Todo({
      id: new TodoId(Item.id),
      text: new TodoText(Item.text),
      checked: Item.checked,
    });
  };

  update: ITodoRepository['update'] = async todo => {
    const now = this.dateUtil.getUnixTimeMillis();
    await this.ddbDoc.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {id: todo.getId().value},
        ExpressionAttributeNames: {
          '#text': 'text',
          '#checked': 'checked',
          '#updatedAt': 'updatedAt',
        },
        UpdateExpression:
          'set #text = :text, #checked = :checked, #updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':text': todo.getText().value,
          ':checked': todo.getChecked(),
          ':updatedAt': now,
        },
        ConditionExpression: 'attribute_exists(id)',
      })
    );
  };

  delete: ITodoRepository['delete'] = async todoId => {
    await this.ddbDoc.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {id: todoId.value},
      })
    );
  };
}

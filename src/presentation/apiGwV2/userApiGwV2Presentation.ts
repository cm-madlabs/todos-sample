import {APIGatewayProxyEventV2, APIGatewayProxyHandlerV2} from 'aws-lambda';
import {UserApplication} from '../../application/userApplication';
import {getContainer} from './injection';

export class UserApiGwV2Presentation {
  private readonly userApplication: UserApplication;

  constructor(props: {userApplication: UserApplication}) {
    this.userApplication = props.userApplication;
  }

  create = async (event: APIGatewayProxyEventV2) => {
    if (event.body === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'invalid request body',
        }),
      };
    }

    const request = JSON.parse(event.body);

    const todo = await this.userApplication.create({text: request.text});

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: todo.getId().value,
        text: todo.getText().value,
        checked: todo.getChecked(),
      }),
    };
  };

  find = async (event: APIGatewayProxyEventV2) => {
    if (typeof event.pathParameters?.todoId !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'invalid path parameters',
        }),
      };
    }

    const request = event.pathParameters?.todoId;

    const todo = await this.userApplication.find({id: request});

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: todo.getId().value,
        text: todo.getText().value,
        checked: todo.getChecked(),
      }),
    };
  };

  update = async (event: APIGatewayProxyEventV2) => {
    if (typeof event.pathParameters?.todoId !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'invalid path parameters',
        }),
      };
    }

    const requestId = event.pathParameters?.todoId;

    if (event.body === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'invalid request body',
        }),
      };
    }

    const request = JSON.parse(event.body);

    const todo = await this.userApplication.update({
      id: requestId,
      text: request.text,
      checked: request.checked,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: todo.getId().value,
        text: todo.getText().value,
        checked: todo.getChecked(),
      }),
    };
  };

  remove = async (event: APIGatewayProxyEventV2) => {
    if (typeof event.pathParameters?.todoId !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'invalid path parameters',
        }),
      };
    }

    const request = event.pathParameters?.todoId;

    await this.userApplication.delete({id: request});

    return {
      statusCode: 204,
    };
  };
}

const {userApiGwV2Presentation} = getContainer();

export const create: APIGatewayProxyHandlerV2 = async event => {
  return await userApiGwV2Presentation.create(event);
};

export const find: APIGatewayProxyHandlerV2 = async event => {
  return await userApiGwV2Presentation.find(event);
};

export const update: APIGatewayProxyHandlerV2 = async event => {
  return await userApiGwV2Presentation.update(event);
};

export const remove: APIGatewayProxyHandlerV2 = async event => {
  return await userApiGwV2Presentation.remove(event);
};

import {CfnOutput, Construct, Stack, StackProps} from '@aws-cdk/core';
import {ITable} from '@aws-cdk/aws-dynamodb';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {HttpApi, HttpMethod} from '@aws-cdk/aws-apigatewayv2';
import {LambdaProxyIntegration} from '@aws-cdk/aws-apigatewayv2-integrations';
import {
  find,
  remove,
} from '../src/presentation/apiGwV2/userApiGwV2Presentation';

export interface ComputeStackProps extends StackProps {
  readonly table: ITable;
}

export class ComputeStack extends Stack {
  public readonly api: HttpApi;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const createHandler = new NodejsFunction(this, 'CreateHandler', {
      entry: './src/presentation/apiGwV2/userApiGwV2Presentation.ts',
      handler: 'create',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    const findHandler = new NodejsFunction(this, 'FindHandler', {
      entry: './src/presentation/apiGwV2/userApiGwV2Presentation.ts',
      handler: 'find',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    const updateHandler = new NodejsFunction(this, 'UpdateHandler', {
      entry: './src/presentation/apiGwV2/userApiGwV2Presentation.ts',
      handler: 'update',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    const removeHandler = new NodejsFunction(this, 'RemoveHandler', {
      entry: './src/presentation/apiGwV2/userApiGwV2Presentation.ts',
      handler: 'remove',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    this.api = new HttpApi(this, 'Api');
    this.api.addRoutes({
      path: '/todos',
      methods: [HttpMethod.POST],
      integration: new LambdaProxyIntegration({handler: createHandler}),
    });
    this.api.addRoutes({
      path: '/todos/{todoId}',
      methods: [HttpMethod.GET],
      integration: new LambdaProxyIntegration({handler: findHandler}),
    });
    this.api.addRoutes({
      path: '/todos/{todoId}',
      methods: [HttpMethod.PATCH],
      integration: new LambdaProxyIntegration({handler: updateHandler}),
    });
    this.api.addRoutes({
      path: '/todos/{todoId}',
      methods: [HttpMethod.DELETE],
      integration: new LambdaProxyIntegration({handler: removeHandler}),
    });

    new CfnOutput(this, 'ApiUrl', {value: this.api.url!});
  }
}

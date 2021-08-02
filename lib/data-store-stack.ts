import {Construct, Stack, StackProps} from '@aws-cdk/core';
import {AttributeType, Table} from '@aws-cdk/aws-dynamodb';

export class DataStoreStack extends Stack {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.table = new Table(this, 'Table', {
      partitionKey: {name: 'id', type: AttributeType.STRING},
      readCapacity: 1,
      writeCapacity: 1,
    });
  }
}

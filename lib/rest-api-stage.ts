import {Construct, Stage, StageProps} from '@aws-cdk/core';
import {DataStoreStack} from './data-store-stack';
import {ComputeStack} from './compute-stack';

export class RestApiStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const dataStoreStack = new DataStoreStack(this, 'DataStore');
    new ComputeStack(this, 'Compute', {table: dataStoreStack.table});
  }
}

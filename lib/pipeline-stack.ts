import {Construct, Stack, StackProps} from '@aws-cdk/core';
import {CodePipeline, CodePipelineSource, ShellStep} from '@aws-cdk/pipelines';
import {RestApiStage} from './rest-api-stage';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(
          'cm-madlabs/todos-sample',
          'main',
          {
            connectionArn: process.env.REPO_CONNECTION_ARN!,
          }
        ),
        commands: ['npm ci', 'npm test', 'npm run synth'],
      }),
    });

    pipeline.addStage(new RestApiStage(this, 'Dev'));
  }
}

import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Todos from '../lib/todos-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Todos.TodosStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

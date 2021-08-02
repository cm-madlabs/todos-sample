#!/usr/bin/env node
import 'source-map-support/register';
import {App} from '@aws-cdk/core';
import {DataStoreStack} from '../lib/data-store-stack';
import {ComputeStack} from '../lib/compute-stack';

const app = new App();

const {table} = new DataStoreStack(app, 'DataStore');
new ComputeStack(app, 'Compute', {table});

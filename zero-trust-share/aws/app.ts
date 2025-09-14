#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ZeroTrustShareStack } from './infrastructure';

const app = new cdk.App();

new ZeroTrustShareStack(app, 'ZeroTrustShareStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Zero Trust File Sharing Platform - Complete AWS Infrastructure',
});

app.synth();

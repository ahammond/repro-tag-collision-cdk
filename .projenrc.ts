import { clickupCdk } from '@time-loop/clickup-projen';
import { repoName } from './src/helpers';

const name = repoName.kebab;
const project = new clickupCdk.ClickUpCdkTypeScriptApp({
  name,
  cdkVersion: '2.84.0',
  defaultReleaseBranch: 'main',
  projenrcTs: true,

  deps: ['@time-loop/cdk-aurora'],
});
project.synth();

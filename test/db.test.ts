import { aurora, core } from '@time-loop/cdk-library';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Namer } from 'multi-convention-namer';
import { DbStage } from '../src/stage';

// Minimum props required by @time-loop/cdk-library/core.StackProps
const commonProps = {
  businessUnit: core.BusinessUnit.PRODUCT,
  clickUpEnvironment: core.ClickUpEnvironment.PRODUCTION,
  clickUpRole: core.ClickUpRole.APP,
  confidentiality: core.Confidentiality.PUBLIC,
};

let app: App;
let stack: aurora.DbStack;
let template: Template;

function createStack(props?: aurora.DbStackProps) {
  const stage = new DbStage(app, new Namer(['foo']), { ...commonProps, ...props });
  stack = stage.stack;
  template = Template.fromStack(stack);
}

beforeEach(() => {
  app = new App();
});

describe('DbStack', () => {
  describe('regions', () => {
    test('usQa legacy', () => {
      createStack({ ...commonProps, namedEnv: core.Environment.usQa('us-west-2') });
      ['AWS::KMS::Key', 'AWS::RDS::DBCluster', 'AWS::RDS::DBInstance', 'AWS::RDS::DBProxy'].forEach((r) =>
        template.resourceCountIs(r, 1),
      );

      template.resourceCountIs('AWS::SecretsManager::Secret', 3);
      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: '/InfratestAurora/usqa-or1/InfratestAurora/Key/keyArn',
      });
      template.resourceCountIs('Custom::AWS', 2); // us-east-1 and us-east-2
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestManager' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestWriter' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestReader' });
    });

    test('qa-us-west-2-6', () => {
      createStack({
        ...commonProps,
        namedEnv: core.Environment.usQa(core.Environment.usQa.getShard({ name: 'qa-us-west-2-6' })),
      });
      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: '/InfratestAurora/usqa-qa-us-west-2-6/InfratestAurora/Key/keyArn',
      });
      template.resourceCountIs('Custom::AWS', 0); // Not a legacy shard
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'QaUsWest26InfratestWriter' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'QaUsWest26InfratestReader' });
    });

    test('globalStaging legacy', () => {
      createStack({
        ...commonProps,
        namedEnv: core.Environment.globalStaging('us-west-2'),
      });
      ['AWS::KMS::Key', 'AWS::RDS::DBCluster', 'AWS::RDS::DBProxy'].forEach((r) => template.resourceCountIs(r, 1));
      template.resourceCountIs('AWS::RDS::DBInstance', 2);
      template.resourceCountIs('AWS::SecretsManager::Secret', 3);
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestStgManager' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestStgWriter' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestStgReader' });

      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: '/InfratestAurora/staging-or1/InfratestAuroraStg/Key/keyArn',
      });
      template.resourceCountIs('Custom::AWS', 4); // us-east-1, eu-central-1, us-east-2, eu-west-1
    });

    test('staging-us-east-2-1', () => {
      createStack({
        ...commonProps,
        namedEnv: core.Environment.globalStaging(
          core.Environment.globalStaging.getShard({ name: 'staging-us-east-2-1' }),
        ),
      });
      ['AWS::KMS::Key', 'AWS::RDS::DBCluster', 'AWS::RDS::DBProxy'].forEach((r) => template.resourceCountIs(r, 1));
      template.resourceCountIs('AWS::RDS::DBInstance', 2);
      template.resourceCountIs('AWS::SecretsManager::Secret', 3);
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'StagingUsEast21InfratestStgManager' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'StagingUsEast21InfratestStgWriter' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'StagingUsEast21InfratestStgReader' });

      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: '/InfratestAurora/staging-staging-us-east-2-1/InfratestAuroraStg/Key/keyArn',
      });
      template.resourceCountIs('Custom::AWS', 0); // modern shard
    });

    test('globalProd legacy', () => {
      createStack({
        ...commonProps,
        namedEnv: core.Environment.globalProd('us-west-2'),
      });
      ['AWS::KMS::Key', 'AWS::RDS::DBCluster', 'AWS::RDS::DBProxy'].forEach((r) => template.resourceCountIs(r, 1));
      template.resourceCountIs('AWS::RDS::DBInstance', 2);
      template.resourceCountIs('AWS::SecretsManager::Secret', 3);
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestManager' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestWriter' });
      template.hasResourceProperties('AWS::SecretsManager::Secret', { Name: 'Or1InfratestReader' });

      template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: '/InfratestAurora/prod-or1/InfratestAurora/Key/keyArn',
      });
      // us-east-1, eu-central-1, ap-south-1, ap-northeast-2, ap-southeast-2, eu-west-1, sa-east-1
      template.resourceCountIs('Custom::AWS', 7);
    });

    test.todo('new prod shards, maybe leveraging each?');
  });
});

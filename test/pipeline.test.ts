import { App, assertions } from 'aws-cdk-lib';
import { PipelineStack } from '../src/pipeline';

describe('Pipeline', () => {
  describe('default', () => {
    const app = new App();
    const stack = new PipelineStack(app);
    const template = assertions.Template.fromStack(stack);

    // Tests are super thin, consisting of just an assertion.
    test('creates a pipline', () => {
      template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
    });
    test('with a Synth step', () => {
      template.hasResourceProperties('AWS::CodeBuild::Project', {
        Source: { Type: 'CODEPIPELINE' },
        Description: assertions.Match.stringLikeRegexp('SynthStep'),
      });
    });
    test('with a SelfMutate step', () => {
      template.hasResourceProperties('AWS::CodeBuild::Project', {
        Source: { Type: 'CODEPIPELINE' },
        Description: assertions.Match.stringLikeRegexp('SelfMutate'),
      });
    });
  });
});

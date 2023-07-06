import { App, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { AnyPrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { name } from './helpers';

const app = new App();

class Repro extends Stack {
  constructor(scope: Construct, props?: StackProps) {
    super(scope, name.pascal, props);
    const role = new Role(this, 'Role', { assumedBy: new AnyPrincipal() });

    Tags.of(role).add('Foo', 'bar');
    // 1 - Deploy once with the following `foo` (note lower case) tag commented out.
    // 2 - Deploy 2nd time with the following line uncommented. Should have errored at CDK level.
    // Cfn should have errored (on some resources it gives a "Please note that Tag keys are case insensitive.")
    // INSTEAD what it does is change the `Foo` tag's name to `foo`.
    //Tags.of(role).add('foo', 'bar');
    // 3- Comment out and deploy a 3rd time. Note that your role now doesn't have either the `foo` or the `Foo` tag.
    // Cfn has happily cleaned up your mess and broken you.
    // As a bonus, you have also achieved an inconsistent stack state.
  }
}

new Repro(app);

app.synth();

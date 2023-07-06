import { aurora, core } from '@time-loop/cdk-library';
import { Construct } from 'constructs';
import { Namer } from 'multi-convention-namer';
import { name } from './helpers';

export interface DbStageProps extends core.StageProps {}

export class DbStage extends core.Stage {
  readonly stack: aurora.DbStack;

  constructor(scope: Construct, id: Namer, props: DbStageProps) {
    super(scope, id, props);

    this.stack = new aurora.DbStack(this, name, {
      ...props,
      skipProxy: true,
      // skipUserProvisioning: true,
      // skipProvisionDatabase: true,
    });
  }
}

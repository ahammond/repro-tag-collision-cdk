import { Namer } from 'multi-convention-namer';

export const name = new Namer(['repro', 'tag', 'collision']);
export const repoName = name.addSuffix(['cdk']);

import execa from 'execa';
import path from 'path';

import {handle as compileServer} from '@cli/api/server/compile';

export async function handle() {
    const {ROOT_DIR, argv} = cliRuntime();
    const {pattern} = argv;

    const jestParams = ['--config=jest.config.json', '--forceExit'];

    if (pattern) {
        jestParams.push(pattern);
    }

    await compileServer();

    console.log('restore db running...');

    await execa('node', [path.resolve(ROOT_DIR, './out/server/tests/test-restore-db')], {
        stdout: 'inherit',
        stderr: 'inherit',
        cwd: ROOT_DIR,
        env: {
            ENVIRONMENT: 'tests'
        }
    });

    console.log('migration db running...');

    await execa(
        'node_modules/.bin/ts-node',
        [path.resolve(ROOT_DIR, './node_modules/typeorm/cli.js'), '-c', 'tests', 'migration:run'],
        {
            stdout: 'inherit',
            stderr: 'inherit',
            cwd: ROOT_DIR
        }
    );

    console.log('tests running...');

    await execa('node_modules/.bin/jest', jestParams, {
        stdout: 'inherit',
        stderr: 'inherit',
        cwd: ROOT_DIR,
        env: {
            ENVIRONMENT: 'tests',
            DISABLE_LOGGING: '1'
        }
    });
}

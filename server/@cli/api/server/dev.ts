import path from 'path';
import execa from 'execa';

export async function handle() {
    const {ROOT_DIR} = cliRuntime();

    await execa(
        'node_modules/.bin/nodemon',
        [
            '--exec',
            [
                'node_modules/.bin/ts-node',
                '--files=true',
                '--compiler=ttypescript',
                `--project ${path.resolve(ROOT_DIR, './server/tsconfig.json')}`,
                path.resolve(ROOT_DIR, './server/app/app.ts')
            ].join(' '),
            '-w',
            path.resolve(ROOT_DIR, './server'),
            '-e',
            'ts,json'
        ],
        {stdout: 'inherit', stderr: 'inherit', cwd: ROOT_DIR}
    );
}

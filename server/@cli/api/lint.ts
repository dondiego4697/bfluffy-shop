import path from 'path';
import execa from 'execa';

export async function handle() {
    const {ROOT_DIR, argv} = cliRuntime();
    const {fix} = argv;

    const params = [path.resolve(ROOT_DIR, 'server'), '--ext', 'ts'];

    if (fix) {
        params.push('--fix');
    }

    await execa('node_modules/.bin/eslint', params, {stdout: 'inherit', stderr: 'inherit', cwd: ROOT_DIR});
}

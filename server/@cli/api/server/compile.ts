import path from 'path';
import execa from 'execa';

export async function handle() {
    const {ROOT_DIR} = cliRuntime();

    await execa('rm', ['-rf', path.resolve(ROOT_DIR, './out')]);
    await execa('node_modules/.bin/ttsc', ['-p', path.resolve(ROOT_DIR, './server/tsconfig.json')], {
        stdout: 'inherit',
        stderr: 'inherit',
        cwd: ROOT_DIR
    });
}

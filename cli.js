#!/usr/bin/env node

const path = require('path');

const ROOT_DIR = __dirname;
const OUT_DIR = 'out';

const argv = require('minimist')(process.argv.slice(2));

const USE_COMPILED = !argv.c;
const COMMAND = argv._[0];

if (!USE_COMPILED) {
    require('ts-node').register({
        compiler: 'ttypescript',
        files: true,
        project: path.resolve(ROOT_DIR, './server/tsconfig.json')
    });
}

const include = (moduleRelativePath) => {
    const modulePath = path.resolve(ROOT_DIR, USE_COMPILED ? OUT_DIR : '', moduleRelativePath);
    return require(modulePath);
};

global.cliRuntime = () => ({
    include,
    ROOT_DIR,
    OUT_DIR,
    COMMAND,
    USE_COMPILED,
    argv
});

(async () => {
    try {
        const {commands} = include('server/@cli/commands');
        const isCommandExist = COMMAND in commands;

        if (!isCommandExist) {
            throw new Error(`command '${COMMAND}' not found`);
        }

        const {handle} = include(commands[COMMAND]);
        await handle();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();

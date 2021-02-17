import {ParsedArgs} from 'minimist';

interface CliRuntime {
    include(path: string): ReturnType<typeof require>;

    ROOT_DIR: string;
    OUT_DIR: string;
    COMMAND: string;
    USE_COMPILED: boolean;
    argv: ParsedArgs;
}

declare global {
    function cliRuntime(): CliRuntime;
}

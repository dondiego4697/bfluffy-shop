export const commands = {
    lint: 'cli/api/lint',
    tests: 'cli/api/tests',

    'server:compile': 'cli/api/server/compile',
    'server:dev': 'cli/api/server/dev',

    'scheduler:update-search-index': 'cli/api/scheduler/update-search-index'
} as const;

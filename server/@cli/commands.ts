export const commands = {
    lint: 'server/@cli/api/lint',
    tests: 'server/@cli/api/tests',

    'server:compile': 'server/@cli/api/server/compile',
    'server:dev': 'server/@cli/api/server/dev',

    'scheduler:update-search-index': 'server/@cli/api/scheduler/update-search-index'
} as const;

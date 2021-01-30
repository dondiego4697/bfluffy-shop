/* eslint-disable @typescript-eslint/no-non-null-assertion */
import assert from 'assert';

interface DB {
    hosts: string[];
    port: number;
    username: string;
    password: string;
    database: string;
}

export interface Config {
    'logger.colorize': boolean;
    'logger.level': string;
    'cors.allowedOrigins': string[] | null;
    'header.requestId': string;
    db: DB;
}

const production: Config = {
    'logger.colorize': false,
    'logger.level': 'info',
    'cors.allowedOrigins': [],
    'header.requestId': 'x-request-id',
    db: {
        hosts: ['localhost'],
        port: 6432,
        username: 'postgres',
        password: 'password',
        database: 'petstore'
    }
};

const testing: Config = {
    ...production,
    db: {
        ...production.db
    }
};

const development: Config = {
    ...testing,
    'logger.colorize': true,
    'logger.level': 'silly',
    'cors.allowedOrigins': null,
    db: {
        ...testing.db,
        hosts: ['localhost'],
        port: 6432,
        username: 'postgres',
        password: 'password',
        database: 'petstore'
    }
};

const tests: Config = {
    ...development
};

const configs = new Map<string, Readonly<Config>>([
    ['production', production],
    ['testing', testing],
    ['development', development],
    ['tests', tests]
]);

const env = process.env.ENVIRONMENT || 'development';
const configForEnv = configs.get(env);

export const config = configForEnv!;

assert(config, `there is no configuration for environment "${env}"`);

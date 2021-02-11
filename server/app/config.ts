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
    'logger.db.level': boolean | 'all' | 'error'[];
    'csrf.enable': boolean;
    'csrf.token.ttl': number;
    'cors.allowedOrigins': string[] | null;
    'header.requestId': string;
    'app.cache.enable': boolean;
    'app.host': string;
    'tests.enable': boolean;
    db: DB;
}

const production: Config = {
    'tests.enable': false,
    'logger.colorize': false,
    'logger.db.level': 'all',
    'logger.level': 'info',
    'cors.allowedOrigins': [],
    'header.requestId': 'x-request-id',
    'csrf.enable': true,
    'csrf.token.ttl': 60 * 60 * 1000, // 1h
    'app.cache.enable': true,
    'app.host': 'https://some_host.ru',
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
    'csrf.enable': false,
    'app.cache.enable': false,
    db: {
        ...testing.db,
        hosts: ['localhost', 'localhost'],
        port: 6432,
        username: 'postgres',
        password: 'password',
        database: 'petstore'
    }
};

const tests: Config = {
    ...development,
    'logger.db.level': ['error'],
    'tests.enable': true,
    'csrf.enable': true,
    'app.cache.enable': false,
    db: {
        ...development.db,
        database: 'petstore_test'
    }
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

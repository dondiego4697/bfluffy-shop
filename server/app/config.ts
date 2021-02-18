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
    'sms-boom.enable': boolean;
    'sms-boom.host': string;
    'sms-boom.token': string;
    'sms-boom.sender': string;
    'telegram.host': string;
    'telegram.bot.enable': boolean;
    'telegram.bot.name': string;
    'telegram.bot.token': string;
    'localtunnel.enable': boolean;
    'search.enable': boolean;
    db: DB;
}

const production: Config = {
    'logger.colorize': false,
    'localtunnel.enable': false,
    'logger.db.level': 'all',
    'logger.level': 'info',
    'cors.allowedOrigins': [],
    'header.requestId': 'x-request-id',
    'csrf.enable': true,
    'csrf.token.ttl': 60 * 60 * 1000, // 1h
    'app.cache.enable': true,
    'app.host': 'https://some_host.ru',
    'sms-boom.host': 'http://api.sms-boom.ru',
    'sms-boom.token': process.env.SMS_BOOM_TOKEN!,
    'sms-boom.sender': 'SOME_SENDER',
    'sms-boom.enable': true,
    'search.enable': true,
    'telegram.host': 'https://api.telegram.org',
    'telegram.bot.enable': true,
    'telegram.bot.name': 'TODO',
    'telegram.bot.token': process.env.TELEGRAM_BOT_TOKEN!,
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
    'localtunnel.enable': true,
    'logger.colorize': true,
    'logger.level': 'silly',
    'cors.allowedOrigins': null,
    'csrf.enable': false,
    'app.host': 'https://petstore.loca.lt',
    'app.cache.enable': false,
    'sms-boom.enable': false,
    'telegram.bot.name': 'PetStoreDevelopmentBot',
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
    'localtunnel.enable': false,
    'sms-boom.enable': true,
    'csrf.enable': true,
    'app.cache.enable': false,
    'search.enable': false,
    'telegram.bot.enable': false,
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

assert(config['sms-boom.host'], 'there is no algolia token');
assert(config['telegram.bot.token'], 'there is no algolia token');

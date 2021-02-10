"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const assert_1 = __importDefault(require("assert"));
const production = {
    'tests.enable': false,
    'logger.colorize': false,
    'logger.db.level': 'all',
    'logger.level': 'info',
    'cors.allowedOrigins': [],
    'header.requestId': 'x-request-id',
    'csrf.enable': true,
    'csrf.token.ttl': 60 * 60 * 1000,
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
const testing = Object.assign(Object.assign({}, production), { db: Object.assign({}, production.db) });
const development = Object.assign(Object.assign({}, testing), { 'logger.colorize': true, 'logger.level': 'silly', 'cors.allowedOrigins': null, 'csrf.enable': false, 'app.cache.enable': false, db: Object.assign(Object.assign({}, testing.db), { hosts: ['localhost'], port: 6432, username: 'postgres', password: 'password', database: 'petstore' }) });
const tests = Object.assign(Object.assign({}, development), { 'logger.db.level': ['error'], 'tests.enable': true, 'csrf.enable': true, 'app.cache.enable': false, db: Object.assign(Object.assign({}, development.db), { database: 'petstore_test' }) });
const configs = new Map([
    ['production', production],
    ['testing', testing],
    ['development', development],
    ['tests', tests]
]);
const env = process.env.ENVIRONMENT || 'development';
const configForEnv = configs.get(env);
exports.config = configForEnv;
assert_1.default(exports.config, `there is no configuration for environment "${env}"`);
//# sourceMappingURL=config.js.map
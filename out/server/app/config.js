"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const assert_1 = __importDefault(require("assert"));
const production = {
    'logger.colorize': false,
    'logger.level': 'info',
    'cors.allowedOrigins': [],
    'header.requestId': 'x-request-id'
};
const testing = Object.assign({}, production);
const development = Object.assign(Object.assign({}, testing), { 'logger.colorize': true, 'logger.level': 'silly', 'cors.allowedOrigins': null });
const tests = Object.assign({}, development);
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
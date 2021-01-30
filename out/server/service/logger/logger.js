"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const config_1 = require("../../app/config");
const { printf } = winston_1.format;
const loggerFormat = printf((data) => {
    return Object.entries(data)
        .map(([key, value]) => {
        if (typeof value === 'object') {
            return `${key}=${JSON.stringify(value)}`;
        }
        // TODO filter headers
        return `${key}=${value}`;
    })
        .join('\t');
});
exports.logger = winston_1.createLogger({
    silent: process.env.DISABLE_LOGGING === '1',
    level: config_1.config['logger.level'],
    format: winston_1.format.combine(config_1.config['logger.colorize'] ? winston_1.format.colorize() : winston_1.format.uncolorize(), winston_1.format.timestamp(), loggerFormat),
    transports: [new winston_1.transports.Console()]
});
//# sourceMappingURL=logger.js.map
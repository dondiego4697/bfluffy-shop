"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const config_1 = require("../../app/config");
const { printf } = winston_1.format;
const loggerFormat = printf((rawData) => {
    const { message, level, timestamp } = rawData, other = __rest(rawData, ["message", "level", "timestamp"]);
    const data = Object.assign({ level, timestamp }, other);
    if (typeof message === 'object') {
        Object.assign(data, message);
    }
    else {
        Object.assign(data, { message });
    }
    return Object.entries(data)
        .map(([k, v]) => {
        if (typeof v === 'object') {
            return `${k}=${JSON.stringify(v)}`;
        }
        // TODO filter headers
        return `${k}=${v}`;
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
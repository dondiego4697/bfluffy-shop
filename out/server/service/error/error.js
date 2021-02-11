"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientError = exports.LoggableError = void 0;
const logger_1 = require("../logger/logger");
class LoggableError extends Error {
    constructor(params) {
        const { message = '', group = 'unknown', meta = {}, request } = params;
        super(message);
        const log = Object.assign(Object.assign({}, meta), { group });
        if (request) {
            request.logger.error(message, log);
        }
        else {
            logger_1.logger.error(message, log);
        }
    }
}
exports.LoggableError = LoggableError;
class ClientError extends LoggableError {
    constructor(clientErrorCode, params) {
        super(params);
        this.clientErrorCode = clientErrorCode;
    }
}
exports.ClientError = ClientError;
//# sourceMappingURL=error.js.map
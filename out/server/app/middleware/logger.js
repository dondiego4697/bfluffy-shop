"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const async_middleware_1 = require("async-middleware");
const logger_1 = require("../../service/logger/logger");
exports.logger = async_middleware_1.wrap(async (req, _res, next) => {
    req.logger = logger_1.logger.child({
        hostname: req.hostname,
        originalUrl: req.originalUrl
    });
    next();
});
//# sourceMappingURL=logger.js.map
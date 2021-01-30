"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = void 0;
const async_middleware_1 = require("async-middleware");
const uuid_1 = require("uuid");
const config_1 = require("../config");
const REQUEST_ID = config_1.config['header.requestId'];
exports.requestId = async_middleware_1.wrap(async (req, res, next) => {
    const id = req.headers[REQUEST_ID];
    if (!id) {
        req.requestId = uuid_1.v4();
        res.setHeader(REQUEST_ID, req.requestId);
    }
    req.logger = req.logger.child({ requestId: req.requestId });
    next();
});
//# sourceMappingURL=request-id.js.map
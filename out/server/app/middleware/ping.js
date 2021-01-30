"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = void 0;
const async_middleware_1 = require("async-middleware");
exports.ping = async_middleware_1.wrap(async (_req, res) => {
    res.end();
});
//# sourceMappingURL=ping.js.map
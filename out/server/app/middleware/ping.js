"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ping = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../lib/db-manager");
exports.ping = async_middleware_1.wrap(async (_req, res) => {
    if (!db_manager_1.dbManager.isActive) {
        throw boom_1.default.serverUnavailable('db is not active');
    }
    res.end();
});
//# sourceMappingURL=ping.js.map
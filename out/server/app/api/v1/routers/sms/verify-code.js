"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCode = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const csrf_1 = require("../../../../lib/csrf");
const config_1 = require("../../../../config");
const entities_1 = require("../../../../../db-entity/entities");
exports.verifyCode = async_middleware_1.wrap(async (req, res) => {
    const { phone, code } = req.body;
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(entities_1.User);
    const user = await manager.findOne(entities_1.User, { phone: String(phone) });
    if (!user) {
        throw boom_1.default.notFound();
    }
    if (user.lastSmsCode === code) {
        res.cookie('csrf_token', csrf_1.CSRF.generateToken(), { maxAge: config_1.config['csrf.token.ttl'] });
        return res.json({});
    }
    throw boom_1.default.badRequest();
});
//# sourceMappingURL=verify-code.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCode = void 0;
const moment_1 = __importDefault(require("moment"));
const lodash_1 = require("lodash");
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const index_1 = require("../../../../../db-entity/index");
const sms_1 = require("../../../../../service/sms/sms");
const TIMEOUT_IN_SECONDS = 30;
exports.sendCode = async_middleware_1.wrap(async (req, res) => {
    const { phone } = req.body;
    const code = lodash_1.random(1000, 9999);
    const connection = db_manager_1.dbManager.getConnection();
    const user = await connection
        .getRepository(index_1.User)
        .createQueryBuilder(index_1.DbTable.USER)
        .where(`${index_1.DbTable.USER}.phone = :phone`, { phone })
        .getOne();
    if (!user) {
        await connection
            .createQueryBuilder()
            .insert()
            .into(index_1.User)
            .values([
            {
                phone: String(phone),
                lastSmsCode: code,
                lastSmsCodeAt: () => 'now()'
            }
        ])
            .returning('*')
            .execute();
        sms_1.smsProvider.sendSms(phone, `Ваш код: ${code}`);
        return res.json({ left: TIMEOUT_IN_SECONDS });
    }
    const diff = moment_1.default().diff(moment_1.default(user.lastSmsCodeAt), 'seconds');
    if (diff > TIMEOUT_IN_SECONDS) {
        await connection
            .createQueryBuilder()
            .update(index_1.User)
            .set({
            lastSmsCode: code,
            lastSmsCodeAt: () => 'now()'
        })
            .where('id = :id', { id: user.id })
            .execute();
        sms_1.smsProvider.sendSms(phone, `Ваш код: ${code}`);
        return res.json({ left: TIMEOUT_IN_SECONDS });
    }
    return res.json({ left: TIMEOUT_IN_SECONDS - diff });
});
//# sourceMappingURL=send-code.js.map
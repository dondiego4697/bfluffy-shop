"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const p_map_1 = __importDefault(require("p-map"));
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const order_1 = require("../../../../../db-entity/order");
const entities_1 = require("../../../../../db-entity/entities");
const tables_1 = require("../../../../../db-entity/tables");
const error_1 = require("../../../../../service/error/error");
exports.cancelOrder = async_middleware_1.wrap(async (req, res) => {
    const { public_id: publicId } = req.params;
    const order = await db_manager_1.dbManager
        .getConnection()
        .getRepository(entities_1.Order)
        .createQueryBuilder(tables_1.DbTable.ORDER)
        .leftJoinAndSelect(`${tables_1.DbTable.ORDER}.orderPositions`, tables_1.DbTable.ORDER_POSITION)
        .where(`${tables_1.DbTable.ORDER}.publicId = :id`, { id: publicId })
        .getOne();
    if (!order) {
        throw boom_1.default.notFound();
    }
    if (order.status === 'FINISHED') {
        throw new error_1.ClientError('ORDER_ALREADY_FINISHED', { meta: { order } });
    }
    await db_manager_1.dbManager.getConnection().transaction(async (manager) => {
        await manager
            .createQueryBuilder()
            .update(entities_1.Order)
            .set({ status: order_1.OrderStatus.FINISHED, resolution: order_1.OrderResolution.CANCELLED })
            .where('id = :id', { id: order.id })
            .execute();
        await p_map_1.default(order.orderPositions, async (position) => {
            const { quantity, data: { storage } } = position;
            return manager.query(`
                        UPDATE ${tables_1.DbTable.STORAGE}
                        SET quantity = quantity + ${quantity}
                        WHERE id = $1
                    `, [storage.id]);
        }, { concurrency: 1 });
    });
    res.json({ publicId });
});
//# sourceMappingURL=cancel-order.js.map
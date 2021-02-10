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
const index_1 = require("../../../../../db-entity/index");
const order_1 = require("../../../../../db-entity/order");
exports.cancelOrder = async_middleware_1.wrap(async (req, res) => {
    const { public_id: publicId } = req.params;
    const order = await db_manager_1.dbManager
        .getConnection()
        .getRepository(index_1.Order)
        .createQueryBuilder(index_1.DbTable.ORDER)
        .leftJoinAndSelect(`${index_1.DbTable.ORDER}.orderPositions`, index_1.DbTable.ORDER_POSITION)
        .where(`${index_1.DbTable.ORDER}.publicId = :id`, { id: publicId })
        .getOne();
    if (!order) {
        throw boom_1.default.notFound();
    }
    await db_manager_1.dbManager.getConnection().transaction(async (manager) => {
        await manager
            .createQueryBuilder()
            .update(index_1.Order)
            .set({ status: order_1.OrderStatus.FINISHED, resolution: order_1.OrderResolution.CANCELLED })
            .where('id = :id', { id: order.id })
            .execute();
        await p_map_1.default(order.orderPositions, async (position) => {
            const { storage } = position.data;
            return manager
                .createQueryBuilder()
                .update(index_1.Storage)
                .set({ quantity: storage.quantity + position.quantity })
                .where('id = :id', { id: storage.id })
                .execute();
        }, { concurrency: 1 });
    });
    res.json({ publicId });
});
//# sourceMappingURL=cancel-order.js.map
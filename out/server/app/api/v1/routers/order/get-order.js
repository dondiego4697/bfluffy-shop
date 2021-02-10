"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const index_1 = require("../../../../../db-entity/index");
exports.getOrder = async_middleware_1.wrap(async (req, res) => {
    const { public_id: publicId } = req.params;
    const order = await db_manager_1.dbManager
        .getConnection()
        .getRepository(index_1.Order)
        .createQueryBuilder(index_1.DbTable.ORDER)
        .leftJoinAndSelect(`${index_1.DbTable.ORDER}.orderPositions`, index_1.DbTable.ORDER_POSITION)
        .where(`${index_1.DbTable.ORDER}.public_id = :id`, { id: publicId })
        .getOne();
    if (!order) {
        throw boom_1.default.notFound();
    }
    const result = {
        order: {
            publicId: order.publicId,
            data: order.data,
            clientPhone: order.clientPhone,
            createdAt: order.createdAt,
            status: {
                status: order.status,
                resolution: order.resolution
            },
            delivery: {
                address: order.deliveryAddress,
                comment: order.deliveryComment,
                date: order.deliveryDate
            }
        },
        positions: order.orderPositions.map((position) => ({
            cost: position.cost,
            quantity: position.quantity,
            good: position.data.catalog.good,
            pet: position.data.catalog.pet,
            brand: position.data.catalog.brand,
            manufacturerCountry: position.data.catalog.manufacturerCountry,
            photoUrls: position.data.catalog.photoUrls,
            rating: position.data.catalog.rating,
            displayName: position.data.catalog.displayName,
            description: position.data.catalog.description
        }))
    };
    res.json(result);
});
//# sourceMappingURL=get-order.js.map
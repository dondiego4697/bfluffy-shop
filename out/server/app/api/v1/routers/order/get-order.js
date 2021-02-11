"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const entities_1 = require("../../../../../db-entity/entities");
const tables_1 = require("../../../../../db-entity/tables");
exports.getOrder = async_middleware_1.wrap(async (req, res) => {
    const { public_id: publicId } = req.params;
    const order = await db_manager_1.dbManager
        .getConnection()
        .getRepository(entities_1.Order)
        .createQueryBuilder(tables_1.DbTable.ORDER)
        .leftJoinAndSelect(`${tables_1.DbTable.ORDER}.orderPositions`, tables_1.DbTable.ORDER_POSITION)
        .where(`${tables_1.DbTable.ORDER}.public_id = :id`, { id: publicId })
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
        positions: order.orderPositions.map((position) => {
            const { data } = position;
            const { catalog, catalogItem } = data;
            return {
                cost: position.cost,
                quantity: position.quantity,
                good: catalog.good,
                pet: catalog.pet,
                brand: catalog.brand,
                manufacturerCountry: catalog.manufacturerCountry,
                rating: catalog.rating,
                displayName: catalog.displayName,
                description: catalog.description,
                photoUrls: catalogItem.photoUrls,
                weight: catalogItem.weight
            };
        })
    };
    res.json(result);
});
//# sourceMappingURL=get-order.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const url_1 = require("url");
const p_map_1 = __importDefault(require("p-map"));
const boom_1 = __importDefault(require("@hapi/boom"));
const lodash_1 = require("lodash");
const async_middleware_1 = require("async-middleware");
const config_1 = require("../../../../config");
const db_manager_1 = require("../../../../lib/db-manager");
const order_1 = require("../../../../../db-entity/order");
const sms_1 = require("../../../../../service/sms/sms");
const index_1 = require("../../../../../db-entity/index");
exports.createOrder = async_middleware_1.wrap(async (req, res) => {
    const { phone, delivery, goods } = req.body;
    const orderPublicId = await db_manager_1.dbManager.getConnection().transaction(async (manager) => {
        const order = await manager
            .createQueryBuilder()
            .insert()
            .into(index_1.Order)
            .values([
            {
                data: {},
                clientPhone: String(phone),
                deliveryAddress: delivery.address,
                deliveryComment: delivery.comment,
                deliveryDate: delivery.date,
                status: order_1.OrderStatus.CREATED
            }
        ])
            .returning('*')
            .execute();
        const orderId = order.identifiers[0].id;
        const goodPublicIds = goods.map(({ publicId }) => publicId);
        const catalogItemsRaw = await manager
            .getRepository(index_1.Storage)
            .createQueryBuilder(index_1.DbTable.STORAGE)
            .leftJoinAndSelect(`${index_1.DbTable.STORAGE}.catalog`, index_1.DbTable.CATALOG)
            .innerJoinAndSelect(`${index_1.DbTable.CATALOG}.brand`, index_1.DbTable.BRAND)
            .innerJoinAndSelect(`${index_1.DbTable.CATALOG}.petCategory`, index_1.DbTable.PET_CATEGORY)
            .innerJoinAndSelect(`${index_1.DbTable.CATALOG}.goodCategory`, index_1.DbTable.GOOD_CATEGORY)
            .where(`${index_1.DbTable.CATALOG}.publicId IN (:...ids)`, { ids: goodPublicIds })
            .getMany();
        const catalogItems = catalogItemsRaw.map((item) => ({
            storage: lodash_1.omit(item, 'catalog'),
            catalog: item.catalog,
            catalogPublicId: item.catalog.publicId
        }));
        if (catalogItems.length !== goods.length) {
            req.logger.error('unknown good ids exist', { goods, catalogItems });
            throw boom_1.default.badRequest();
        }
        const catalogItemsHash = lodash_1.keyBy(catalogItems, 'catalogPublicId');
        await p_map_1.default(goods, async (good) => {
            const item = catalogItemsHash[good.publicId];
            const { storage } = item;
            return manager
                .createQueryBuilder()
                .update(index_1.Storage)
                .set({ quantity: storage.quantity - good.quantity })
                .where('id = :id', { id: storage.id })
                .execute();
        }, { concurrency: 1 });
        await manager
            .createQueryBuilder()
            .insert()
            .into(index_1.OrderPosition)
            .values(goods.map((good) => {
            const item = catalogItemsHash[good.publicId];
            const { storage, catalog } = item;
            return {
                orderId,
                cost: good.cost,
                quantity: good.quantity,
                data: {
                    storage: {
                        id: storage.id,
                        cost: storage.cost,
                        quantity: storage.quantity
                    },
                    catalog: {
                        id: catalog.id,
                        publicId: catalog.publicId,
                        displayName: catalog.displayName,
                        description: catalog.description,
                        rating: catalog.rating,
                        manufacturerCountry: catalog.manufacturerCountry,
                        photoUrls: catalog.photoUrls || [],
                        brand: {
                            code: catalog.brand.code,
                            name: catalog.brand.displayName
                        },
                        pet: {
                            code: catalog.petCategory.code,
                            name: catalog.petCategory.displayName
                        },
                        good: {
                            code: catalog.goodCategory.code,
                            name: catalog.goodCategory.displayName
                        }
                    }
                }
            };
        }))
            .execute();
        return order.raw[0].public_id;
    });
    const url = new url_1.URL(`/order/${orderPublicId}`, config_1.config['app.host']);
    sms_1.smsProvider.sendSms(phone, `Ваш заказ успешно создан: ${url.toString()}`);
    res.json({ id: orderPublicId });
});
//# sourceMappingURL=create-order.js.map
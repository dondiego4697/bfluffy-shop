"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const url_1 = require("url");
const moment_1 = __importDefault(require("moment"));
const p_map_1 = __importDefault(require("p-map"));
const lodash_1 = require("lodash");
const async_middleware_1 = require("async-middleware");
const config_1 = require("../../../../config");
const db_manager_1 = require("../../../../lib/db-manager");
const order_1 = require("../../../../../db-entity/order");
const sms_1 = require("../../../../../service/sms/sms");
const entities_1 = require("../../../../../db-entity/entities");
const tables_1 = require("../../../../../db-entity/tables");
const error_1 = require("../../../../../service/error/error");
exports.createOrder = async_middleware_1.wrap(async (req, res) => {
    const { phone, delivery, goods } = req.body;
    const orderPublicId = await db_manager_1.dbManager.getConnection().transaction(async (manager) => {
        const { manager: orderManager } = manager.getRepository(entities_1.Order);
        const orderRaw = orderManager.create(entities_1.Order, {
            data: {},
            clientPhone: String(phone),
            deliveryAddress: delivery.address,
            deliveryComment: delivery.comment,
            deliveryDate: delivery.date,
            status: order_1.OrderStatus.CREATED
        });
        await orderManager.save(orderRaw);
        const order = await orderManager.findOneOrFail(entities_1.Order, orderRaw.id);
        const goodsPublicIds = goods.map(({ publicId }) => publicId);
        const storageItems = await manager
            .getRepository(entities_1.Storage)
            .createQueryBuilder(tables_1.DbTable.STORAGE)
            .leftJoinAndSelect(`${tables_1.DbTable.STORAGE}.catalogItem`, tables_1.DbTable.CATALOG_ITEM)
            .leftJoinAndSelect(`${tables_1.DbTable.CATALOG_ITEM}.catalog`, tables_1.DbTable.CATALOG)
            .innerJoinAndSelect(`${tables_1.DbTable.CATALOG}.brand`, tables_1.DbTable.BRAND)
            .innerJoinAndSelect(`${tables_1.DbTable.CATALOG}.petCategory`, tables_1.DbTable.PET_CATEGORY)
            .innerJoinAndSelect(`${tables_1.DbTable.CATALOG}.goodCategory`, tables_1.DbTable.GOOD_CATEGORY)
            .where(`${tables_1.DbTable.CATALOG_ITEM}.publicId IN (:...ids)`, { ids: goodsPublicIds })
            .getMany();
        const storageItemsHash = lodash_1.keyBy(storageItems.map((storageItem) => {
            const { catalogItem } = storageItem;
            const { catalog } = catalogItem;
            return {
                storage: {
                    id: storageItem.id,
                    cost: storageItem.cost,
                    quantity: storageItem.quantity,
                    createdAt: moment_1.default(storageItem.createdAt).toISOString(),
                    updatedAt: moment_1.default(storageItem.updatedAt).toISOString()
                },
                catalog: {
                    id: catalog.id,
                    displayName: catalog.displayName,
                    description: catalog.description,
                    rating: catalog.rating,
                    manufacturerCountry: catalog.manufacturerCountry,
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
                    },
                    createdAt: moment_1.default(catalog.createdAt).toISOString(),
                    updatedAt: moment_1.default(catalog.updatedAt).toISOString()
                },
                catalogItem: {
                    id: catalogItem.id,
                    publicId: catalogItem.publicId,
                    photoUrls: catalogItem.photoUrls,
                    weight: catalogItem.weight,
                    createdAt: moment_1.default(catalogItem.createdAt).toISOString(),
                    updatedAt: moment_1.default(catalogItem.updatedAt).toISOString()
                },
                catalogItemPublicId: storageItem.catalogItem.publicId
            };
        }), 'catalogItemPublicId');
        // Проверяем что все позиции найдены
        if (Object.keys(storageItemsHash).length !== goods.length) {
            throw new error_1.ClientError('COST_OR_QUANTITY_CHANGED', { meta: { goods, storageItems } });
        }
        // Проверяем, что цена и кол-во подходит
        const isValid = goods.every((good) => {
            const item = storageItemsHash[good.publicId];
            return good.cost === item.storage.cost && good.quantity <= item.storage.quantity;
        });
        if (!isValid) {
            throw new error_1.ClientError('COST_OR_QUANTITY_CHANGED', { meta: { goods, storageItems } });
        }
        await p_map_1.default(goods, async (good) => {
            const item = storageItemsHash[good.publicId];
            const { storage } = item;
            return manager
                .createQueryBuilder()
                .update(entities_1.Storage)
                .set({ quantity: storage.quantity - good.quantity })
                .where('id = :id', { id: storage.id })
                .execute();
        }, { concurrency: 2 });
        await manager
            .createQueryBuilder()
            .insert()
            .into(entities_1.OrderPosition)
            .values(goods.map((good) => {
            const item = storageItemsHash[good.publicId];
            return {
                orderId: order.id,
                cost: good.cost,
                quantity: good.quantity,
                data: lodash_1.omit(item, 'catalogItemPublicId')
            };
        }))
            .execute();
        return order.publicId;
    });
    const url = new url_1.URL(`/order/${orderPublicId}`, config_1.config['app.host']);
    sms_1.smsProvider.sendSms(phone, `Ваш заказ успешно создан: ${url.toString()}`);
    res.json({ publicId: orderPublicId });
});
//# sourceMappingURL=create-order.js.map
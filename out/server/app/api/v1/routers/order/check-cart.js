"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCart = void 0;
const lodash_1 = require("lodash");
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const request_cache_1 = require("../../../../lib/request-cache");
const entities_1 = require("../../../../../db-entity/entities");
const tables_1 = require("../../../../../db-entity/tables");
exports.checkCart = async_middleware_1.wrap(async (req, res) => {
    const cache = request_cache_1.requestCache.get(req);
    if (cache) {
        return res.json(cache);
    }
    const { goods } = req.body;
    const ids = goods.map(({ publicId }) => publicId);
    const storageItems = await db_manager_1.dbManager
        .getConnection()
        .getRepository(entities_1.Storage)
        .createQueryBuilder(tables_1.DbTable.STORAGE)
        .innerJoinAndSelect(`${tables_1.DbTable.STORAGE}.catalogItem`, tables_1.DbTable.CATALOG_ITEM)
        .where(`${tables_1.DbTable.CATALOG_ITEM}.publicId IN (:...ids)`, { ids })
        .getMany();
    const acutalHash = lodash_1.keyBy(storageItems.map((item) => ({
        publicId: item.catalogItem.publicId,
        cost: item.cost,
        quantity: item.quantity
    })), 'publicId');
    const currentHash = lodash_1.keyBy(goods.map((item) => ({
        publicId: item.publicId,
        cost: item.cost,
        quantity: item.quantity
    })), 'publicId');
    const diff = Object.entries(currentHash).reduce((res, [id, current]) => {
        const actual = acutalHash[id];
        if (!actual) {
            res[id] = {
                cost: null,
                quantity: 0
            };
        }
        else if (actual.cost !== current.cost || actual.quantity < current.quantity) {
            res[id] = {
                cost: actual.cost,
                quantity: actual.quantity
            };
        }
        return res;
    }, {});
    request_cache_1.requestCache.set(req, diff, 30); // 30 s
    res.json(diff);
});
//# sourceMappingURL=check-cart.js.map
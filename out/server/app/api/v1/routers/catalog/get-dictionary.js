"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDictionary = void 0;
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const request_cache_1 = require("../../../../lib/request-cache");
const entities_1 = require("../../../../../db-entity/entities");
const tables_1 = require("../../../../../db-entity/tables");
exports.getDictionary = async_middleware_1.wrap(async (req, res) => {
    const cache = request_cache_1.requestCache.get(req);
    if (cache) {
        return res.json(cache);
    }
    const connection = db_manager_1.dbManager.getConnection();
    const [brands, goodCategories, petCategories] = await Promise.all([
        connection.createQueryBuilder().select(tables_1.DbTable.BRAND).from(entities_1.Brand, tables_1.DbTable.BRAND).getMany(),
        connection
            .createQueryBuilder()
            .select(tables_1.DbTable.GOOD_CATEGORY)
            .from(entities_1.GoodCategory, tables_1.DbTable.GOOD_CATEGORY)
            .getMany(),
        connection.createQueryBuilder().select(tables_1.DbTable.PET_CATEGORY).from(entities_1.PetCategory, tables_1.DbTable.PET_CATEGORY).getMany()
    ]);
    const data = {
        brands: brands.map(({ code, displayName }) => ({ code, name: displayName })),
        goods: goodCategories.map(({ code, displayName }) => ({ code, name: displayName })),
        pets: petCategories.map(({ code, displayName }) => ({ code, name: displayName }))
    };
    request_cache_1.requestCache.set(req, data);
    res.json(data);
});
//# sourceMappingURL=get-dictionary.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDictionary = void 0;
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const index_1 = require("../../../../../db-entity/index");
const request_cache_1 = require("../../../../lib/request-cache");
exports.getDictionary = async_middleware_1.wrap(async (req, res) => {
    const cache = request_cache_1.requestCache.get(req);
    if (cache) {
        return res.json(cache);
    }
    const connection = db_manager_1.dbManager.getConnection();
    const [brands, goodCategories, petCategories] = await Promise.all([
        connection.createQueryBuilder().select(index_1.DbTable.BRAND).from(index_1.Brand, index_1.DbTable.BRAND).getMany(),
        connection
            .createQueryBuilder()
            .select(index_1.DbTable.GOOD_CATEGORY)
            .from(index_1.GoodCategory, index_1.DbTable.GOOD_CATEGORY)
            .getMany(),
        connection.createQueryBuilder().select(index_1.DbTable.PET_CATEGORY).from(index_1.PetCategory, index_1.DbTable.PET_CATEGORY).getMany()
    ]);
    const data = {
        brands: brands.map(({ code, displayName }) => ({ code, displayName })),
        goodCategories: goodCategories.map(({ code, displayName }) => ({ code, displayName })),
        petCategories: petCategories.map(({ code, displayName }) => ({ code, displayName }))
    };
    request_cache_1.requestCache.set(req, data);
    res.json(data);
});
//# sourceMappingURL=get-dictionary.js.map
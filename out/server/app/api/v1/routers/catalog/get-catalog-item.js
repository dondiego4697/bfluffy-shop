"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatalogItem = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const index_1 = require("../../../../../db-entity/index");
const request_cache_1 = require("../../../../lib/request-cache");
exports.getCatalogItem = async_middleware_1.wrap(async (req, res) => {
    const cache = request_cache_1.requestCache.get(req);
    if (cache) {
        return res.json(cache);
    }
    const { public_id: publicId } = req.params;
    const connection = db_manager_1.dbManager.getConnection();
    const catalogItem = await connection
        .createQueryBuilder()
        .select(index_1.DbTable.CATALOG)
        .from(index_1.Catalog, index_1.DbTable.CATALOG)
        .where(`${index_1.DbTable.CATALOG}.public_id = :id`, { id: publicId })
        .getOne();
    if (!catalogItem) {
        throw boom_1.default.notFound();
    }
    const catalogItems = await connection
        .getRepository(index_1.Catalog)
        .createQueryBuilder(index_1.DbTable.CATALOG)
        .innerJoinAndSelect(`${index_1.DbTable.CATALOG}.brand`, index_1.DbTable.BRAND)
        .innerJoinAndSelect(`${index_1.DbTable.CATALOG}.petCategory`, index_1.DbTable.PET_CATEGORY)
        .innerJoinAndSelect(`${index_1.DbTable.CATALOG}.goodCategory`, index_1.DbTable.GOOD_CATEGORY)
        .where(`${index_1.DbTable.CATALOG}.groupId = :id`, { id: catalogItem.groupId })
        .getMany();
    if (catalogItems.length === 0) {
        throw boom_1.default.notFound();
    }
    const [firstItem] = catalogItems;
    const data = {
        brand: {
            code: firstItem.brand.code,
            name: firstItem.brand.displayName
        },
        pet: {
            code: firstItem.petCategory.code,
            name: firstItem.petCategory.displayName
        },
        good: {
            code: firstItem.goodCategory.code,
            name: firstItem.goodCategory.displayName
        },
        displayName: firstItem.displayName,
        description: firstItem.description,
        manufacturerCountry: firstItem.manufacturerCountry,
        items: catalogItems.map((item) => ({
            publicId: item.publicId,
            rating: item.rating,
            photoUrls: item.photoUrls || []
        }))
    };
    request_cache_1.requestCache.set(req, data);
    res.json(data);
});
//# sourceMappingURL=get-catalog-item.js.map
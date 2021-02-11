"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatalogItem = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const async_middleware_1 = require("async-middleware");
const db_manager_1 = require("../../../../lib/db-manager");
const request_cache_1 = require("../../../../lib/request-cache");
const entities_1 = require("../../../../../db-entity/entities");
const tables_1 = require("../../../../../db-entity/tables");
exports.getCatalogItem = async_middleware_1.wrap(async (req, res) => {
    const cache = request_cache_1.requestCache.get(req);
    if (cache) {
        return res.json(cache);
    }
    const { public_id: publicId } = req.params;
    const connection = db_manager_1.dbManager.getConnection();
    const { manager: catalogItemManager } = db_manager_1.dbManager.getConnection().getRepository(entities_1.CatalogItem);
    const catalogItem = await catalogItemManager.findOne(entities_1.CatalogItem, { publicId });
    if (!catalogItem) {
        throw boom_1.default.notFound();
    }
    const catalog = await connection
        .getRepository(entities_1.Catalog)
        .createQueryBuilder(tables_1.DbTable.CATALOG)
        .innerJoinAndSelect(`${tables_1.DbTable.CATALOG}.brand`, tables_1.DbTable.BRAND)
        .innerJoinAndSelect(`${tables_1.DbTable.CATALOG}.petCategory`, tables_1.DbTable.PET_CATEGORY)
        .innerJoinAndSelect(`${tables_1.DbTable.CATALOG}.goodCategory`, tables_1.DbTable.GOOD_CATEGORY)
        .leftJoinAndSelect(`${tables_1.DbTable.CATALOG}.catalogItems`, tables_1.DbTable.CATALOG_ITEM)
        .where(`${tables_1.DbTable.CATALOG}.id = :id`, { id: catalogItem.catalogId })
        .getOne();
    if (!catalog) {
        throw boom_1.default.notFound();
    }
    const data = {
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
        displayName: catalog.displayName,
        description: catalog.description,
        manufacturerCountry: catalog.manufacturerCountry,
        rating: catalog.rating,
        createdAt: catalog.createdAt,
        updatedAt: catalog.updatedAt,
        items: catalog.catalogItems.map((item) => ({
            publicId: item.publicId,
            weight: item.weight,
            photoUrls: item.photoUrls || [],
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }))
    };
    request_cache_1.requestCache.set(req, data);
    res.json(data);
});
//# sourceMappingURL=get-catalog-item.js.map
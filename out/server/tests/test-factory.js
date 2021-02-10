"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFactory = void 0;
const faker_1 = __importDefault(require("faker"));
const slugify_1 = __importDefault(require("slugify"));
const db_manager_1 = require("../app/lib/db-manager");
const index_1 = require("../db-entity/index");
async function createBrand() {
    const name = faker_1.default.name.title() + Math.random();
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(index_1.Brand);
    const brand = manager.create(index_1.Brand, {
        code: slugify_1.default(name),
        displayName: name
    });
    await manager.save(brand);
    return manager.findOneOrFail(index_1.Brand, brand.id);
}
async function createPetCategory() {
    const name = faker_1.default.name.title() + Math.random();
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(index_1.PetCategory);
    const pet = manager.create(index_1.PetCategory, {
        code: slugify_1.default(name),
        displayName: name
    });
    await manager.save(pet);
    return manager.findOneOrFail(index_1.PetCategory, pet.id);
}
async function createGoodCategory() {
    const name = faker_1.default.name.title() + Math.random();
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(index_1.GoodCategory);
    const good = manager.create(index_1.GoodCategory, {
        code: slugify_1.default(name),
        displayName: name
    });
    await manager.save(good);
    return manager.findOneOrFail(index_1.GoodCategory, good.id);
}
async function createCatalog(params) {
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(index_1.Catalog);
    const catalog = manager.create(index_1.Catalog, {
        groupId: params.groupId || faker_1.default.random.uuid(),
        goodCategoryId: params.goodCategoryId,
        petCategoryId: params.petCategoryId,
        brandId: params.brandId,
        displayName: faker_1.default.commerce.productName(),
        description: faker_1.default.commerce.productDescription(),
        manufacturerCountry: faker_1.default.address.country(),
        photoUrls: [faker_1.default.image.image()],
        weight: faker_1.default.random.float()
    });
    await manager.save(catalog);
    return manager.findOneOrFail(index_1.Catalog, catalog.id);
}
exports.TestFactory = {
    createBrand,
    createPetCategory,
    createGoodCategory,
    createCatalog
};
//# sourceMappingURL=test-factory.js.map
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
    const name = faker_1.default.name.title();
    const { raw: [brandRaw] } = await db_manager_1.dbManager
        .getConnection()
        .createQueryBuilder()
        .insert()
        .into(index_1.Brand)
        .values([
        {
            code: slugify_1.default(name),
            displayName: name
        }
    ])
        .returning('*')
        .execute();
    return {
        id: brandRaw.id,
        code: brandRaw.code,
        displayName: brandRaw.display_name
    };
}
async function createPetCategory() {
    const name = faker_1.default.name.title();
    const { raw: [petRaw] } = await db_manager_1.dbManager
        .getConnection()
        .createQueryBuilder()
        .insert()
        .into(index_1.PetCategory)
        .values([
        {
            code: slugify_1.default(name),
            displayName: name
        }
    ])
        .returning('*')
        .execute();
    return {
        id: petRaw.id,
        code: petRaw.code,
        displayName: petRaw.display_name
    };
}
async function createGoodCategory() {
    const name = faker_1.default.name.title();
    const { raw: [goodRaw] } = await db_manager_1.dbManager
        .getConnection()
        .createQueryBuilder()
        .insert()
        .into(index_1.GoodCategory)
        .values([
        {
            code: slugify_1.default(name),
            displayName: name
        }
    ])
        .returning('*')
        .execute();
    return {
        id: goodRaw.id,
        code: goodRaw.code,
        displayName: goodRaw.display_name
    };
}
exports.TestFactory = {
    createBrand,
    createPetCategory,
    createGoodCategory
};
//# sourceMappingURL=test-factory.js.map
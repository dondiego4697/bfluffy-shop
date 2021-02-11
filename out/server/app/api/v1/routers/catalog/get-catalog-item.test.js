"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const got_1 = __importDefault(require("got"));
const lodash_1 = require("lodash");
const uuid_1 = require("uuid");
const test_context_1 = require("../../../../../tests/test-context");
const test_factory_1 = require("../../../../../tests/test-factory");
const PATH = '/api/v1/catalog/item/:id';
describe(PATH, () => {
    const context = new test_context_1.TestContext();
    let url;
    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });
    afterAll(async () => {
        await context.afterAll();
    });
    it('should return group of items', async () => {
        const brand = await test_factory_1.TestFactory.createBrand();
        const pet = await test_factory_1.TestFactory.createPetCategory();
        const good = await test_factory_1.TestFactory.createGoodCategory();
        const catalogs = await Promise.all([
            test_factory_1.TestFactory.createCatalog({
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            }),
            test_factory_1.TestFactory.createCatalog({
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            })
        ]);
        const catalogItems = await Promise.all([
            test_factory_1.TestFactory.createCatalogItem({
                catalogId: catalogs[0].id
            }),
            test_factory_1.TestFactory.createCatalogItem({
                catalogId: catalogs[0].id
            }),
            test_factory_1.TestFactory.createCatalogItem({
                catalogId: catalogs[1].id
            })
        ]);
        const { statusCode, body } = await got_1.default.get(`${url}${PATH.replace(':id', catalogItems[0].publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false
        });
        expect(statusCode).toBe(200);
        expect(Object.assign(Object.assign({}, body), { items: lodash_1.sortBy(body.items, 'publicId') })).toEqual({
            brand: {
                code: brand.code,
                name: brand.displayName
            },
            good: {
                code: good.code,
                name: good.displayName
            },
            pet: {
                code: pet.code,
                name: pet.displayName
            },
            displayName: catalogs[0].displayName,
            description: catalogs[0].description,
            manufacturerCountry: catalogs[0].manufacturerCountry,
            rating: catalogs[0].rating,
            createdAt: catalogs[0].createdAt.toISOString(),
            updatedAt: catalogs[0].updatedAt.toISOString(),
            items: lodash_1.sortBy([
                {
                    publicId: catalogItems[0].publicId,
                    photoUrls: catalogItems[0].photoUrls,
                    weight: catalogItems[0].weight,
                    createdAt: catalogItems[0].createdAt.toISOString(),
                    updatedAt: catalogItems[0].updatedAt.toISOString()
                },
                {
                    publicId: catalogItems[1].publicId,
                    photoUrls: catalogItems[1].photoUrls,
                    weight: catalogItems[1].weight,
                    createdAt: catalogItems[1].createdAt.toISOString(),
                    updatedAt: catalogItems[1].updatedAt.toISOString()
                }
            ], 'publicId')
        });
    });
    it('should throw 404', async () => {
        const { statusCode } = await got_1.default.get(`${url}${PATH.replace(':id', uuid_1.v4())}`, {
            responseType: 'json',
            throwHttpErrors: false
        });
        expect(statusCode).toBe(404);
    });
});
//# sourceMappingURL=get-catalog-item.test.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
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
        const groupId = uuid_1.v4();
        const catalog = await test_factory_1.TestFactory.createCatalog({
            groupId,
            brandId: brand.id,
            petCategoryId: pet.id,
            goodCategoryId: good.id
        });
        const catalogs = await Promise.all([
            test_factory_1.TestFactory.createCatalog({
                groupId,
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            }),
            test_factory_1.TestFactory.createCatalog({
                groupId: uuid_1.v4(),
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            })
        ]);
        const { statusCode, body } = await got_1.default.get(`${url}${PATH.replace(':id', catalogs[0].publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false
        });
        expect(statusCode).toEqual(200);
        expect(body).toEqual({
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
            displayName: catalog.displayName,
            description: catalog.description,
            manufacturerCountry: catalog.manufacturerCountry,
            items: [
                {
                    photoUrls: catalog.photoUrls,
                    publicId: catalog.publicId,
                    rating: catalog.rating
                },
                {
                    photoUrls: catalogs[0].photoUrls,
                    publicId: catalogs[0].publicId,
                    rating: catalogs[0].rating
                }
            ]
        });
    });
    it('should throw 404', async () => {
        const brand = await test_factory_1.TestFactory.createBrand();
        const pet = await test_factory_1.TestFactory.createPetCategory();
        const good = await test_factory_1.TestFactory.createGoodCategory();
        await test_factory_1.TestFactory.createCatalog({
            groupId: uuid_1.v4(),
            brandId: brand.id,
            petCategoryId: pet.id,
            goodCategoryId: good.id
        });
        const { statusCode } = await got_1.default.get(`${url}${PATH.replace(':id', uuid_1.v4())}`, {
            responseType: 'json',
            throwHttpErrors: false
        });
        expect(statusCode).toEqual(404);
    });
});
//# sourceMappingURL=get-catalog-item.test.js.map
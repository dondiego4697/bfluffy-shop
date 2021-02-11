"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const got_1 = __importDefault(require("got"));
const uuid_1 = require("uuid");
const test_context_1 = require("../../../../../tests/test-context");
const test_factory_1 = require("../../../../../tests/test-factory");
const PATH = '/api/v1/order/check_cart';
async function createBase() {
    const brand = await test_factory_1.TestFactory.createBrand();
    const pet = await test_factory_1.TestFactory.createPetCategory();
    const good = await test_factory_1.TestFactory.createGoodCategory();
    const catalog = await test_factory_1.TestFactory.createCatalog({
        brandId: brand.id,
        petCategoryId: pet.id,
        goodCategoryId: good.id
    });
    const catalogItems = await Promise.all([
        test_factory_1.TestFactory.createCatalogItem({ catalogId: catalog.id }),
        test_factory_1.TestFactory.createCatalogItem({ catalogId: catalog.id })
    ]);
    const storageItems = await Promise.all(catalogItems.map((item) => test_factory_1.TestFactory.createStorage({ catalogItemId: item.id })));
    return storageItems.map((item, i) => ({
        publicId: catalogItems[i].publicId,
        quantity: item.quantity,
        cost: item.cost
    }));
}
describe(`POST ${PATH}`, () => {
    const context = new test_context_1.TestContext();
    let url;
    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });
    afterAll(async () => {
        await context.afterAll();
    });
    it('should return correct diff if cost is different', async () => {
        const storageItems = await createBase();
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goods: storageItems.map((item, i) => ({
                    publicId: item.publicId,
                    quantity: item.quantity,
                    cost: i === 0 ? item.cost + 2 : item.cost
                }))
            }
        });
        expect(statusCode).toBe(200);
        expect(body).toEqual({
            [storageItems[0].publicId]: {
                cost: storageItems[0].cost,
                quantity: storageItems[0].quantity
            }
        });
    });
    it('should return correct diff if quantity is different', async () => {
        const storageItems = await createBase();
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goods: storageItems.map((item, i) => ({
                    publicId: item.publicId,
                    quantity: i === 0 ? item.quantity + 2 : item.quantity,
                    cost: item.cost
                }))
            }
        });
        expect(statusCode).toBe(200);
        expect(body).toEqual({
            [storageItems[0].publicId]: {
                cost: storageItems[0].cost,
                quantity: storageItems[0].quantity
            }
        });
    });
    it('should return correct diff if quantity and cost is different', async () => {
        const storageItems = await createBase();
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goods: storageItems.map((item, i) => ({
                    publicId: item.publicId,
                    quantity: i === 0 ? item.quantity + 2 : item.quantity,
                    cost: i === 0 ? item.cost + 2 : item.cost
                }))
            }
        });
        expect(statusCode).toBe(200);
        expect(body).toEqual({
            [storageItems[0].publicId]: {
                cost: storageItems[0].cost,
                quantity: storageItems[0].quantity
            }
        });
    });
    it('should return correct diff if does not exist is storage', async () => {
        const storageItems = await createBase();
        const publicId = uuid_1.v4();
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goods: storageItems.map((item, i) => ({
                    publicId: i === 0 ? publicId : item.publicId,
                    quantity: i === 1 ? item.quantity + 2 : item.quantity,
                    cost: item.cost
                }))
            }
        });
        expect(statusCode).toBe(200);
        expect(body).toEqual({
            [publicId]: {
                cost: null,
                quantity: 0
            },
            [storageItems[1].publicId]: {
                cost: storageItems[1].cost,
                quantity: storageItems[1].quantity
            }
        });
    });
});
//# sourceMappingURL=check-cart.test.js.map
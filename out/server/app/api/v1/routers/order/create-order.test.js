"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const got_1 = __importDefault(require("got"));
const uuid_1 = require("uuid");
const moment_1 = __importDefault(require("moment"));
const test_context_1 = require("../../../../../tests/test-context");
const test_factory_1 = require("../../../../../tests/test-factory");
const PATH = '/api/v1/order/create';
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
    return { storageItems, catalogItems };
}
describe(`POST ${PATH}`, () => {
    const context = new test_context_1.TestContext();
    let url;
    let csrf;
    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });
    afterAll(async () => {
        await context.afterAll();
    });
    beforeEach(async () => {
        await context.beforeEach();
        csrf = await test_factory_1.TestFactory.getCsrfToken(url);
    });
    it('should create order', async () => {
        const { storageItems: [storageItem], catalogItems: [catalogItem] } = await createBase();
        const deliveryDate = moment_1.default().add(1, 'days');
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                csrf,
                phone: 7988112312,
                delivery: {
                    address: 'address',
                    date: deliveryDate.format('X')
                },
                goods: [
                    {
                        publicId: catalogItem.publicId,
                        quantity: storageItem.quantity - 1,
                        cost: storageItem.cost
                    }
                ]
            }
        });
        expect(statusCode).toBe(200);
        const orders = await test_factory_1.TestFactory.getAllOrders();
        const order = orders.find((item) => item.publicId === body.publicId);
        expect(order).toMatchObject({
            clientPhone: '7988112312',
            deliveryAddress: 'address',
            deliveryDate: deliveryDate.milliseconds(0).toDate(),
            status: 'CREATED'
        });
        const storageItems = await test_factory_1.TestFactory.getAllStorageItems();
        const storageItemExpected = storageItems.find((item) => item.id === storageItem.id);
        expect(storageItemExpected).toMatchObject({
            quantity: 1
        });
    });
    it('should return client error if storage does not exist', async () => {
        const { storageItems: [storageItem] } = await createBase();
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                csrf,
                phone: 7988112312,
                delivery: {
                    address: 'address',
                    date: moment_1.default().format('X')
                },
                goods: [
                    {
                        publicId: uuid_1.v4(),
                        quantity: 1,
                        cost: storageItem.cost
                    }
                ]
            }
        });
        expect(statusCode).toBe(400);
        expect(body.message).toEqual('COST_OR_QUANTITY_CHANGED');
    });
    it('should return client error if cost changed', async () => {
        const { storageItems: [storageItem], catalogItems: [catalogItem] } = await createBase();
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                csrf,
                phone: 7988112312,
                delivery: {
                    address: 'address',
                    date: moment_1.default().format('X')
                },
                goods: [
                    {
                        publicId: catalogItem.publicId,
                        quantity: 1,
                        cost: storageItem.cost - 1
                    }
                ]
            }
        });
        expect(statusCode).toBe(400);
        expect(body.message).toEqual('COST_OR_QUANTITY_CHANGED');
    });
    it('should return client error if quantity heigher when exists', async () => {
        const { storageItems: [storageItem], catalogItems: [catalogItem] } = await createBase();
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                csrf,
                phone: 7988112312,
                delivery: {
                    address: 'address',
                    date: moment_1.default().format('X')
                },
                goods: [
                    {
                        publicId: catalogItem.publicId,
                        quantity: storageItem.quantity + 1,
                        cost: storageItem.cost
                    }
                ]
            }
        });
        expect(statusCode).toBe(400);
        expect(body.message).toEqual('COST_OR_QUANTITY_CHANGED');
    });
});
//# sourceMappingURL=create-order.test.js.map
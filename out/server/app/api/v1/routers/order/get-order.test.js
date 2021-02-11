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
const PATH = '/api/v1/order/:id';
describe(`GET ${PATH}`, () => {
    const context = new test_context_1.TestContext();
    let url;
    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });
    afterAll(async () => {
        await context.afterAll();
    });
    it('should return order', async () => {
        const order = await test_factory_1.TestFactory.createOrder();
        const orderPositions = await test_factory_1.TestFactory.createOrderPosition({ orderId: order.id });
        const { statusCode, body } = await got_1.default.get(`${url}${PATH.replace(':id', order.publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false
        });
        expect(statusCode).toBe(200);
        expect(Object.assign(Object.assign({}, body), { positions: lodash_1.sortBy(body.positions, 'cost') })).toEqual({
            order: {
                publicId: order.publicId,
                data: order.data,
                clientPhone: order.clientPhone,
                createdAt: order.createdAt.toISOString(),
                status: {
                    status: order.status,
                    resolution: order.resolution
                },
                delivery: {
                    address: order.deliveryAddress,
                    comment: order.deliveryComment,
                    date: order.deliveryDate.toISOString()
                }
            },
            positions: lodash_1.sortBy(orderPositions.map((position) => {
                const { data } = position;
                const { catalog, catalogItem } = data;
                return {
                    cost: position.cost,
                    quantity: position.quantity,
                    good: catalog.good,
                    pet: catalog.pet,
                    brand: catalog.brand,
                    manufacturerCountry: catalog.manufacturerCountry,
                    rating: catalog.rating,
                    displayName: catalog.displayName,
                    description: catalog.description,
                    photoUrls: catalogItem.photoUrls,
                    weight: catalogItem.weight
                };
            }), 'cost')
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
//# sourceMappingURL=get-order.test.js.map
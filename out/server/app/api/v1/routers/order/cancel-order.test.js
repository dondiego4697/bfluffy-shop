"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const got_1 = __importDefault(require("got"));
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
const test_context_1 = require("../../../../../tests/test-context");
const test_factory_1 = require("../../../../../tests/test-factory");
const order_1 = require("../../../../../db-entity/order");
const PATH = '/api/v1/order/:id';
function getQuantityDiff(before, after) {
    const aHash = lodash_1.keyBy(after, 'id');
    const bHash = lodash_1.keyBy(before, 'id');
    return Object.entries(bHash).reduce((res, [id, { quantity }]) => {
        res[id] = aHash[id].quantity - quantity;
        return res;
    }, {});
}
describe(`DELETE ${PATH}`, () => {
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
    it('should cancel order', async () => {
        const order = await test_factory_1.TestFactory.createOrder();
        const orderPositions = await test_factory_1.TestFactory.createOrderPosition({ orderId: order.id });
        const storageItemsBefore = await test_factory_1.TestFactory.getAllStorageItems();
        expect(order.status).not.toBe('FINISHED');
        const { statusCode, body } = await got_1.default.delete(`${url}${PATH.replace(':id', order.publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: { csrf }
        });
        expect(statusCode).toBe(200);
        expect(body).toEqual({ publicId: order.publicId });
        const orders = await test_factory_1.TestFactory.getAllOrders();
        const cancelledOrder = orders.find((item) => item.publicId === body.publicId);
        expect(cancelledOrder === null || cancelledOrder === void 0 ? void 0 : cancelledOrder.status).toBe('FINISHED');
        expect(cancelledOrder === null || cancelledOrder === void 0 ? void 0 : cancelledOrder.resolution).toBe('CANCELLED');
        const storageItemsAfter = await test_factory_1.TestFactory.getAllStorageItems();
        const quantityDiff = getQuantityDiff(storageItemsBefore, storageItemsAfter);
        const expectedQuantityDiff = orderPositions.reduce((res, position) => {
            res[position.data.storage.id] = position.quantity;
            return res;
        }, {});
        expect(quantityDiff).toEqual(expectedQuantityDiff);
    });
    it('should throw client error if order already finished', async () => {
        const order = await test_factory_1.TestFactory.createOrder({ status: order_1.OrderStatus.FINISHED });
        const { statusCode, body } = await got_1.default.delete(`${url}${PATH.replace(':id', order.publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: { csrf }
        });
        expect(statusCode).toBe(400);
        expect(body.message).toBe('ORDER_ALREADY_FINISHED');
    });
    it('should throw 404', async () => {
        const { statusCode } = await got_1.default.delete(`${url}${PATH.replace(':id', uuid_1.v4())}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: { csrf }
        });
        expect(statusCode).toBe(404);
    });
    it('should throw 403 without csrf', async () => {
        const { statusCode } = await got_1.default.delete(`${url}${PATH.replace(':id', uuid_1.v4())}`, {
            responseType: 'json',
            throwHttpErrors: false
        });
        expect(statusCode).toBe(403);
    });
});
//# sourceMappingURL=cancel-order.test.js.map
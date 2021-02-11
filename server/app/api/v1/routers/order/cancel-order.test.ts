/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';
import {v4 as uuidv4} from 'uuid';
import {keyBy} from 'lodash';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';
import {Storage} from '$db-entity/storage';
import {OrderStatus} from '$db-entity/order';

const PATH = '/api/v1/order/:id';

function getQuantityDiff(before: Storage[], after: Storage[]) {
    const aHash = keyBy(after, 'id');
    const bHash = keyBy(before, 'id');

    return Object.entries(bHash).reduce<Record<string, number>>((res, [id, {quantity}]) => {
        res[id] = aHash[id].quantity - quantity;

        return res;
    }, {});
}

describe(`DELETE ${PATH}`, () => {
    const context = new TestContext();
    let url: string;
    let csrf: string;

    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });

    afterAll(async () => {
        await context.afterAll();
    });

    beforeEach(async () => {
        await context.beforeEach();
        csrf = await TestFactory.getCsrfToken(url);
    });

    it('should cancel order', async () => {
        const order = await TestFactory.createOrder();
        const orderPositions = await TestFactory.createOrderPosition({orderId: order.id});

        const storageItemsBefore = await TestFactory.getAllStorageItems();

        expect(order.status).not.toBe('FINISHED');

        const {statusCode, body} = await got.delete<any>(`${url}${PATH.replace(':id', order.publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {csrf}
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({publicId: order.publicId});

        const orders = await TestFactory.getAllOrders();
        const cancelledOrder = orders.find((item) => item.publicId === body.publicId);

        expect(cancelledOrder?.status).toBe('FINISHED');
        expect(cancelledOrder?.resolution).toBe('CANCELLED');

        const storageItemsAfter = await TestFactory.getAllStorageItems();

        const quantityDiff = getQuantityDiff(storageItemsBefore, storageItemsAfter);

        const expectedQuantityDiff = orderPositions.reduce<Record<string, number>>((res, position) => {
            res[position.data.storage.id] = position.quantity;

            return res;
        }, {});

        expect(quantityDiff).toEqual(expectedQuantityDiff);
    });

    it('should throw client error if order already finished', async () => {
        const order = await TestFactory.createOrder({status: OrderStatus.FINISHED});

        const {statusCode, body} = await got.delete<any>(`${url}${PATH.replace(':id', order.publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {csrf}
        });

        expect(statusCode).toBe(400);
        expect(body.message).toBe('ORDER_ALREADY_FINISHED');
    });

    it('should throw 404', async () => {
        const {statusCode} = await got.delete<any>(`${url}${PATH.replace(':id', uuidv4())}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {csrf}
        });

        expect(statusCode).toBe(404);
    });

    it('should throw 403 without csrf', async () => {
        const {statusCode} = await got.delete<any>(`${url}${PATH.replace(':id', uuidv4())}`, {
            responseType: 'json',
            throwHttpErrors: false
        });

        expect(statusCode).toBe(403);
    });
});

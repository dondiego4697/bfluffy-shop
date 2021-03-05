/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';
import {v4 as uuidv4} from 'uuid';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';
import {OrderStatus} from '$db-entity/order';

const PATH = '/api/v1/order/:id/confirm';

describe(`POST ${PATH}`, () => {
    const context = new TestContext();
    let url: string;

    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });

    afterAll(async () => {
        await context.afterAll();
    });

    beforeEach(async () => {
        await context.beforeEach();
    });

    it('should confirm order', async () => {
        const order = await TestFactory.createOrder();

        const {statusCode, body} = await got.post<any>(`${url}${PATH.replace(':id', order.publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {}
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({publicId: order.publicId});

        const orders = await TestFactory.getAllOrders();
        const confirmedOrder = orders.find((item) => item.publicId === body.publicId);

        expect(confirmedOrder?.status).toBe('CONFIRMED');

        // Проверяем триггер, что в order_status_history добавился новый статус
        const orderStatusHistory = await TestFactory.getAllOrderStatusHistory();
        const orderStatusHistoryExpected = orderStatusHistory.filter((it) => it.orderId === order?.id);

        expect(orderStatusHistoryExpected).toMatchObject([
            {
                orderId: order?.id,
                resolution: null,
                status: 'CONFIRMED'
            }
        ]);
    });

    it('should throw client error if order already not created', async () => {
        const order = await TestFactory.createOrder({status: OrderStatus.CONFIRMED});

        const {statusCode, body} = await got.post<any>(`${url}${PATH.replace(':id', order.publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {}
        });

        expect(statusCode).toBe(400);
        expect(body.message).toBe('ORDER_NOT_IN_CREATED_STATUS');
    });

    it('should throw 404', async () => {
        const {statusCode} = await got.post<any>(`${url}${PATH.replace(':id', uuidv4())}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {}
        });

        expect(statusCode).toBe(404);
    });
});

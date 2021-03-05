/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/order/check_delivery';

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

    it('should return enable = false', async () => {
        await Promise.all([TestFactory.createDeliveryArea(), TestFactory.createDeliveryArea({enable: true})]);

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            json: {
                lon: 0,
                lat: 0
            },
            throwHttpErrors: false
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({
            enable: false
        });
    });

    it('should return enable = true', async () => {
        await TestFactory.createDeliveryArea({enable: true});

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            json: {
                lon: 5,
                lat: 5
            },
            throwHttpErrors: false
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({
            enable: true
        });
    });
});

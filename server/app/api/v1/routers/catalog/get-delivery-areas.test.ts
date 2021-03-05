/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';
import {omit} from 'lodash';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/catalog/delivery_areas';

describe(`GET ${PATH}`, () => {
    const context = new TestContext();
    let url: string;

    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });

    afterAll(async () => {
        await context.afterAll();
    });

    it('should return all delivery areas', async () => {
        const areas = await Promise.all([
            TestFactory.createDeliveryArea(),
            TestFactory.createDeliveryArea({enable: true})
        ]);

        const {statusCode, body} = await got.get<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual([omit(areas[1], ['id'])]);
    });
});

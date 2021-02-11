/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/sms/verify_code';

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

    it('should return cookie with csrf', async () => {
        const user = await TestFactory.createUser();

        const {statusCode, body, headers} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                phone: user.phone,
                code: user.lastSmsCode
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({});

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(headers['set-cookie']![0].includes('csrf_token=')).toBeTruthy();
    });

    it('should throw 404 if user does not exist', async () => {
        const {statusCode} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                phone: '791283123123123',
                code: '123123'
            }
        });

        expect(statusCode).toBe(404);
    });

    it('should throw 400 if code unmatched', async () => {
        const user = await TestFactory.createUser();

        const {statusCode} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                phone: user.phone,
                code: '1238123'
            }
        });

        expect(statusCode).toBe(400);
    });
});

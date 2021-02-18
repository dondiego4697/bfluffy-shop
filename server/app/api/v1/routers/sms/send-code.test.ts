/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';
import nock from 'nock';
import moment from 'moment';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';
import {config} from 'app/config';

const PATH = '/api/v1/sms/send_code';

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

    it('should create user if it does not exist', async () => {
        const checkPhone = '79881231222';

        nock(config['sms-boom.host'])
            .get('/messages/v2/send')
            .query((q: any) => q.phone === checkPhone && q.text.includes('Ваш код:'))
            .reply(200);

        const usersBefore = await TestFactory.getAllUsers();

        expect(usersBefore.length).toBe(0);

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                phone: checkPhone
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({left: 30});

        const usersAfter = await TestFactory.getAllUsers();
        const user = usersAfter.find(({phone}) => phone === checkPhone);

        expect(user).toBeTruthy();
    });

    it('should update existed user', async () => {
        const userBefore = await TestFactory.createUser({
            lastSmsCodeAt: moment().subtract(2, 'minutes').toDate()
        });

        nock(config['sms-boom.host'])
            .get('/messages/v2/send')
            .query((q: any) => q.phone === userBefore.phone && q.text.includes('Ваш код:'))
            .reply(200);

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                phone: userBefore.phone
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({left: 30});

        const usersAfter = await TestFactory.getAllUsers();
        const userAfter = usersAfter.find(({phone}) => phone === userBefore.phone);

        expect(userAfter?.lastSmsCode).toBeTruthy();
        expect(userAfter?.lastSmsCode).not.toBe(userBefore.lastSmsCode);
    });

    it('should return time left if last sms was sent too recently', async () => {
        const userBefore = await TestFactory.createUser({
            lastSmsCodeAt: moment().subtract(10, 'seconds').toDate()
        });

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                phone: userBefore.phone
            }
        });

        expect(statusCode).toBe(200);
        expect(body.left > 18 && body.left < 22).toBeTruthy();
    });
});

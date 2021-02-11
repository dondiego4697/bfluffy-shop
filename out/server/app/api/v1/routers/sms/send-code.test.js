"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const got_1 = __importDefault(require("got"));
const moment_1 = __importDefault(require("moment"));
const test_context_1 = require("../../../../../tests/test-context");
const test_factory_1 = require("../../../../../tests/test-factory");
const PATH = '/api/v1/sms/send_code';
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
    it('should create user if it does not exist', async () => {
        const usersBefore = await test_factory_1.TestFactory.getAllUsers();
        expect(usersBefore.length).toBe(0);
        const checkPhone = '79881231222';
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                phone: checkPhone
            }
        });
        expect(statusCode).toBe(200);
        expect(body).toEqual({ left: 30 });
        const usersAfter = await test_factory_1.TestFactory.getAllUsers();
        const user = usersAfter.find(({ phone }) => phone === checkPhone);
        expect(user).toBeTruthy();
    });
    it('should update existed user', async () => {
        const userBefore = await test_factory_1.TestFactory.createUser({
            lastSmsCodeAt: moment_1.default().subtract(2, 'minutes').toDate()
        });
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                phone: userBefore.phone
            }
        });
        expect(statusCode).toBe(200);
        expect(body).toEqual({ left: 30 });
        const usersAfter = await test_factory_1.TestFactory.getAllUsers();
        const userAfter = usersAfter.find(({ phone }) => phone === userBefore.phone);
        expect(userAfter === null || userAfter === void 0 ? void 0 : userAfter.lastSmsCode).toBeTruthy();
        expect(userAfter === null || userAfter === void 0 ? void 0 : userAfter.lastSmsCode).not.toBe(userBefore.lastSmsCode);
    });
    it('should return time left if last sms was sent too recently', async () => {
        const userBefore = await test_factory_1.TestFactory.createUser({
            lastSmsCodeAt: moment_1.default().subtract(10, 'seconds').toDate()
        });
        const { statusCode, body } = await got_1.default.post(`${url}${PATH}`, {
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
//# sourceMappingURL=send-code.test.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const got_1 = __importDefault(require("got"));
const test_context_1 = require("../../../../../tests/test-context");
const test_factory_1 = require("../../../../../tests/test-factory");
const PATH = '/api/v1/sms/verify_code';
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
    it('should return cookie with csrf', async () => {
        const user = await test_factory_1.TestFactory.createUser();
        const { statusCode, body, headers } = await got_1.default.post(`${url}${PATH}`, {
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
        expect(headers['set-cookie'][0].includes('csrf_token=')).toBeTruthy();
    });
    it('should throw 404 if user does not exist', async () => {
        const { statusCode } = await got_1.default.post(`${url}${PATH}`, {
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
        const user = await test_factory_1.TestFactory.createUser();
        const { statusCode } = await got_1.default.post(`${url}${PATH}`, {
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
//# sourceMappingURL=verify-code.test.js.map
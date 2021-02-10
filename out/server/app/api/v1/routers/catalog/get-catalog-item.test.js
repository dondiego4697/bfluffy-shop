"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
const test_context_1 = require("../../../../../tests/test-context");
const PATH = '/api/v1/catalog/dictionary';
describe(PATH, () => {
    const context = new test_context_1.TestContext();
    let url;
    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });
    afterAll(async () => {
        await context.afterAll();
    });
    it('should', async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const { statusCode, body } = await got_1.default.get(`${url}${PATH}`);
        console.log(body);
        expect(statusCode).toEqual(200);
    });
});
//# sourceMappingURL=get-catalog-item.test.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
const typeorm_test_transactions_1 = require("typeorm-test-transactions");
const test_context_1 = require("../../../../../tests/test-context");
const test_factory_1 = require("../../../../../tests/test-factory");
const PATH = '/api/v1/catalog/dictionary';
typeorm_test_transactions_1.initialiseTestTransactions();
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
    it('should return correct result', async () => {
        await typeorm_test_transactions_1.runInTransaction(async () => {
            const brand = await test_factory_1.TestFactory.createBrand();
            const pet = await test_factory_1.TestFactory.createPetCategory();
            const good = await test_factory_1.TestFactory.createGoodCategory();
            const { statusCode, body } = await got_1.default.get(`${url}${PATH}`, {
                responseType: 'json'
            });
            expect(statusCode).toEqual(200);
            expect(body).toEqual({
                brands: [
                    {
                        code: brand.code,
                        displayName: brand.displayName
                    }
                ],
                goodCategories: [
                    {
                        code: good.code,
                        displayName: good.displayName
                    }
                ],
                petCategories: [
                    {
                        code: pet.code,
                        displayName: pet.displayName
                    }
                ]
            });
        });
    });
});
//# sourceMappingURL=get-dictionary.test.js.map
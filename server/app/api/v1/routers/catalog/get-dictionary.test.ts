import got from 'got';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/catalog/dictionary';

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

    it('should return correct result', async () => {
        const brand = await TestFactory.createBrand();
        const pet = await TestFactory.createPetCategory();
        const good = await TestFactory.createGoodCategory();

        const {statusCode, body} = await got.get(`${url}${PATH}`, {
            responseType: 'json'
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({
            brands: [
                {
                    code: brand.code,
                    name: brand.displayName
                }
            ],
            goods: [
                {
                    code: good.code,
                    name: good.displayName
                }
            ],
            pets: [
                {
                    code: pet.code,
                    name: pet.displayName
                }
            ]
        });
    });
});

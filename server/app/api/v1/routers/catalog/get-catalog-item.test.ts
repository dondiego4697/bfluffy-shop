import got from 'got';

import {TestContext} from 'tests/test-context';

const PATH = '/api/v1/catalog/dictionary';

describe(PATH, () => {
    const context = new TestContext();
    let url: string;

    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });

    afterAll(async () => {
        await context.afterAll();
    });

    it('should', async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const {statusCode, body} = await got.get(`${url}${PATH}`);

        console.log(body);
        expect(statusCode).toEqual(200);
    });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';
import {v4 as uuidv4} from 'uuid';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/order/check_cart';

async function createBase() {
    const brand = await TestFactory.createBrand();
    const pet = await TestFactory.createPetCategory();
    const good = await TestFactory.createGoodCategory();

    const catalog = await TestFactory.createCatalog({
        brandId: brand.id,
        petCategoryId: pet.id,
        goodCategoryId: good.id
    });

    const catalogItems = await Promise.all([
        TestFactory.createCatalogItem({catalogId: catalog.id}),
        TestFactory.createCatalogItem({catalogId: catalog.id})
    ]);

    const storageItems = await Promise.all(
        catalogItems.map((item) => TestFactory.createStorage({catalogItemId: item.id}))
    );

    return storageItems.map((item, i) => ({
        publicId: catalogItems[i].publicId,
        quantity: item.quantity,
        cost: item.cost
    }));
}

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

    it('should return correct diff if cost is different', async () => {
        const storageItems = await createBase();

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goods: storageItems.map((item, i) => ({
                    publicId: item.publicId,
                    quantity: item.quantity,
                    cost: i === 0 ? item.cost + 2 : item.cost
                }))
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({
            [storageItems[0].publicId]: {
                cost: storageItems[0].cost,
                quantity: storageItems[0].quantity
            }
        });
    });

    it('should return correct diff if quantity is different', async () => {
        const storageItems = await createBase();

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goods: storageItems.map((item, i) => ({
                    publicId: item.publicId,
                    quantity: i === 0 ? item.quantity + 2 : item.quantity,
                    cost: item.cost
                }))
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({
            [storageItems[0].publicId]: {
                cost: storageItems[0].cost,
                quantity: storageItems[0].quantity
            }
        });
    });

    it('should return correct diff if quantity and cost is different', async () => {
        const storageItems = await createBase();

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goods: storageItems.map((item, i) => ({
                    publicId: item.publicId,
                    quantity: i === 0 ? item.quantity + 2 : item.quantity,
                    cost: i === 0 ? item.cost + 2 : item.cost
                }))
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({
            [storageItems[0].publicId]: {
                cost: storageItems[0].cost,
                quantity: storageItems[0].quantity
            }
        });
    });

    it('should return correct diff if does not exist is storage', async () => {
        const storageItems = await createBase();
        const publicId = uuidv4();

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goods: storageItems.map((item, i) => ({
                    publicId: i === 0 ? publicId : item.publicId,
                    quantity: i === 1 ? item.quantity + 2 : item.quantity,
                    cost: item.cost
                }))
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toEqual({
            [publicId]: {
                cost: null,
                quantity: 0
            },
            [storageItems[1].publicId]: {
                cost: storageItems[1].cost,
                quantity: storageItems[1].quantity
            }
        });
    });
});

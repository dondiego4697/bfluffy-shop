/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';
import {v4 as uuidv4} from 'uuid';
import moment from 'moment';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/order/create';

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

    return {storageItems, catalogItems};
}

describe(`POST ${PATH}`, () => {
    const context = new TestContext();
    let url: string;
    let csrf: string;

    beforeAll(async () => {
        url = await context.getServerAddress();
        await context.beforeAll();
    });

    afterAll(async () => {
        await context.afterAll();
    });

    beforeEach(async () => {
        await context.beforeEach();
        csrf = await TestFactory.getCsrfToken(url);
    });

    it('should create order', async () => {
        const {
            storageItems: [storageItem],
            catalogItems: [catalogItem]
        } = await createBase();

        const deliveryDate = moment().add(1, 'days');

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                csrf,
                phone: 7988112312,
                delivery: {
                    address: 'address',
                    date: deliveryDate.format('X')
                },
                goods: [
                    {
                        publicId: catalogItem.publicId,
                        quantity: storageItem.quantity - 1,
                        cost: storageItem.cost
                    }
                ]
            }
        });

        expect(statusCode).toBe(200);

        const orders = await TestFactory.getAllOrders();
        const order = orders.find((item) => item.publicId === body.publicId);

        expect(order).toMatchObject({
            clientPhone: '7988112312',
            deliveryAddress: 'address',
            deliveryDate: deliveryDate.milliseconds(0).toDate(),
            status: 'CREATED'
        });

        const storageItems = await TestFactory.getAllStorageItems();
        const storageItemExpected = storageItems.find((item) => item.id === storageItem.id);

        expect(storageItemExpected).toMatchObject({
            quantity: 1
        });
    });

    it('should return client error if storage does not exist', async () => {
        const {
            storageItems: [storageItem]
        } = await createBase();

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                csrf,
                phone: 7988112312,
                delivery: {
                    address: 'address',
                    date: moment().format('X')
                },
                goods: [
                    {
                        publicId: uuidv4(),
                        quantity: 1,
                        cost: storageItem.cost
                    }
                ]
            }
        });

        expect(statusCode).toBe(400);
        expect(body.message).toEqual('COST_OR_QUANTITY_CHANGED');
    });

    it('should return client error if cost changed', async () => {
        const {
            storageItems: [storageItem],
            catalogItems: [catalogItem]
        } = await createBase();

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                csrf,
                phone: 7988112312,
                delivery: {
                    address: 'address',
                    date: moment().format('X')
                },
                goods: [
                    {
                        publicId: catalogItem.publicId,
                        quantity: 1,
                        cost: storageItem.cost - 1
                    }
                ]
            }
        });

        expect(statusCode).toBe(400);
        expect(body.message).toEqual('COST_OR_QUANTITY_CHANGED');
    });

    it('should return client error if quantity heigher when exists', async () => {
        const {
            storageItems: [storageItem],
            catalogItems: [catalogItem]
        } = await createBase();

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                csrf,
                phone: 7988112312,
                delivery: {
                    address: 'address',
                    date: moment().format('X')
                },
                goods: [
                    {
                        publicId: catalogItem.publicId,
                        quantity: storageItem.quantity + 1,
                        cost: storageItem.cost
                    }
                ]
            }
        });

        expect(statusCode).toBe(400);
        expect(body.message).toEqual('COST_OR_QUANTITY_CHANGED');
    });
});

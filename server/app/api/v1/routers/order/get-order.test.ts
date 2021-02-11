/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';
import {sortBy} from 'lodash';
import {v4 as uuidv4} from 'uuid';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/order/:id';

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

    it('should return order', async () => {
        const order = await TestFactory.createOrder();
        const orderPositions = await TestFactory.createOrderPosition({orderId: order.id});

        const {statusCode, body} = await got.get<any>(`${url}${PATH.replace(':id', order.publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false
        });

        expect(statusCode).toBe(200);
        expect({
            ...body,
            positions: sortBy(body.positions, 'cost')
        }).toEqual({
            order: {
                publicId: order.publicId,
                data: order.data,
                clientPhone: order.clientPhone,
                createdAt: order.createdAt.toISOString(),
                status: {
                    status: order.status,
                    resolution: order.resolution
                },
                delivery: {
                    address: order.deliveryAddress,
                    comment: order.deliveryComment,
                    date: order.deliveryDate.toISOString()
                }
            },
            positions: sortBy(
                orderPositions.map((position) => {
                    const {data} = position;
                    const {catalog, catalogItem} = data;

                    return {
                        cost: position.cost,
                        quantity: position.quantity,
                        good: catalog.good,
                        pet: catalog.pet,
                        brand: catalog.brand,
                        manufacturerCountry: catalog.manufacturerCountry,
                        rating: catalog.rating,
                        displayName: catalog.displayName,
                        description: catalog.description,
                        photoUrls: catalogItem.photoUrls,
                        weight: catalogItem.weight
                    };
                }),
                'cost'
            )
        });
    });

    it('should throw 404', async () => {
        const {statusCode} = await got.get(`${url}${PATH.replace(':id', uuidv4())}`, {
            responseType: 'json',
            throwHttpErrors: false
        });

        expect(statusCode).toBe(404);
    });
});

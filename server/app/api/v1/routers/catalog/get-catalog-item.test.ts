/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';
import {sortBy} from 'lodash';
import {v4 as uuidv4} from 'uuid';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/catalog/item/:id';

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

    it('should return group of items', async () => {
        const brand = await TestFactory.createBrand();
        const pet = await TestFactory.createPetCategory();
        const good = await TestFactory.createGoodCategory();

        const catalogs = await Promise.all([
            TestFactory.createCatalog({
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            }),
            TestFactory.createCatalog({
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            })
        ]);

        const catalogItems = await Promise.all([
            TestFactory.createCatalogItem({
                catalogId: catalogs[0].id
            }),
            TestFactory.createCatalogItem({
                catalogId: catalogs[0].id
            }),
            TestFactory.createCatalogItem({
                catalogId: catalogs[1].id
            })
        ]);

        const {statusCode, body} = await got.get<any>(`${url}${PATH.replace(':id', catalogItems[0].publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false
        });

        expect(statusCode).toBe(200);
        expect({
            ...body,
            items: sortBy(body.items, 'publicId')
        }).toEqual({
            brand: {
                code: brand.code,
                name: brand.displayName
            },
            good: {
                code: good.code,
                name: good.displayName
            },
            pet: {
                code: pet.code,
                name: pet.displayName
            },
            displayName: catalogs[0].displayName,
            description: catalogs[0].description,
            manufacturerCountry: catalogs[0].manufacturerCountry,
            rating: catalogs[0].rating,
            createdAt: catalogs[0].createdAt.toISOString(),
            updatedAt: catalogs[0].updatedAt.toISOString(),
            items: sortBy(
                [
                    {
                        publicId: catalogItems[0].publicId,
                        photoUrls: catalogItems[0].photoUrls,
                        weight: catalogItems[0].weight,
                        createdAt: catalogItems[0].createdAt.toISOString(),
                        updatedAt: catalogItems[0].updatedAt.toISOString()
                    },
                    {
                        publicId: catalogItems[1].publicId,
                        photoUrls: catalogItems[1].photoUrls,
                        weight: catalogItems[1].weight,
                        createdAt: catalogItems[1].createdAt.toISOString(),
                        updatedAt: catalogItems[1].updatedAt.toISOString()
                    }
                ],
                'publicId'
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

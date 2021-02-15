/* eslint-disable @typescript-eslint/no-explicit-any */
import got from 'got';

import {TestContext} from 'tests/test-context';
import {TestFactory} from 'tests/test-factory';

const PATH = '/api/v1/search/base';

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

    it('should return correct items by [brand]', async () => {
        const brands = await Promise.all([TestFactory.createBrand(), TestFactory.createBrand()]);
        const pet = await TestFactory.createPetCategory();
        const good = await TestFactory.createGoodCategory();

        const catalogs = await Promise.all([
            TestFactory.createCatalog({
                brandId: brands[0].id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            }),
            TestFactory.createCatalog({
                brandId: brands[1].id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            })
        ]);

        const catalogItems = await Promise.all([
            TestFactory.createCatalogItem({
                catalogId: catalogs[0].id
            }),
            TestFactory.createCatalogItem({
                catalogId: catalogs[1].id
            })
        ]);

        await Promise.all([
            TestFactory.createStorage({
                catalogItemId: catalogItems[0].id
            }),
            TestFactory.createStorage({
                catalogItemId: catalogItems[1].id
            })
        ]);

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                brandCode: brands[1].code
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toMatchObject([
            {
                brand: brands[1].displayName
            }
        ]);
    });

    it('should return correct items by [good]', async () => {
        const brand = await TestFactory.createBrand();
        const pet = await TestFactory.createPetCategory();
        const goods = await Promise.all([TestFactory.createGoodCategory(), TestFactory.createGoodCategory()]);

        const catalogs = await Promise.all([
            TestFactory.createCatalog({
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: goods[0].id
            }),
            TestFactory.createCatalog({
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: goods[1].id
            })
        ]);

        const catalogItems = await Promise.all([
            TestFactory.createCatalogItem({
                catalogId: catalogs[0].id
            }),
            TestFactory.createCatalogItem({
                catalogId: catalogs[1].id
            })
        ]);

        await Promise.all([
            TestFactory.createStorage({
                catalogItemId: catalogItems[0].id
            }),
            TestFactory.createStorage({
                catalogItemId: catalogItems[1].id
            })
        ]);

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goodCode: goods[1].code
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toMatchObject([
            {
                good: goods[1].displayName
            }
        ]);
    });

    it('should return correct items by [pet]', async () => {
        const brand = await TestFactory.createBrand();
        const pets = await Promise.all([TestFactory.createPetCategory(), TestFactory.createPetCategory()]);
        const good = await TestFactory.createGoodCategory();

        const catalogs = await Promise.all([
            TestFactory.createCatalog({
                brandId: brand.id,
                petCategoryId: pets[0].id,
                goodCategoryId: good.id
            }),
            TestFactory.createCatalog({
                brandId: brand.id,
                petCategoryId: pets[1].id,
                goodCategoryId: good.id
            })
        ]);

        const catalogItems = await Promise.all([
            TestFactory.createCatalogItem({
                catalogId: catalogs[0].id
            }),
            TestFactory.createCatalogItem({
                catalogId: catalogs[1].id
            })
        ]);

        await Promise.all([
            TestFactory.createStorage({
                catalogItemId: catalogItems[0].id
            }),
            TestFactory.createStorage({
                catalogItemId: catalogItems[1].id
            })
        ]);

        const {statusCode, body} = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                petCode: pets[1].code
            }
        });

        expect(statusCode).toBe(200);
        expect(body).toMatchObject([
            {
                pet: pets[1].displayName
            }
        ]);
    });

    it('should return correct items in price range', async () => {
        const brand = await TestFactory.createBrand();
        const pet = await TestFactory.createPetCategory();
        const good = await TestFactory.createGoodCategory();
        const catalog = await TestFactory.createCatalog({
            brandId: brand.id,
            petCategoryId: pet.id,
            goodCategoryId: good.id
        });
        const catalogItem = await TestFactory.createCatalogItem({
            catalogId: catalog.id
        });
        const storage = await TestFactory.createStorage({
            catalogItemId: catalogItem.id
        });

        const responseMin = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                brandCode: brand.code,
                cost: {
                    min: storage.cost - 1
                }
            }
        });

        expect(responseMin.body.length).toBe(1);

        const responseMinOut = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                brandCode: brand.code,
                cost: {
                    min: storage.cost + 1
                }
            }
        });

        expect(responseMinOut.body.length).toBe(0);

        const responseMax = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                petCode: pet.code,
                cost: {
                    max: storage.cost + 1
                }
            }
        });

        expect(responseMax.body.length).toBe(1);

        const responseMaxOut = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                petCode: pet.code,
                cost: {
                    max: storage.cost - 1
                }
            }
        });

        expect(responseMaxOut.body.length).toBe(0);

        const responseTotal = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goodCode: good.code,
                cost: {
                    min: storage.cost - 1,
                    max: storage.cost + 1
                }
            }
        });

        expect(responseTotal.body.length).toBe(1);

        const responseTotalOut = await got.post<any>(`${url}${PATH}`, {
            responseType: 'json',
            throwHttpErrors: false,
            json: {
                goodCode: good.code,
                cost: {
                    min: storage.cost + 1,
                    max: storage.cost + 2
                }
            }
        });

        expect(responseTotalOut.body.length).toBe(0);
    });
});

import got from 'got';
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
        const groupId = uuidv4();

        const catalog = await TestFactory.createCatalog({
            groupId,
            brandId: brand.id,
            petCategoryId: pet.id,
            goodCategoryId: good.id
        });

        const catalogs = await Promise.all([
            TestFactory.createCatalog({
                groupId,
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            }),
            TestFactory.createCatalog({
                groupId: uuidv4(),
                brandId: brand.id,
                petCategoryId: pet.id,
                goodCategoryId: good.id
            })
        ]);

        const {statusCode, body} = await got.get(`${url}${PATH.replace(':id', catalogs[0].publicId)}`, {
            responseType: 'json',
            throwHttpErrors: false
        });

        expect(statusCode).toEqual(200);
        expect(body).toEqual({
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
            displayName: catalog.displayName,
            description: catalog.description,
            manufacturerCountry: catalog.manufacturerCountry,
            items: [
                {
                    photoUrls: catalog.photoUrls,
                    publicId: catalog.publicId,
                    rating: catalog.rating
                },
                {
                    photoUrls: catalogs[0].photoUrls,
                    publicId: catalogs[0].publicId,
                    rating: catalogs[0].rating
                }
            ]
        });
    });

    it('should throw 404', async () => {
        const brand = await TestFactory.createBrand();
        const pet = await TestFactory.createPetCategory();
        const good = await TestFactory.createGoodCategory();

        await TestFactory.createCatalog({
            groupId: uuidv4(),
            brandId: brand.id,
            petCategoryId: pet.id,
            goodCategoryId: good.id
        });

        const {statusCode} = await got.get(`${url}${PATH.replace(':id', uuidv4())}`, {
            responseType: 'json',
            throwHttpErrors: false
        });

        expect(statusCode).toEqual(404);
    });
});

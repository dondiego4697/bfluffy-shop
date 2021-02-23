import dotenv from 'dotenv';

dotenv.config();

process.env.ENVIRONMENT = 'stress';

import pMap from 'p-map';
import {random, range} from 'lodash';
import {TestFactory} from 'tests/test-factory';

const MAX_BRAND_COUNT = 200;
const MAX_USER_COUNT = 10_000;
const MAX_CATALOG_COUNT = 10_000;
const MAX_ORDER_COUNT = 50_000;

export async function handle() {
    const petIds: number[] = [];
    const goodIds: number[] = [];
    const brandIds: number[] = [];
    const userIds: number[] = [];
    const catalogIds: number[] = [];
    const catalogItemIds: number[] = [];
    const storageIds: number[] = [];

    // pet
    await pMap(['cats', 'kitten', 'dogs', 'puppy'], async (code) => {
        const pet = await TestFactory.createPetCategory({code});

        petIds.push(pet.id);
    });

    // brand, good
    await pMap(
        range(0, MAX_BRAND_COUNT),
        async () => {
            const brand = await TestFactory.createBrand();
            const good = await TestFactory.createGoodCategory();

            goodIds.push(good.id);
            brandIds.push(brand.id);
        },
        {concurrency: 10}
    );

    // users
    await pMap(
        range(0, MAX_USER_COUNT),
        async (_, i) => {
            const user = await TestFactory.createUser();

            userIds.push(user.id);

            console.log(`[users] created ${i}/${MAX_USER_COUNT}`);
        },
        {concurrency: 20}
    );

    // catalog
    await pMap(
        range(0, MAX_CATALOG_COUNT),
        async (_, i) => {
            const index = [random(0, petIds.length - 1), random(0, goodIds.length - 1), random(0, brandIds.length - 1)];

            const catalog = await TestFactory.createCatalog({
                petCategoryId: petIds[index[0]],
                goodCategoryId: goodIds[index[1]],
                brandId: brandIds[index[2]]
            });

            catalogIds.push(catalog.id);

            console.log(`[catalog] created ${i}/${MAX_CATALOG_COUNT}`);
        },
        {concurrency: 20}
    );

    // catalog item
    await pMap(
        catalogIds,
        async (catalogId, i) => {
            await pMap(
                range(0, random(5, 10)),
                async () => {
                    const catalogItem = await TestFactory.createCatalogItem({catalogId});

                    catalogItemIds.push(catalogItem.id);
                },
                {concurrency: 2}
            );

            console.log(`[catalog item] created ${catalogItemIds.length} for ${i}/${catalogIds.length} catalogs`);
        },
        {concurrency: 20}
    );

    // storage
    await pMap(
        catalogItemIds,
        async (catalogItemId, i) => {
            const storage = await TestFactory.createStorage({catalogItemId});

            storageIds.push(storage.id);

            console.log(`[storage] created ${i}/${catalogItemIds.length}`);
        },
        {concurrency: 20}
    );

    // orders, order_poisition
    await pMap(
        range(0, MAX_ORDER_COUNT),
        async (_, i) => {
            const userId = userIds[random(0, MAX_USER_COUNT - 1)];
            const order = await TestFactory.createOrder({userId});

            await pMap(
                range(0, random(1, 3)),
                async () =>
                    TestFactory.createOrderPositionOne({
                        orderId: order.id,
                        petId: petIds[random(0, petIds.length - 1)],
                        goodId: goodIds[random(0, goodIds.length - 1)],
                        brandId: brandIds[random(0, brandIds.length - 1)],
                        storageId: storageIds[random(0, catalogItemIds.length - 1)],
                        catalogId: catalogIds[random(0, catalogIds.length - 1)],
                        catalogItemId: catalogItemIds[random(0, catalogItemIds.length - 1)]
                    }),
                {concurrency: 3}
            );

            console.log(`[order] created ${i}/${MAX_ORDER_COUNT}`);
        },
        {concurrency: 10}
    );
}

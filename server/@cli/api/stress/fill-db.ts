import fs from 'fs';
import pMap from 'p-map';
import {random, range} from 'lodash';
import {TestFactory} from 'tests/test-factory';

const MAX_BRAND_COUNT = 200;
const MAX_USER_COUNT = 10000;
const MAX_CATALOG_COUNT = 10000;
const MAX_ORDER_COUNT = 100000;

// 1M строк - 100%

// /api/v1
// -- /catalog
// ---- [10%] GET /dictionary
// ---- [25%] GET /item/:public_id
// -- /sms
// ---- [1% БД, 1% новых] POST /send_code {phone}
// ---- [1%] POST /verify_code {phone,code}
// -- /order
// ---- [5%] GET /:public_id
// ---- [2%] DELETE /:public_id
// ---- [2%] POST /check_cart {goods: [{publicId,qunatity,cost}]}
// ---- [2%] POST /create {phone,delivery:{address,date(unix),comment},goods:[{publicId,qunatity,cos}]}
// -- /search
// ---- [21%] POST /base {limit,offset,petCode,brandCode,goodCode,cost:{min,max}}
// ---- [30%] GET /full_text ? query

export async function handle() {
    const requests: string[] = [];

    const petIds: number[] = [];
    const goodIds: number[] = [];
    const brandIds: number[] = [];
    const userIds: number[] = [];
    const catalogIds: number[] = [];
    const catalogItemIds: number[] = [];
    const storageIds: number[] = [];
    const orderIds: number[] = [];

    // brand, good, pet
    await pMap(
        range(0, MAX_BRAND_COUNT),
        async () => {
            const brand = await TestFactory.createBrand();
            const good = await TestFactory.createGoodCategory();
            const pet = await TestFactory.createPetCategory();

            petIds.push(pet.id);
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

            if (i % 1000 === 0 || i === MAX_USER_COUNT - 1) {
                console.log(`[users] created ${i}/${MAX_USER_COUNT}`);
            }
        },
        {concurrency: 10}
    );

    // catalog
    await pMap(
        range(0, MAX_CATALOG_COUNT),
        async (_, i) => {
            const index = [
                random(0, MAX_BRAND_COUNT - 1),
                random(0, MAX_BRAND_COUNT - 1),
                random(0, MAX_BRAND_COUNT - 1)
            ];
            const catalog = await TestFactory.createCatalog({
                petCategoryId: petIds[index[0]],
                goodCategoryId: petIds[index[1]],
                brandId: petIds[index[2]]
            });

            catalogIds.push(catalog.id);

            if (i % 1000 === 0 || i === MAX_CATALOG_COUNT - 1) {
                console.log(`[catalog] created ${i}/${MAX_CATALOG_COUNT}`);
            }
        },
        {concurrency: 10}
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

            if (i % 1000 === 0 || i === catalogIds.length - 1) {
                console.log(`[catalog item] created ${catalogItemIds.length} for ${i}/${catalogIds.length} catalogs`);
            }
        },
        {concurrency: 10}
    );

    // storage
    await pMap(
        catalogItemIds,
        async (catalogItemId, i) => {
            const storage = await TestFactory.createStorage({catalogItemId});

            storageIds.push(storage.id);

            if (i % 1000 === 0 || i === catalogItemIds.length - 1) {
                console.log(`[storage] created ${i}/${catalogItemIds.length}`);
            }
        },
        {concurrency: 20}
    );

    // orders, order_poisition
    await pMap(
        range(0, MAX_ORDER_COUNT),
        async (_, i) => {
            const order = await TestFactory.createOrder({
                userId: userIds[random(0, MAX_USER_COUNT - 1)]
            });

            await pMap(
                range(0, random(2, 3)),
                async () => {
                    await TestFactory.createOrderPositionOne({
                        orderId: order.id,
                        petId: petIds[random(0, MAX_BRAND_COUNT - 1)],
                        goodId: goodIds[random(0, MAX_BRAND_COUNT - 1)],
                        brandId: brandIds[random(0, MAX_BRAND_COUNT - 1)],
                        storageId: storageIds[random(0, catalogItemIds.length - 1)],
                        catalogId: catalogIds[random(0, MAX_CATALOG_COUNT - 1)],
                        catalogItemId: catalogItemIds[random(0, catalogItemIds.length - 1)]
                    });
                },
                {concurrency: 2}
            );

            orderIds.push(order.id);

            if (i % 1000 === 0 || i === MAX_ORDER_COUNT - 1) {
                console.log(`[order] created ${i}/${MAX_ORDER_COUNT}`);
            }
        },
        {concurrency: 20}
    );

    await fs.promises.writeFile('/tmp/ammo.txt', requests.join('\n'));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import faker from 'faker';
import slugify from 'slugify';
import pMap from 'p-map';

import {dbManager} from 'app/lib/db-manager';
import {
    Brand,
    Order,
    Catalog,
    CatalogItem,
    GoodCategory,
    PetCategory,
    OrderPosition,
    Storage,
    User
} from '$db-entity/entities';
import {OrderStatus, OrderResolution} from '$db-entity/order';
import {DbTable} from '$db-entity/tables';

async function createBrand() {
    const name = faker.name.title() + Math.random();
    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(Brand);

    const brand = manager.create(Brand, {
        code: slugify(name),
        displayName: name
    });

    await manager.save(brand);

    return manager.findOneOrFail(Brand, brand.id);
}

interface CreatePetParams {
    code?: string;
}

async function createPetCategory(params: CreatePetParams = {}) {
    const name = faker.name.title() + Math.random();
    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(PetCategory);

    const pet = manager.create(PetCategory, {
        code: params.code || slugify(name),
        displayName: name
    });

    await manager.save(pet);

    return manager.findOneOrFail(PetCategory, pet.id);
}

async function createGoodCategory() {
    const name = faker.name.title() + Math.random();
    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(GoodCategory);

    const good = manager.create(GoodCategory, {
        code: slugify(name),
        displayName: name
    });

    await manager.save(good);

    return manager.findOneOrFail(GoodCategory, good.id);
}

interface CreateCatalogParams {
    goodCategoryId: number;
    petCategoryId: number;
    brandId: number;
}

async function createCatalog(params: CreateCatalogParams) {
    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(Catalog);

    const catalog = manager.create(Catalog, {
        goodCategoryId: params.goodCategoryId,
        petCategoryId: params.petCategoryId,
        brandId: params.brandId,
        displayName: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        rating: faker.random.float() % 5,
        manufacturerCountry: faker.address.country()
    });

    await manager.save(catalog);

    return manager.findOneOrFail(Catalog, catalog.id);
}

interface CreateCatalogItemParams {
    catalogId: number;
}

async function createCatalogItem(params: CreateCatalogItemParams) {
    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(CatalogItem);

    const catalogItem = manager.create(CatalogItem, {
        catalogId: params.catalogId,
        weightKg: faker.random.float() % 30,
        photoUrls: [faker.image.image()]
    });

    await manager.save(catalogItem);

    return manager.findOneOrFail(CatalogItem, catalogItem.id);
}

interface CreateOrderParams {
    status?: OrderStatus;
    resolution?: OrderResolution;
    userId?: number;
}

async function createOrder(params: CreateOrderParams = {}) {
    const user = await TestFactory.createUser();
    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(Order);

    const order = manager.create(Order, {
        data: {},
        userId: params.userId || user.id,
        clientPhone: faker.phone.phoneNumber(),
        deliveryAddress: faker.address.streetAddress(),
        deliveryComment: faker.lorem.text(),
        deliveryDate: faker.date.future(),
        status: params.status || OrderStatus.CREATED,
        resolution: params.resolution
    });

    await manager.save(order);

    return manager.findOneOrFail(Order, order.id);
}

interface CreateStorageParams {
    catalogItemId: number;
}

async function createStorage(params: CreateStorageParams) {
    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(Storage);

    const storage = manager.create(Storage, {
        catalogItemId: params.catalogItemId,
        cost: faker.random.float(),
        quantity: faker.random.number()
    });

    await manager.save(storage);

    return manager.findOneOrFail(Storage, storage.id);
}

interface CreateOrderPositionParams {
    orderId: number;
}

interface CreateOrderPositionOneParams {
    orderId: number;
    brandId: number;
    goodId: number;
    petId: number;
    catalogId: number;
    catalogItemId: number;
    storageId: number;
}

async function createOrderPositionOne(params: CreateOrderPositionOneParams) {
    const connection = await dbManager.getConnection();

    const {manager: orderPositionManager} = connection.getRepository(OrderPosition);
    const {manager: storageManager} = connection.getRepository(Storage);
    const {manager: goodManager} = connection.getRepository(GoodCategory);
    const {manager: petManager} = connection.getRepository(PetCategory);
    const {manager: brandManager} = connection.getRepository(Brand);
    const {manager: catalogManager} = connection.getRepository(Catalog);
    const {manager: catalogItemManager} = connection.getRepository(CatalogItem);

    const [storageItem, brand, pet, good, catalog, catalogItem] = await Promise.all([
        storageManager.findOneOrFail(Storage, params.storageId),
        brandManager.findOneOrFail(Brand, params.brandId),
        petManager.findOneOrFail(PetCategory, params.petId),
        goodManager.findOneOrFail(GoodCategory, params.goodId),
        catalogManager.findOneOrFail(Catalog, params.catalogId),
        catalogItemManager.findOneOrFail(CatalogItem, params.catalogItemId)
    ]);

    const orderPosition = orderPositionManager.create(OrderPosition, {
        orderId: params.orderId,
        cost: faker.random.float(),
        quantity: faker.random.number(),
        data: {
            storage: {
                id: storageItem.id,
                cost: storageItem.cost,
                quantity: storageItem.quantity,
                createdAt: storageItem.createdAt.toISOString(),
                updatedAt: storageItem.updatedAt.toISOString()
            },
            catalog: {
                id: catalog.id,
                displayName: catalog.displayName,
                description: catalog.description,
                rating: catalog.rating,
                manufacturerCountry: catalog.manufacturerCountry,
                brand: {
                    code: brand.code,
                    name: brand.displayName
                },
                pet: {
                    code: pet.code,
                    name: pet.displayName
                },
                good: {
                    code: good.code,
                    name: good.displayName
                },
                createdAt: catalog.createdAt.toISOString(),
                updatedAt: catalog.updatedAt.toISOString()
            },
            catalogItem: {
                id: catalogItem.id,
                publicId: catalogItem.publicId,
                photoUrls: catalogItem.photoUrls,
                weightKg: catalogItem.weightKg,
                createdAt: catalogItem.createdAt.toISOString(),
                updatedAt: catalogItem.updatedAt.toISOString()
            }
        }
    });

    await orderPositionManager.save(orderPosition);

    return orderPositionManager.findOneOrFail(OrderPosition, orderPosition.id);
}

async function createOrderPosition(params: CreateOrderPositionParams) {
    const connection = await dbManager.getConnection();

    const brand = await TestFactory.createBrand();
    const pet = await TestFactory.createPetCategory();
    const good = await TestFactory.createGoodCategory();

    const catalog = await TestFactory.createCatalog({
        goodCategoryId: good.id,
        petCategoryId: pet.id,
        brandId: brand.id
    });

    const catalogItems = await Promise.all([
        TestFactory.createCatalogItem({catalogId: catalog.id}),
        TestFactory.createCatalogItem({catalogId: catalog.id})
    ]);

    const storageItems = await Promise.all(
        catalogItems.map((catalogItem) => TestFactory.createStorage({catalogItemId: catalogItem.id}))
    );

    const orderPositions = await pMap(catalogItems, async (catalogItem, i) => {
        const {manager} = connection.getRepository(OrderPosition);

        const orderPosition = manager.create(OrderPosition, {
            orderId: params.orderId,
            cost: faker.random.float(),
            quantity: faker.random.number(),
            data: {
                storage: {
                    id: storageItems[i].id,
                    cost: storageItems[i].cost,
                    quantity: storageItems[i].quantity,
                    createdAt: storageItems[i].createdAt.toISOString(),
                    updatedAt: storageItems[i].updatedAt.toISOString()
                },
                catalog: {
                    id: catalog.id,
                    displayName: catalog.displayName,
                    description: catalog.description,
                    rating: catalog.rating,
                    manufacturerCountry: catalog.manufacturerCountry,
                    brand: {
                        code: brand.code,
                        name: brand.displayName
                    },
                    pet: {
                        code: pet.code,
                        name: pet.displayName
                    },
                    good: {
                        code: good.code,
                        name: good.displayName
                    },
                    createdAt: catalog.createdAt.toISOString(),
                    updatedAt: catalog.updatedAt.toISOString()
                },
                catalogItem: {
                    id: catalogItem.id,
                    publicId: catalogItem.publicId,
                    photoUrls: catalogItem.photoUrls,
                    weightKg: catalogItem.weightKg,
                    createdAt: catalogItem.createdAt.toISOString(),
                    updatedAt: catalogItem.updatedAt.toISOString()
                }
            }
        });

        await manager.save(orderPosition);

        return manager.findOneOrFail(OrderPosition, orderPosition.id);
    });

    return orderPositions;
}

async function createUser() {
    const connection = await dbManager.getConnection();
    const {manager} = connection.getRepository(User);

    const user = manager.create(User, {
        phone: [faker.random.number(), faker.random.number(), faker.random.number()].join('')
    });

    await manager.save(user);

    return manager.findOneOrFail(User, user.id);
}

async function getAllUsers() {
    const connection = await dbManager.getConnection();

    return connection.createQueryBuilder().select(DbTable.USER).from(User, DbTable.USER).getMany();
}

async function getAllStorageItems() {
    const connection = await dbManager.getConnection();

    return connection.createQueryBuilder().select(DbTable.STORAGE).from(Storage, DbTable.STORAGE).getMany();
}

async function getAllOrders() {
    const connection = await dbManager.getConnection();

    return connection.createQueryBuilder().select(DbTable.ORDER).from(Order, DbTable.ORDER).getMany();
}

async function getRandomCatalogItem() {
    const connection = await dbManager.getConnection();

    return connection
        .createQueryBuilder()
        .select(DbTable.CATALOG_ITEM)
        .from(CatalogItem, DbTable.CATALOG_ITEM)
        .orderBy('RANDOM()')
        .limit(1)
        .getOneOrFail();
}

async function getRandomUser() {
    const connection = await dbManager.getConnection();

    return connection
        .createQueryBuilder()
        .select(DbTable.USER)
        .from(User, DbTable.USER)
        .orderBy('RANDOM()')
        .limit(1)
        .getOneOrFail();
}

async function getRandomOrder() {
    const connection = await dbManager.getConnection();

    return connection
        .createQueryBuilder()
        .select(DbTable.ORDER)
        .from(Order, DbTable.ORDER)
        .orderBy('RANDOM()')
        .limit(1)
        .getOneOrFail();
}

async function getRandomStorageItem(limit = 1) {
    const connection = await dbManager.getConnection();

    return connection
        .getRepository(Storage)
        .createQueryBuilder(DbTable.STORAGE)
        .innerJoinAndSelect(`${DbTable.STORAGE}.catalogItem`, DbTable.CATALOG_ITEM)
        .orderBy('RANDOM()')
        .limit(limit)
        .getMany();
}

async function getRandomDictionary() {
    const connection = await dbManager.getConnection();

    return Promise.all([
        connection
            .createQueryBuilder()
            .select(DbTable.PET_CATEGORY)
            .from(PetCategory, DbTable.PET_CATEGORY)
            .orderBy('RANDOM()')
            .limit(1)
            .getOneOrFail(),
        connection
            .createQueryBuilder()
            .select(DbTable.GOOD_CATEGORY)
            .from(GoodCategory, DbTable.GOOD_CATEGORY)
            .orderBy('RANDOM()')
            .limit(1)
            .getOneOrFail(),
        connection
            .createQueryBuilder()
            .select(DbTable.BRAND)
            .from(Brand, DbTable.BRAND)
            .orderBy('RANDOM()')
            .limit(1)
            .getOneOrFail()
    ]);
}

export const TestFactory = {
    createBrand,
    createPetCategory,
    createGoodCategory,
    createCatalog,
    createCatalogItem,
    createOrder,
    createOrderPosition,
    createOrderPositionOne,
    createStorage,
    createUser,
    getAllStorageItems,
    getAllOrders,
    getAllUsers,
    // random
    getRandomCatalogItem,
    getRandomDictionary,
    getRandomUser,
    getRandomOrder,
    getRandomStorageItem
};

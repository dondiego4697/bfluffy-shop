"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFactory = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const faker_1 = __importDefault(require("faker"));
const slugify_1 = __importDefault(require("slugify"));
const p_map_1 = __importDefault(require("p-map"));
const got_1 = __importDefault(require("got"));
const db_manager_1 = require("../app/lib/db-manager");
const entities_1 = require("../db-entity/entities");
const order_1 = require("../db-entity/order");
const tables_1 = require("../db-entity/tables");
async function createBrand() {
    const name = faker_1.default.name.title() + Math.random();
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(entities_1.Brand);
    const brand = manager.create(entities_1.Brand, {
        code: slugify_1.default(name),
        displayName: name
    });
    await manager.save(brand);
    return manager.findOneOrFail(entities_1.Brand, brand.id);
}
async function createPetCategory() {
    const name = faker_1.default.name.title() + Math.random();
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(entities_1.PetCategory);
    const pet = manager.create(entities_1.PetCategory, {
        code: slugify_1.default(name),
        displayName: name
    });
    await manager.save(pet);
    return manager.findOneOrFail(entities_1.PetCategory, pet.id);
}
async function createGoodCategory() {
    const name = faker_1.default.name.title() + Math.random();
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(entities_1.GoodCategory);
    const good = manager.create(entities_1.GoodCategory, {
        code: slugify_1.default(name),
        displayName: name
    });
    await manager.save(good);
    return manager.findOneOrFail(entities_1.GoodCategory, good.id);
}
async function createCatalog(params) {
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(entities_1.Catalog);
    const catalog = manager.create(entities_1.Catalog, {
        goodCategoryId: params.goodCategoryId,
        petCategoryId: params.petCategoryId,
        brandId: params.brandId,
        displayName: faker_1.default.commerce.productName(),
        description: faker_1.default.commerce.productDescription(),
        rating: faker_1.default.random.float() % 5,
        manufacturerCountry: faker_1.default.address.country()
    });
    await manager.save(catalog);
    return manager.findOneOrFail(entities_1.Catalog, catalog.id);
}
async function createCatalogItem(params) {
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(entities_1.CatalogItem);
    const catalogItem = manager.create(entities_1.CatalogItem, {
        catalogId: params.catalogId,
        weight: faker_1.default.random.float() % 30,
        photoUrls: [faker_1.default.image.image()]
    });
    await manager.save(catalogItem);
    return manager.findOneOrFail(entities_1.CatalogItem, catalogItem.id);
}
async function createOrder(params = {}) {
    const { manager } = db_manager_1.dbManager.getConnection().getRepository(entities_1.Order);
    const order = manager.create(entities_1.Order, {
        data: {},
        clientPhone: faker_1.default.phone.phoneNumber(),
        deliveryAddress: faker_1.default.address.streetAddress(),
        deliveryComment: faker_1.default.lorem.text(),
        deliveryDate: faker_1.default.date.future(),
        status: params.status || order_1.OrderStatus.CREATED,
        resolution: params.resolution
    });
    await manager.save(order);
    return manager.findOneOrFail(entities_1.Order, order.id);
}
async function createStorage(params) {
    const connection = db_manager_1.dbManager.getConnection();
    const { manager } = connection.getRepository(entities_1.Storage);
    const storage = manager.create(entities_1.Storage, {
        catalogItemId: params.catalogItemId,
        cost: faker_1.default.random.float(),
        quantity: faker_1.default.random.number()
    });
    await manager.save(storage);
    return manager.findOneOrFail(entities_1.Storage, storage.id);
}
async function createOrderPosition(params) {
    const connection = db_manager_1.dbManager.getConnection();
    const brand = await exports.TestFactory.createBrand();
    const pet = await exports.TestFactory.createPetCategory();
    const good = await exports.TestFactory.createGoodCategory();
    const catalog = await exports.TestFactory.createCatalog({
        goodCategoryId: good.id,
        petCategoryId: pet.id,
        brandId: brand.id
    });
    const catalogItems = await Promise.all([
        exports.TestFactory.createCatalogItem({ catalogId: catalog.id }),
        exports.TestFactory.createCatalogItem({ catalogId: catalog.id })
    ]);
    const storageItems = await Promise.all(catalogItems.map((catalogItem) => exports.TestFactory.createStorage({ catalogItemId: catalogItem.id })));
    const orderPositions = await p_map_1.default(catalogItems, async (catalogItem, i) => {
        const { manager } = connection.getRepository(entities_1.OrderPosition);
        const orderPosition = manager.create(entities_1.OrderPosition, {
            orderId: params.orderId,
            cost: faker_1.default.random.float(),
            quantity: faker_1.default.random.number(),
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
                    weight: catalogItem.weight,
                    createdAt: catalogItem.createdAt.toISOString(),
                    updatedAt: catalogItem.updatedAt.toISOString()
                }
            }
        });
        await manager.save(orderPosition);
        return manager.findOneOrFail(entities_1.OrderPosition, orderPosition.id);
    });
    return orderPositions;
}
async function createUser(params = {}) {
    const connection = db_manager_1.dbManager.getConnection();
    const { manager } = connection.getRepository(entities_1.User);
    const user = manager.create(entities_1.User, {
        phone: String(faker_1.default.random.number()),
        lastSmsCode: faker_1.default.random.number(),
        lastSmsCodeAt: params.lastSmsCodeAt
    });
    await manager.save(user);
    return manager.findOneOrFail(entities_1.User, user.id);
}
async function getAllUsers() {
    return db_manager_1.dbManager.getConnection().createQueryBuilder().select(tables_1.DbTable.USER).from(entities_1.User, tables_1.DbTable.USER).getMany();
}
async function getAllStorageItems() {
    return db_manager_1.dbManager
        .getConnection()
        .createQueryBuilder()
        .select(tables_1.DbTable.STORAGE)
        .from(entities_1.Storage, tables_1.DbTable.STORAGE)
        .getMany();
}
async function getAllOrders() {
    return db_manager_1.dbManager.getConnection().createQueryBuilder().select(tables_1.DbTable.ORDER).from(entities_1.Order, tables_1.DbTable.ORDER).getMany();
}
async function getCsrfToken(url) {
    const user = await exports.TestFactory.createUser();
    const { headers } = await got_1.default.post(`${url}/api/v1/sms/verify_code`, {
        responseType: 'json',
        throwHttpErrors: false,
        json: {
            phone: user.phone,
            code: user.lastSmsCode
        }
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = /csrf_token=(.+?);/gim.exec(headers['set-cookie'][0]);
    return result[1];
}
exports.TestFactory = {
    createBrand,
    createPetCategory,
    createGoodCategory,
    createCatalog,
    createCatalogItem,
    createOrder,
    createOrderPosition,
    createStorage,
    createUser,
    getAllStorageItems,
    getAllOrders,
    getAllUsers,
    getCsrfToken
};
//# sourceMappingURL=test-factory.js.map
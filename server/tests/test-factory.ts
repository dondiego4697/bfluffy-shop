import faker from 'faker';
import slugify from 'slugify';

import {dbManager} from 'app/lib/db-manager';
import {Brand, Catalog, GoodCategory, PetCategory} from '$db-entity/entities';

async function createBrand() {
    const name = faker.name.title() + Math.random();
    const {manager} = dbManager.getConnection().getRepository(Brand);

    const brand = manager.create(Brand, {
        code: slugify(name),
        displayName: name
    });

    await manager.save(brand);

    return manager.findOneOrFail(Brand, brand.id);
}

async function createPetCategory() {
    const name = faker.name.title() + Math.random();
    const {manager} = dbManager.getConnection().getRepository(PetCategory);

    const pet = manager.create(PetCategory, {
        code: slugify(name),
        displayName: name
    });

    await manager.save(pet);

    return manager.findOneOrFail(PetCategory, pet.id);
}

async function createGoodCategory() {
    const name = faker.name.title() + Math.random();
    const {manager} = dbManager.getConnection().getRepository(GoodCategory);

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
    const {manager} = dbManager.getConnection().getRepository(Catalog);

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

export const TestFactory = {
    createBrand,
    createPetCategory,
    createGoodCategory,
    createCatalog
};
